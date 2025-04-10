import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const adminRepository = {
  findAllAdmins: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        gender: true,
        assigned_class: true,
      },
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
      },
    });
  },

  findById: async (id: number) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        gender: true,
        assigned_class: true,
      },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create: async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({
      data: {
        ...data,
        role: "SUPER_ADMIN",
      },
    });
  },

  update: async (id: number, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete: async (id: number) => {
    return prisma.user.delete({
      where: { id },
    });
  },
};
