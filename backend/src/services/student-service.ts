import { studentRepository } from "../db/repositories/student-repository";
import { generateRecordsForNewStudent } from "./record-generation-service";
import { ApiError } from "../utils/api-error";
import { prisma } from "../db/client";

export const studentService = {
  getAllStudents: async () => {
    return studentRepository.findAll();
  },

  getStudentById: async (id: number) => {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    return student;
  },

  getStudentsByClassId: async (classId: number) => {
    return studentRepository.findByClassId(classId);
  },

  createStudent: async (studentData: {
    name: string;
    age: string | number;
    parentPhone?: string;
    gender?: string;
    classId?: number;
  }) => {
    const { name, age, parentPhone, gender, classId } = studentData;

    const newStudent = await studentRepository.create({
      name,
      age: typeof age === "string" ? Number.parseInt(age) : age,
      parentPhone,
      gender,
      class: classId ? { connect: { id: classId } } : undefined,
    });

    // Generate records for the new student
    await generateRecordsForNewStudent(newStudent.id);

    return newStudent;
  },

  updateStudent: async (
    id: number,
    studentData: {
      name?: string;
      age?: string | number;
      parentPhone?: string;
      gender?: string;
    }
  ) => {
    const { name, age, parentPhone, gender } = studentData;

    return studentRepository.update(id, {
      name,
      age:
        age !== undefined
          ? typeof age === "string"
            ? Number.parseInt(age)
            : age
          : undefined,
      parentPhone,
      gender,
    });
  },

  getStudentOwingDetails: async (id: number) => {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Get the last 30 days of records to show owing history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await prisma.record.findMany({
      where: {
        payedBy: id,
        submitedAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        submitedAt: "desc",
      },
    });

    return {
      student,
      currentOwing: student.owing,
      owingHistory: records.map((record) => ({
        date: record.submitedAt,
        hasPaid: record.hasPaid,
        isAbsent: record.isAbsent,
        amountPaid: record.amount,
        owingBefore: record.owingBefore,
        owingAfter: record.owingAfter,
        settingsAmount: record.settingsAmount,
      })),
    };
  },
  payStudentOwing: async (id: number, amount: number) => {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    if (amount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than zero");
    }

    // Calculate new owing amount
    const currentOwing = student.owing;
    const newOwingAmount = Math.max(0, currentOwing - amount);

    // Create a payment record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a record for today
    const existingRecord = await prisma.record.findFirst({
      where: {
        payedBy: id,
        submitedAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingRecord) {
      // Update existing record
      await prisma.record.update({
        where: { id: existingRecord.id },
        data: {
          amount: existingRecord.amount + amount,
          hasPaid: true,
          owingBefore: currentOwing,
          owingAfter: newOwingAmount,
        },
      });
    } else {
      // Create new record for the payment
      const settings = await prisma.settings.findFirst({
        where: { name: "amount" },
      });
      const settingsAmount = settings ? Number.parseInt(settings.value) : 0;

      await prisma.record.create({
        data: {
          classId: student.classId,
          payedBy: student.id,
          submitedAt: today,
          amount: amount,
          hasPaid: true,
          isPrepaid: false,
          isAbsent: false,
          settingsAmount,
          submitedBy: student.classId
            ? (
                await prisma.class.findUnique({
                  where: { id: student.classId },
                })
              )?.supervisorId || 0
            : 0,
          owingBefore: currentOwing,
          owingAfter: newOwingAmount,
        },
      });
    }

    // Update student's owing amount
    await studentRepository.update(id, {
      owing: newOwingAmount,
    });

    return {
      student: {
        ...student,
        owing: newOwingAmount,
      },
      paymentAmount: amount,
      previousOwing: currentOwing,
      newOwing: newOwingAmount,
      fullyPaid: newOwingAmount === 0,
    };
  },

  deleteStudent: async (id: number) => {
    return studentRepository.delete(id);
  },
};
