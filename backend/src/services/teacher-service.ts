import { userRepository } from "../db/repositories/user-repository";
import { recordRepository } from "../db/repositories/record-repository";
import { ApiError } from "../utils/api-error";
import { prisma } from "../db/client";
import bcrypt from "bcryptjs";

export const teacherService = {
  getAllTeachers: async () => {
    const teachers = await userRepository.findTeachers();
    return { teachers };
  },

  getTeacherById: async (id: number) => {
    const teacher = await userRepository.findById(id);
    if (!teacher || !["TEACHER", "Teacher"].includes(teacher.role)) {
      throw new ApiError(404, "Teacher not found");
    }
    return { teacher };
  },

  getTeacherRecords: async (id: number) => {
    const records = await recordRepository.findByTeacherId(id);
    if (records.length === 0) {
      throw new ApiError(404, "No records found for this teacher");
    }
    return { data: records };
  },

  createTeacher: async (teacherData: {
    email: string;
    name: string;
    phone: string;
    gender: string;
    password?: string;
  }) => {
    const { email, name, phone, gender, password } = teacherData;

    if (!name || !phone || !gender) {
      throw new ApiError(400, "Name, gender, and phone are required");
    }

    const newTeacher = await userRepository.create({
      email,
      name,
      phone,
      role: "TEACHER",
      gender,
      password,
    });

    return {
      status: "Teacher added successfully",
      data: newTeacher,
    };
  },
  getOwingStudentsInTeacherClass: async (teacherId: number) => {
    // First, find the class supervised by this teacher
    const teacherClass = await prisma.class.findFirst({
      where: { supervisorId: teacherId },
    });

    if (!teacherClass) {
      throw new ApiError(404, "No class found for this teacher");
    }

    // Then, find all students in this class who have owing > 0
    const owingStudents = await prisma.student.findMany({
      where: {
        classId: teacherClass.id,
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

    return {
      class: teacherClass,
      owingStudents,
      totalOwing: owingStudents.reduce(
        (sum, student) => sum + student.owing,
        0
      ),
      count: owingStudents.length,
    };
  },

  updateTeacher: async (
    id: number,
    teacherData: {
      email?: string;
      name?: string;
      phone?: string;
      gender?: string;
      password?: string;
      assigned_class?: { id: number };
    }
  ) => {
    const { email, name, phone, gender, password, assigned_class } =
      teacherData;

    const updatedTeacher = await userRepository.update(id, {
      email,
      name,
      phone,
      gender,
      password,
      assigned_class: assigned_class
        ? {
            connect: { id: assigned_class.id },
          }
        : undefined,
    });

    if (!updatedTeacher) {
      throw new ApiError(404, "Teacher not found");
    }

    return {
      status: "Teacher updated successfully",
      data: updatedTeacher,
    };
  },

  deleteTeacher: async (id: number) => {
    const deletedTeacher = await userRepository.delete(id);

    if (!deletedTeacher) {
      throw new ApiError(404, "Teacher not found");
    }

    return {
      status: "Teacher deleted successfully",
    };
  },

  getTeachersWithRecordsSummary: async (startDate: Date, endDate: Date) => {
    const teacherRecords = await prisma.user.findMany({
      where: {
        role: { in: ["TEACHER", "Teacher"] },
      },
      select: {
        id: true,
        name: true,
        records: {
          where: {
            submitedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
          },
        },
      },
    });

    if (teacherRecords.length === 0) {
      throw new ApiError(404, "No records found for this teacher");
    }

    // Format the records to include the total amount
    const formattedRecords = teacherRecords.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      totalAmount: teacher.records.reduce(
        (
          sum: number,
          record: {
            amount: number;
          }
        ) => sum + record.amount,
        0
      ),
    }));

    return formattedRecords;
  },

  getTeacherRecordsDetail: async (
    teacherId: number,
    startDate: Date,
    endDate: Date
  ) => {
    const teacherRecords = await prisma.record.findMany({
      where: {
        submitedBy: teacherId,
        submitedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: true,
        class: true,
      },
      orderBy: {
        submitedAt: "asc",
      },
    });

    return teacherRecords;
  },

  getClassBySupervisorId: async (id: number) => {
    const classData = await prisma.class.findUnique({
      where: { id },
      select: {
        records: true,
        supervisorId: true,
        supervisor: true,
      },
    });

    if (!classData) {
      throw new ApiError(404, "Class not found");
    }

    const supervisor = await prisma.user.findUnique({
      where: { id: classData.supervisorId ?? undefined },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return { supervisor };
  },
  resetTeacherPassword: async (id: number, newPassword: string) => {
    if (!newPassword) {
      throw new ApiError(400, "New password is required");
    }

    // Check if teacher exists
    const teacher = await userRepository.findById(id, true);
    if (!teacher || !["TEACHER", "Teacher"].includes(teacher.role)) {
      throw new ApiError(404, "Teacher not found");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    const updatedTeacher = await userRepository.update(id, {
      password: hashedPassword,
    });

    if (!updatedTeacher) {
      throw new ApiError(500, "Failed to reset password");
    }

    return {
      status: "Password reset successfully",
      teacherId: id,
    };
  },
};
