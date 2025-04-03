import { recordRepository } from "../db/repositories/record-repository";
import { settingsRepository } from "../db/repositories/settings-repository";
import { studentRepository } from "../db/repositories/student-repository";
import { classRepository } from "../db/repositories/class-repository";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/api-error";
import type { TeacherRecord } from "../types/record";
import { prisma } from "../db/client";

export const recordService = {
  getAllRecords: async () => {
    return recordRepository.findAll();
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
      const settingsAmount = settings ? parseInt(settings.value) : 0;

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

    const updatedRecords = await prisma.$transaction(
      allStudents.map((student) =>
        prisma.record.upsert({
          where: {
            payedBy_submitedAt: {
              payedBy: parseInt(student.paidBy),
              submitedAt: startOfDay,
            },
          },
          update: {
            amount: student.amount || student.amount_owing || 0,
            hasPaid: student.hasPaid,
            isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
            submitedBy: submittedBy,
          },
          create: {
            classId: parseInt(classId.toString()),
            payedBy: parseInt(student.paidBy),
            submitedAt: startOfDay,
            amount: student.amount ?? student.amount_owing ?? 0,
            hasPaid: student.hasPaid,
            isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
            submitedBy: submittedBy,
            settingsAmount: student.amount || student.amount_owing,
          },
        })
      )
    );

    return updatedRecords;
  },

  updateStudentStatus: async (
    id: number,
    statusData: { hasPaid: boolean; isAbsent: boolean }
  ) => {
    const { hasPaid, isAbsent } = statusData;

    if (typeof hasPaid !== "boolean" || typeof isAbsent !== "boolean") {
      throw new ApiError(400, "Invalid input data");
    }

    return recordRepository.updateStudentStatus(id, { hasPaid, isAbsent });
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

    return recordRepository.update(id, {
      amount:
        amount !== undefined
          ? typeof amount === "string"
            ? parseInt(amount)
            : amount
          : undefined,
      submitedAt:
        submitedBy !== undefined
          ? typeof submitedBy === "string"
            ? new Date(submitedBy)
            : new Date(submitedBy)
          : undefined,
      // Removed 'payedBy' as it is not a valid property in 'RecordUpdateInput'
      isPrepaid: isPrepaid !== undefined ? Boolean(isPrepaid) : undefined,
      hasPaid: hasPaid !== undefined ? Boolean(hasPaid) : undefined,
      class:
        classId !== undefined
          ? {
              connect: {
                id: typeof classId === "string" ? parseInt(classId) : classId,
              },
            }
          : undefined,
      isAbsent: isAbsent !== undefined ? Boolean(isAbsent) : undefined,
    });
  },

  deleteRecord: async (id: number) => {
    return recordRepository.delete(id);
  },
};
