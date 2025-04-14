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

    // Get the last 90 days of records to ensure we capture all relevant owing history
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get all records for this student in the time period
    const allRecords = await prisma.record.findMany({
      where: {
        payedBy: id,
        submitedAt: {
          gte: ninetyDaysAgo,
        },
      },
      orderBy: {
        submitedAt: "desc",
      },
    });

    // Filter records to only include those that:
    // 1. Changed the owing amount (owingBefore != owingAfter)
    // 2. Had a payment made (amount > 0)
    // 3. Were marked as paid (hasPaid = true)
    const owingHistoryRecords = allRecords.filter(
      (record) =>
        record.owingBefore !== record.owingAfter || // Owing amount changed
        record.amount > 0 || // Payment was made
        record.hasPaid // Record was marked as paid
    );

    return {
      student,
      currentOwing: student.owing,
      owingHistory: owingHistoryRecords.map((record) => ({
        id: record.id,
        date: record.submitedAt,
        hasPaid: record.hasPaid,
        isAbsent: record.isAbsent,
        amountPaid: record.amount,
        owingBefore: record.owingBefore,
        owingAfter: record.owingAfter,
        settingsAmount: record.settingsAmount,
        // Add a description field to make the history more readable
        description: getOwingRecordDescription(record),
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

    // Calculate excess payment (if any)
    const excessPayment = currentOwing < amount ? amount - currentOwing : 0;

    // Create a payment record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get settings amount for reference
    const settings = await prisma.settings.findFirst({
      where: { name: "amount" },
    });
    const settingsAmount = settings ? Number.parseInt(settings.value) : 0;

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

    // Create a payment description that includes details about the payment
    const paymentDescription =
      excessPayment > 0
        ? `Payment of ${amount} GHC against owing of ${currentOwing} GHC (excess: ${excessPayment} GHC)`
        : `Payment of ${amount} GHC against owing of ${currentOwing} GHC`;

    if (existingRecord) {
      // Update existing record
      await prisma.record.update({
        where: { id: existingRecord.id },
        data: {
          amount: existingRecord.amount + amount,
          hasPaid: true,
          owingBefore: currentOwing,
          owingAfter: newOwingAmount,
          description: paymentDescription,
        },
      });
    } else {
      // Create new record for the payment
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
          description: paymentDescription,
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
      excessPayment: excessPayment,
      fullyPaid: newOwingAmount === 0,
    };
  },

  // New method to get owing students by class ID
  getOwingStudentsByClassId: async (classId: number) => {
    // Find all students in the specified class with owing > 0
    const owingStudents = await prisma.student.findMany({
      where: {
        classId,
        owing: {
          gt: 0,
        },
      },
      include: {
        class: true,
      },
      orderBy: {
        owing: "desc",
      },
    });

    // Calculate total owing amount for this class
    const totalOwing = owingStudents.reduce(
      (sum, student) => sum + student.owing,
      0
    );

    return {
      owingStudents,
      totalOwing,
      count: owingStudents.length,
    };
  },

  // New method to get all owing students
  getAllOwingStudents: async () => {
    return prisma.student.findMany({
      where: {
        owing: {
          gt: 0, // Only students with owing > 0
        },
      },
      orderBy: {
        owing: "desc", // Order by owing amount (highest first)
      },
      include: {
        class: true,
      },
    });
  },

  deleteStudent: async (id: number) => {
    return studentRepository.delete(id);
  },
};

// Helper function to generate a human-readable description of the owing record
function getOwingRecordDescription(record: {
  hasPaid: boolean;
  isAbsent: boolean;
  amount: number;
  owingBefore: number;
  owingAfter: number;
  settingsAmount?: number | null;
  description?: string | null;
}): string {
  // If the record has a custom description, use that
  if (record.description) {
    return record.description;
  }

  if (record.hasPaid && record.amount > 0) {
    if (record.owingBefore > record.owingAfter) {
      return `Payment of ${record.amount} against owing balance`;
    } else {
      return `Regular payment of ${record.amount}`;
    }
  } else if (record.isAbsent) {
    return "Marked as absent";
  } else if (record.owingAfter > record.owingBefore) {
    return `Owing increased by ${record.owingAfter - record.owingBefore}`;
  } else if (record.owingBefore > record.owingAfter) {
    return `Owing decreased by ${record.owingBefore - record.owingAfter}`;
  } else {
    return "No change in owing amount";
  }
}
