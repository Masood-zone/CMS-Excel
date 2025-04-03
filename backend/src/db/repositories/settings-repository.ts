import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const settingsRepository = {
  findByName: async (name: string) => {
    return prisma.settings.findFirst({
      where: { name },
    });
  },

  create: async (data: Prisma.SettingsCreateInput) => {
    return prisma.settings.create({
      data,
    });
  },

  update: async (name: string, value: string) => {
    return prisma.settings.updateMany({
      where: { name },
      data: { value },
    });
  },
};
