import { userRepository } from "../db/repositories/user-repository";
import { ApiError } from "../utils/api-error";

export const userService = {
  getAllUsers: async () => {
    return userRepository.findAll();
  },

  getUserById: async (id: number) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  },

  updateUser: async (
    id: number,
    userData: {
      email?: string;
      name?: string;
      phone?: string;
      role?: string;
      gender?: string;
    }
  ) => {
    const { email, name, phone, role, gender } = userData;

    return userRepository.update(id, {
      email,
      name,
      phone,
      role,
      gender,
    });
  },

  deleteUser: async (id: number) => {
    return userRepository.delete(id);
  },
};
