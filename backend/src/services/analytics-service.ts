import { prisma } from "../db/client";

export const analyticsService = {
  getAdminAnalytics: async () => {
    const [totalTeachers, totalStudents, totalClasses, settingsAmount] =
      await Promise.all([
        prisma.user.count({
          where: { role: { in: ["TEACHER", "Teacher"] } },
        }),
        prisma.student.count(),
        prisma.class.count(),
        prisma.settings.findFirst({
          where: { name: "amount" },
          select: { value: true },
        }),
      ]);

    const amount = settingsAmount ? Number.parseInt(settingsAmount.value) : 0;
    const totalCollections = totalStudents * amount;

    return {
      totalTeachers,
      totalStudents,
      totalCollections,
      totalClasses,
    };
  },

  getTeacherAnalytics: async (classId: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [settingsAmount, totalStudents, paidStudents, unpaidStudents] =
      await Promise.all([
        prisma.settings.findFirst({
          where: { name: "amount" },
          select: { value: true },
        }),
        prisma.student.count({
          where: { classId },
        }),
        prisma.record.count({
          where: {
            classId,
            submitedAt: { gte: today },
            hasPaid: true,
          },
        }),
        prisma.record.count({
          where: {
            classId,
            submitedAt: { gte: today },
            hasPaid: false,
          },
        }),
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
    };
  },
};
