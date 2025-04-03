import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const expenseRepository = {
  findAll: async () => {
    return prisma.expense.findMany({
      include: {
        reference: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  },

  findById: async (id: number) => {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        reference: true,
      },
    });
  },

  create: async (data: Prisma.ExpenseCreateInput) => {
    return prisma.expense.create({
      data,
      include: {
        reference: true,
      },
    });
  },

  update: async (id: number, data: Prisma.ExpenseUpdateInput) => {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        reference: true,
      },
    });
  },

  delete: async (id: number) => {
    return prisma.expense.delete({
      where: { id },
    });
  },
};
