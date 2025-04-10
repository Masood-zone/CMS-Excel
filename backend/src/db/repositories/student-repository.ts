import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const studentRepository = {
  findAll: async () => {
    return prisma.student.findMany({
      include: { class: true },
    });
  },

  findById: async (id: number) => {
    return prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });
  },

  findByClassId: async (classId: number) => {
    return prisma.student.findMany({
      where: { classId },
    });
  },

  create: async (data: Prisma.StudentCreateInput) => {
    return prisma.student.create({
      data,
    });
  },

  update: async (id: number, data: Prisma.StudentUpdateInput) => {
    return prisma.student.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.student.delete({
      where: { id },
    });
  },
};
