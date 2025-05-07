import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const classRepository = {
  findAll: async () => {
    return prisma.class.findMany();
  },

  findById: async (id: number) => {
    return prisma.class.findUnique({
      where: { id },
      include: { supervisor: true, students: true },
    });
  },

  findBySupervisorId: async (supervisorId: number) => {
    return prisma.class.findFirst({
      where: { supervisorId },
    });
  },

  create: async (data: Prisma.ClassCreateInput) => {
    return prisma.class.create({
      data,
    });
  },

  update: async (id: number, data: Prisma.ClassUpdateInput) => {
    return prisma.class.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.class.delete({
      where: { id },
    });
  },

  assignTeacher: async (name: string, teacherId: number) => {
    return prisma.class.update({
      where: { name },
      data: {
        supervisorId: teacherId,
      },
    });
  },
};
