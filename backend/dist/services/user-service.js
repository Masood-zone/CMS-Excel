"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_repository_1 = require("../db/repositories/user-repository");
const api_error_1 = require("../utils/api-error");
exports.userService = {
    getAllUsers: async () => {
        return user_repository_1.userRepository.findAll();
    },
    getUserById: async (id) => {
        const user = await user_repository_1.userRepository.findById(id);
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        return user;
    },
    updateUser: async (id, userData) => {
        const { email, name, phone, role, gender } = userData;
        return user_repository_1.userRepository.update(id, {
            email,
            name,
            phone,
            role,
            gender,
        });
    },
    deleteUser: async (id) => {
        return user_repository_1.userRepository.delete(id);
    },
};
//# sourceMappingURL=user-service.js.map