import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const recordRepository = {
  findAll: async () => {
    return prisma.record.findMany();
  },

  findById: async (id: number) => {
    return prisma.record.findUnique({
      where: { id },
    });
  },

  create: async (data: Prisma.RecordCreateInput) => {
    return prisma.record.create({
      data,
      include: { student: true }, // Ensure student is returned
    });
  },

  update: async (id: number, data: Prisma.RecordUpdateInput) => {
    return prisma.record.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.record.delete({
      where: { id },
    });
  },

  findByClassAndDate: async (classId: number, date: Date) => {
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

  findByTeacherAndDate: async (teacherId: number, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.record.findMany({
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
  },

  findByTeacherId: async (teacherId: number) => {
    return prisma.record.findMany({
      where: { submitedBy: teacherId },
    });
  },

  updateStudentStatus: async (
    id: number,
    data: { hasPaid: boolean; isAbsent: boolean }
  ) => {
    return prisma.record.update({
      where: { id },
      data,
      include: { student: true },
    });
  },

  upsertRecord: async (
    payedBy: number,
    submitedAt: Date,
    data: {
      classId: number;
      amount: number;
      hasPaid: boolean;
      isAbsent: boolean;
      submitedBy: number;
      settingsAmount?: number;
    }
  ) => {
    return prisma.record.upsert({
      where: {
        payedBy_submitedAt: {
          payedBy,
          submitedAt,
        },
      },
      update: {
        amount: data.amount,
        hasPaid: data.hasPaid,
        isAbsent: data.isAbsent,
        submitedBy: data.submitedBy,
      },
      create: {
        classId: data.classId,
        payedBy,
        submitedAt,
        amount: data.amount,
        hasPaid: data.hasPaid,
        isAbsent: data.isAbsent,
        submitedBy: data.submitedBy,
        settingsAmount: data.settingsAmount || data.amount,
      },
    });
  },
};
