import { prisma } from "../db/client";

export const analyticsService = {
  getAdminAnalytics: async (termId?: number) => {
    // If no termId, get active term
    let term = null;
    if (!termId) {
      term = await prisma.term.findFirst({ where: { isActive: true } });
      termId = term?.id;
    }
    // If still no termId, fallback to all-time
    const expenseWhere = termId ? { termId } : {};
    const recordWhere = termId ? { termId } : {};
    const [
      totalTeachers,
      totalStudents,
      totalClasses,
      settingsAmount,
      expensesCount,
      totalExpenses,
      totalCollections,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: { in: ["TEACHER", "Teacher"] } },
      }),
      prisma.student.count(),
      prisma.class.count(),
      prisma.settings.findFirst({
        where: { name: "amount" },
        select: { value: true },
      }),
      prisma.expense.count({ where: expenseWhere }),
      prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
      prisma.record.aggregate({ where: recordWhere, _sum: { amount: true } }),
    ]);
    const amount = settingsAmount ? Number.parseInt(settingsAmount.value) : 0;
    const totalExpensesValue = totalExpenses._sum.amount || 0;
    const totalCollectionsValue = totalCollections._sum.amount || 0;
    return {
      totalTeachers,
      totalStudents,
      totalCollections: totalCollectionsValue,
      totalClasses,
      expenses: expensesCount,
      totalExpenses: totalExpensesValue,
      term:
        term ||
        (termId
          ? await prisma.term.findUnique({ where: { id: termId } })
          : null),
    };
  },

  getTeacherAnalytics: async (classId: number, termId?: number) => {
    // If no termId, get active term
    let term = null;
    if (!termId) {
      term = await prisma.term.findFirst({ where: { isActive: true } });
      termId = term?.id;
    }
    const recordWhere = termId ? { classId, termId } : { classId };
    const [settingsAmount, totalStudents, paidStudents, unpaidStudents] =
      await Promise.all([
        prisma.settings.findFirst({
          where: { name: "amount" },
          select: { value: true },
        }),
        prisma.student.count({ where: { classId } }),
        prisma.record.count({ where: { ...recordWhere, hasPaid: true } }),
        prisma.record.count({ where: { ...recordWhere, hasPaid: false } }),
      ]);
    const amount = settingsAmount ? Number.parseInt(settingsAmount.value) : 0;
    const totalAmount = totalStudents * amount;
    const paidAmount = paidStudents * amount;
    const unpaidAmount = unpaidStudents * amount;
    return {
      totalAmount,
      totalStudents,
      paidStudents: {
        count: paidStudents,
        amount: paidAmount,
      },
      unpaidStudents: {
        count: unpaidStudents,
        amount: unpaidAmount,
      },
      term:
        term ||
        (termId
          ? await prisma.term.findUnique({ where: { id: termId } })
          : null),
    };
  },

  // List analytics for all terms
  getAllTermsAnalytics: async () => {
    const terms = await prisma.term.findMany({
      orderBy: [{ year: "desc" }, { startDate: "desc" }],
    });
    const analytics = await Promise.all(
      terms.map(async (term) => {
        const data = await analyticsService.getAdminAnalytics(term.id);
        return { ...data, term };
      })
    );
    return analytics;
  },
};
