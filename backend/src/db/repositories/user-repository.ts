import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const userRepository = {
  findAll: async (options?: { role?: string }) => {
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
      where: options?.role ? { role: { in: [options.role] } } : undefined,
    });
  },

  findById: async (id: number, includePassword = false) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        gender: true,
        password: includePassword,
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
      data,
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

  findTeachers: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        gender: true,
        assigned_class: true,
      },
      where: { role: { in: ["Teacher", "TEACHER"] } },
    });
  },
};
