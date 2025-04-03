import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const referenceRepository = {
  findAll: async () => {
    return prisma.reference.findMany();
  },

  findById: async (id: number) => {
    return prisma.reference.findUnique({
      where: { id },
    });
  },

  create: async (data: Prisma.ReferenceCreateInput) => {
    return prisma.reference.create({
      data,
    });
  },

  update: async (id: number, data: Prisma.ReferenceUpdateInput) => {
    return prisma.reference.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.reference.delete({
      where: { id },
    });
  },
};
