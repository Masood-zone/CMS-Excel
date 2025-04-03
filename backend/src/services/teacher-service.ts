import { userRepository } from "../db/repositories/user-repository";
import { recordRepository } from "../db/repositories/record-repository";
import { ApiError } from "../utils/api-error";
import { prisma } from "../db/client";

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
        Record: {
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
      totalAmount: teacher.Record.reduce(
        (sum, record) => sum + record.amount,
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
};
