import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const otpRepository = {
  findByCode: async (code: string) => {
    return prisma.otpCodes.findFirst({
      where: { code },
    });
  },

  findByUserId: async (userId: number) => {
    return prisma.otpCodes.findFirst({
      where: { userId },
    });
  },

  create: async (data: Prisma.OtpCodesCreateInput) => {
    return prisma.otpCodes.create({
      data,
    });
  },

  update: async (id: number, data: Prisma.OtpCodesUpdateInput) => {
    return prisma.otpCodes.update({
      where: { id },
      data,
    });
  },
};
