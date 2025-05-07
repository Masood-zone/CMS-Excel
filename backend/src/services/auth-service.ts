import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../db/repositories/user-repository";
import { config } from "../config";
import { ApiError } from "../utils/api-error";
import { prisma } from "../db/client";

export const authService = {
  signup: async (userData: {
    email: string;
    password: string;
    role: string;
    name: string;
    phone: string;
    gender: string;
  }) => {
    const { email, password, role, name, phone, gender } = userData;

    if (!email || !password || !role || !name || !phone || !gender) {
      throw new ApiError(400, "Missing required fields");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
      gender,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  login: async (credentials: { email: string; password: string }) => {
    const { email, password } = credentials;

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(400, "User not found!");
    }

    if (!user.password) {
      throw new ApiError(400, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: "2d" }
    );

    const assignedClass = await prisma.class.findFirst({
      where: { supervisorId: user.id },
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
      assigned_class: assignedClass,
    };
  },
};
