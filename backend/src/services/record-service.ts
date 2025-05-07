import { recordRepository } from "../db/repositories/record-repository";
import { settingsRepository } from "../db/repositories/settings-repository";
import { studentRepository } from "../db/repositories/student-repository";
import { classRepository } from "../db/repositories/class-repository";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/api-error";
import type { TeacherRecord } from "../types/record";
import { prisma } from "../db/client";
import { scheduleOwingUpdate } from "./owing-service";

export const recordService = {
  getAllRecords: async () => {
    return recordRepository.findAll();
  },

  getDashboardSummary: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all records for today
    const records = await prisma.record.findMany({
      where: {
        submitedAt: {
          gte: today,
        },
      },
      include: {
        student: true,
        class: true,
      },
    });

    // Calculate summary statistics
    const paidStudents = records.filter((record) => record.hasPaid);
    const unpaidStudents = records.filter(
      (record) => !record.hasPaid && !record.isAbsent
    );
    const absentStudents = records.filter((record) => record.isAbsent);

    const totalPaid = paidStudents.reduce(
      (sum, record) => sum + (record.settingsAmount || 0),
      0
    );
    const totalUnpaid = unpaidStudents.reduce(
      (sum, record) => sum + (record.settingsAmount || 0),
      0
    );
    const totalAmount = records.reduce(
      (sum, record) => sum + (record.settingsAmount || 0),
      0
    );

    return {
      summary: {
        totalAmount,
        totalStudents: records.length,
        totalPaid,
        totalUnpaid,
        paidStudentsCount: paidStudents.length,
        unpaidStudentsCount: unpaidStudents.length,
        absentStudentsCount: absentStudents.length,
      },
      records,
    };
  },

  generateDailyRecords: async (options: { classId?: number; date: Date }) => {
    const { classId, date } = options;
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    // Get the settings amount
    const settings = await settingsRepository.findByName("amount");
    const settingsAmount = settings ? Number.parseInt(settings.value) : 0;

    // Get classes based on the query
    const classes = classId
      ? [await classRepository.findById(classId)]
      : await classRepository.findAll();

    const createdRecords = [];
    const skippedRecords = [];

    // Generate records for each student in each class
    for (const classItem of classes) {
      if (!classItem) continue;

      const students = await studentRepository.findByClassId(classItem.id);

      for (const student of students) {
        try {
          const record = await recordRepository.create({
            class: { connect: { id: classItem.id } },
            student: { connect: { id: student.id } },
            submitedAt: formattedDate,
            amount: 0,
            hasPaid: false,
            isPrepaid: false,
            isAbsent: false,
            settingsAmount,
            teacher: { connect: { id: classItem.supervisorId || 0 } },
          });
          createdRecords.push(record);
        } catch (error) {
          // If a record already exists for this student on this day, skip it
          if (
            (error as Prisma.PrismaClientKnownRequestError).code === "P2002"
          ) {
            skippedRecords.push({
              studentId: student.id,
              date: formattedDate.toString(),
            });
          } else {
            throw error;
          }
        }
      }
    }

    return {
      createdRecords: createdRecords.length,
      skippedRecords,
    };
  },

  getRecordsByClass: async (classId: number, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const studentsInClass = await studentRepository.findByClassId(classId);

      const settings = await settingsRepository.findByName("amount");
      const settingsAmount = settings ? Number.parseInt(settings.value) : 0;

      const existingRecords = await recordRepository.findByClassAndDate(
        classId,
        date
      );

      const recordMap = new Map(
        existingRecords.map((record) => [record.payedBy, record])
      );

      const allRecords = await Promise.all(
        studentsInClass.map(async (student) => {
          let record = recordMap.get(student.id);
          if (!record) {
            try {
              record = await recordRepository.create({
                class: { connect: { id: classId } },
                student: { connect: { id: student.id } },
                submitedAt: startOfDay,
                amount: 0,
                hasPaid: false,
                isPrepaid: false,
                isAbsent: false,
                settingsAmount,
                teacher: { connect: { id: classId } },
              });
            } catch (error) {
              if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
              ) {
                // If the record already exists (due to unique constraint violation), fetch it
                const foundRecord = await prisma.record.findFirst({
                  where: {
                    classId,
                    payedBy: student.id,
                    submitedAt: {
                      gte: startOfDay,
                      lte: endOfDay,
                    },
                  },
                  include: { student: true },
                });
                record = foundRecord || undefined;
              } else {
                console.error(
                  `Failed to create/fetch record for student ${student.id}:`,
                  error
                );
                return null;
              }
            }
          }
          return record;
        })
      );

      const validRecords = allRecords.filter(
        (record): record is NonNullable<typeof record> => record !== null
      );
      const unpaidStudents = validRecords.filter(
        (record) => !record.hasPaid && !record.isAbsent
      );
      const paidStudents = validRecords.filter((record) => record.hasPaid);
      const absentStudents = validRecords.filter((record) => record.isAbsent);

      return { unpaidStudents, paidStudents, absentStudents };
    } catch (error) {
      console.error("Error in getRecordsByClass:", error);
      throw error;
    }
  },

  getStudentRecordsByClassAndDate: async (classId: number, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.record.findMany({
      where: {
        classId,
        submitedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { student: true },
    });
  },

  getAllTeacherSubmittedRecords: async (date: Date) => {
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    const records = await prisma.record.findMany({
      where: {
        submitedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        class: true,
        student: true,
        teacher: true,
      },
    });

    const formattedRecords = records.reduce((acc, record) => {
      // Skip records where classId is null
      if (record.classId === null) {
        return acc;
      }

      // Ensure the classId exists in the accumulator
      if (!acc[record.classId]) {
        acc[record.classId] = {
          classId: record.classId,
          date: record.submitedAt.toISOString().split("T")[0],
          paidStudents: [],
          unpaidStudents: [],
          absentStudents: [],
          submittedBy: record.submitedBy,
          teacher: {
            id: record.teacher?.id || 0,
            name: record.teacher?.name || "",
          },
          class: {
            id: record.class?.id || 0,
            name: record.class?.name || "",
          },
        };
      }

      const studentRecord = {
        id: record.payedBy || 0,
        amount: record.settingsAmount || 0,
        paidBy: record.payedBy?.toString() || "",
        hasPaid: record.hasPaid || false,
        date: record.submitedAt.toISOString().split("T")[0],
        name: record.student?.name || "",
        class: record.class?.name || "",
      };

      if (record.isAbsent) {
        acc[record.classId]?.absentStudents?.push({
          ...studentRecord,
          amount_owing: record.settingsAmount || 0,
        });
      } else if (record.hasPaid) {
        acc[record.classId]?.paidStudents?.push(studentRecord);
      } else {
        acc[record.classId]?.unpaidStudents?.push(studentRecord);
      }

      return acc;
    }, {} as Record<number, TeacherRecord>);

    return Object.values(formattedRecords);
  },

  getTeacherSubmittedRecords: async (teacherId: number, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const submittedRecords = await prisma.record.findMany({
      where: {
        submitedBy: teacherId,
        submitedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        class: true,
        student: true,
      },
    });

    const groupedRecords = submittedRecords.reduce(
      (acc: { [key: number]: any }, record) => {
        if (record.classId !== null && !acc[record.classId]) {
          acc[record.classId] = {
            id: record.id,
            date: record.submitedAt,
            class: record.class,
            paidStudents: [],
            unpaidStudents: [],
            absentStudents: [],
          };
        }

        if (record.isAbsent) {
          if (record.classId !== null) {
            acc[record.classId].absentStudents.push(record);
          }
        } else if (record.hasPaid) {
          if (record.classId !== null) {
            acc[record.classId].paidStudents.push(record);
          }
        } else {
          if (record.classId !== null) {
            acc[record.classId].unpaidStudents.push(record);
          }
        }

        return acc;
      },
      {}
    );

    return Object.values(groupedRecords);
  },

  submitTeacherRecord: async (recordData: {
    classId: number;
    date: string;
    unpaidStudents: Array<{
      paidBy: string;
      amount?: number;
      amount_owing?: number;
      hasPaid: boolean;
    }>;
    paidStudents: Array<{
      paidBy: string;
      amount?: number;
      amount_owing?: number;
      hasPaid: boolean;
    }>;
    absentStudents: Array<{
      paidBy: string;
      amount?: number;
      amount_owing?: number;
      hasPaid: boolean;
    }>;
    submittedBy: number;
  }) => {
    const {
      classId,
      date,
      unpaidStudents,
      paidStudents,
      absentStudents,
      submittedBy,
    } = recordData;

    if (
      !classId ||
      !date ||
      !submittedBy ||
      !Array.isArray(unpaidStudents) ||
      !Array.isArray(paidStudents) ||
      !Array.isArray(absentStudents)
    ) {
      throw new ApiError(400, "Invalid input data");
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid date");
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const allStudents = [...unpaidStudents, ...paidStudents, ...absentStudents];

    // Get settings amount for today
    const settings = await prisma.settings.findFirst({
      where: { name: "amount" },
    });
    const settingsAmount = settings ? Number.parseInt(settings.value) : 0;

    // Process each student record but don't update owing amounts yet
    const updatedRecords = [];
    const studentsToUpdate = [];

    for (const student of allStudents) {
      const studentId = Number.parseInt(student.paidBy);
      const isAbsent = absentStudents.some((s) => s.paidBy === student.paidBy);
      const hasPaid = student.hasPaid;
      const amount = student.amount || student.amount_owing || 0;

      // Get current student data with owing amount
      const currentStudent = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!currentStudent) continue;

      const currentOwing = currentStudent.owing;

      // Create or update the record without changing the owing amount yet
      const record = await prisma.record.upsert({
        where: {
          payedBy_submitedAt: {
            payedBy: studentId,
            submitedAt: startOfDay,
          },
        },
        update: {
          amount: amount,
          hasPaid: hasPaid,
          isAbsent: isAbsent,
          submitedBy: submittedBy,
          owingBefore: currentOwing,
          owingAfter: currentOwing, // Initially the same as owingBefore
        },
        create: {
          classId: Number.parseInt(classId.toString()),
          payedBy: studentId,
          submitedAt: startOfDay,
          amount: amount,
          hasPaid: hasPaid,
          isAbsent: isAbsent,
          submitedBy: submittedBy,
          settingsAmount: settingsAmount,
          owingBefore: currentOwing,
          owingAfter: currentOwing, // Initially the same as owingBefore
        },
      });

      updatedRecords.push(record);

      // Add to list of students to update owing after 1 minutes
      if (!hasPaid && !isAbsent) {
        studentsToUpdate.push({
          studentId,
          recordId: record.id,
          currentOwing,
          settingsAmount,
        });
      }
    }

    // Schedule owing updates for #1 minute later
    if (studentsToUpdate.length > 0) {
      scheduleOwingUpdate(studentsToUpdate, 1 * 60 * 1000); // #1 minute in milliseconds
    }

    return updatedRecords;
  },

  updateStudentStatus: async (
    id: number,
    statusData: {
      hasPaid: boolean;
      isAbsent: boolean;
      paymentAmount?: number; // Optional payment amount for partial payments
    }
  ) => {
    const { hasPaid, isAbsent, paymentAmount } = statusData;

    if (typeof hasPaid !== "boolean" || typeof isAbsent !== "boolean") {
      throw new ApiError(400, "Invalid input data");
    }

    // Get the record
    const record = await recordRepository.findById(id);
    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    // Get the student
    const student = await studentRepository.findById(record.payedBy || 0);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Get settings amount
    const settings = await prisma.settings.findFirst({
      where: { name: "amount" },
    });
    const settingsAmount = settings
      ? Number.parseInt(settings.value)
      : record.settingsAmount || 0;

    // Calculate the current owing amount
    const currentOwing = student.owing;
    let amountPaid = 0;

    if (hasPaid) {
      // If payment is made
      if (paymentAmount !== undefined && paymentAmount > 0) {
        // Partial payment
        amountPaid = paymentAmount;
      } else {
        // Full payment for today
        amountPaid = settingsAmount;
      }
    }

    // Update the record without changing the owing amount yet
    const updatedRecord = await recordRepository.update(id, {
      hasPaid,
      isAbsent,
      amount: amountPaid,
      owingBefore: currentOwing,
      owingAfter: currentOwing, // Initially the same as owingBefore
    });

    // If changing to unpaid and not absent, schedule an owing update
    if (!hasPaid && !isAbsent) {
      scheduleOwingUpdate(
        [
          {
            studentId: student.id,
            recordId: id,
            currentOwing,
            settingsAmount,
          },
        ],
        1 * 60 * 1000 // 1 minute in milliseconds
      );
    } else if (record.hasPaid === false && record.isAbsent === false) {
      // If previously unpaid and not absent, but now paid or absent,
      // cancel any pending owing updates for this record
      // This would be implemented in the owing service
    }

    return updatedRecord;
  },

  bulkUpdateStudentStatus: async (
    recordsData: Array<{
      id: number;
      hasPaid: boolean;
      isAbsent: boolean;
      submitedBy?: number;
      date?: string;
    }>
  ) => {
    const updatedRecords: Array<
      Prisma.RecordGetPayload<{
        include: { student: true; class: true; teacher: true };
      }>
    > = [];
    const studentsToUpdate: Array<{
      studentId: number;
      recordId: number;
      currentOwing: number;
      settingsAmount: number;
    }> = [];

    // Process each record in a transaction
    await prisma.$transaction(async (tx) => {
      for (const recordData of recordsData) {
        const { id, hasPaid, isAbsent, submitedBy, date } = recordData;

        // Get the current record
        const currentRecord = await tx.record.findUnique({
          where: { id },
          include: { teacher: true, student: true, class: true },
        });

        if (!currentRecord) {
          console.warn(`Record with id ${id} not found, skipping`);
          continue;
        }

        // Get the student
        const student = await tx.student.findUnique({
          where: { id: currentRecord.payedBy || 0 },
        });

        if (!student) {
          console.warn(`Student for record ${id} not found, skipping`);
          continue;
        }

        const currentOwing = student.owing;

        // Get settings amount
        const settings = await tx.settings.findFirst({
          where: { name: "amount" },
        });
        const settingsAmount = settings
          ? Number.parseInt(settings.value)
          : currentRecord.settingsAmount || 0;

        // Calculate amount paid
        let amountPaid = 0;
        if (hasPaid) {
          // Full payment for today
          amountPaid = settingsAmount;
        }

        // Update the record
        const updatedRecord = await tx.record.update({
          where: { id },
          data: {
            hasPaid,
            isAbsent,
            amount: amountPaid,
            submitedBy: submitedBy || currentRecord.submitedBy,
            submitedAt: date ? new Date(date) : currentRecord.submitedAt,
            owingBefore: currentOwing,
            owingAfter: currentOwing, // Initially the same as owingBefore
          },
        });

        updatedRecords.push({
          ...updatedRecord,
          teacher: currentRecord.teacher || null,
          student: currentRecord.student || null,
          class: currentRecord.class || null,
        });

        // If changing to unpaid and not absent, schedule an owing update
        if (!hasPaid && !isAbsent) {
          studentsToUpdate.push({
            studentId: student.id,
            recordId: id,
            currentOwing,
            settingsAmount,
          });
        }
      }
    });

    // Schedule owing updates if needed
    if (studentsToUpdate.length > 0) {
      scheduleOwingUpdate(studentsToUpdate, 1 * 60 * 1000); // 1 minute in milliseconds
    }

    return updatedRecords;
  },

  updateRecord: async (
    id: number,
    recordData: {
      amount?: number | string;
      submitedBy?: number | string;
      payedBy?: number | string;
      isPrepaid?: boolean;
      hasPaid?: boolean;
      classId?: number | string;
      isAbsent?: boolean;
    }
  ) => {
    const {
      amount,
      submitedBy,
      payedBy,
      isPrepaid,
      hasPaid,
      classId,
      isAbsent,
    } = recordData;

    // Get the current record to check if status is changing
    const currentRecord = await recordRepository.findById(id);
    if (!currentRecord) {
      throw new ApiError(404, "Record not found");
    }

    // Update the record
    const updatedRecord = await recordRepository.update(id, {
      amount:
        amount !== undefined
          ? typeof amount === "string"
            ? Number.parseInt(amount)
            : amount
          : undefined,
      teacher:
        submitedBy !== undefined
          ? {
              connect: {
                id:
                  typeof submitedBy === "string"
                    ? Number.parseInt(submitedBy)
                    : submitedBy,
              },
            }
          : undefined,
      student:
        payedBy !== undefined
          ? {
              connect: {
                id:
                  typeof payedBy === "string"
                    ? Number.parseInt(payedBy)
                    : payedBy,
              },
            }
          : undefined,
      isPrepaid: isPrepaid !== undefined ? Boolean(isPrepaid) : undefined,
      hasPaid: hasPaid !== undefined ? Boolean(hasPaid) : undefined,
      class:
        classId !== undefined
          ? {
              connect: {
                id:
                  typeof classId === "string"
                    ? Number.parseInt(classId)
                    : classId,
              },
            }
          : undefined,
      isAbsent: isAbsent !== undefined ? Boolean(isAbsent) : undefined,
    });

    // If status changed to unpaid and not absent, schedule an owing update
    if (
      hasPaid !== undefined &&
      isAbsent !== undefined &&
      !hasPaid &&
      !isAbsent &&
      (currentRecord.hasPaid || currentRecord.isAbsent)
    ) {
      const student = await studentRepository.findById(
        currentRecord.payedBy || 0
      );
      if (student) {
        scheduleOwingUpdate(
          [
            {
              studentId: student.id,
              recordId: id,
              currentOwing: student.owing,
              settingsAmount: currentRecord.settingsAmount || 0,
            },
          ],
          1 * 60 * 1000 // 1 minutes in milliseconds
        );
      }
    }

    return updatedRecord;
  },

  deleteRecord: async (id: number) => {
    return recordRepository.delete(id);
  },
};
