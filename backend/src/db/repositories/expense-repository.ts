import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const expenseRepository = {
  findAll: async (options?: {
    termId?: number;
    from?: string;
    to?: string;
    period?: string;
  }) => {
    const where: Prisma.ExpenseWhereInput = {};
    if (options?.termId) {
      where.termId = options.termId;
    }
    if (options?.from || options?.to) {
      where.date = {};
      if (options.from) (where.date as any).gte = new Date(options.from);
      if (options.to) (where.date as any).lte = new Date(options.to);
    }
    // Optionally, add period-based filtering here if needed
    return prisma.expense.findMany({
      where,
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

  create: async (data: Prisma.ExpenseCreateInput, termId?: number) => {
    return prisma.expense.create({
      data: {
        ...data,
        term: termId ? { connect: { id: termId } } : undefined,
      },
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
