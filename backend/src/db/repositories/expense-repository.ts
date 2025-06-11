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
    // Period-based filtering
    const now = new Date();
    if (options?.period && options.period !== "all") {
      let from: Date | undefined;
      let to: Date | undefined = new Date(now);
      if (options.period === "week") {
        // Start of week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        from = new Date(now.setDate(diff));
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      } else if (options.period === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      } else if (options.period === "year") {
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }
      if (from && to) {
        where.date = { gte: from, lte: to };
      }
    } else if (options?.from || options?.to) {
      where.date = {};
      if (options.from) (where.date as any).gte = new Date(options.from);
      if (options.to) (where.date as any).lte = new Date(options.to);
    }
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
