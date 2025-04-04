"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../db/repositories/user-repository");
const config_1 = require("../config");
const api_error_1 = require("../utils/api-error");
const client_1 = require("../db/client");
exports.authService = {
    signup: async (userData) => {
        const { email, password, role, name, phone, gender } = userData;
        if (!email || !password || !role || !name || !phone || !gender) {
            throw new api_error_1.ApiError(400, "Missing required fields");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_repository_1.userRepository.create({
            email,
            password: hashedPassword,
            role,
            name,
            phone,
            gender,
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return userWithoutPassword;
    },
    login: async (credentials) => {
        const { email, password } = credentials;
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new api_error_1.ApiError(400, "User not found!");
        }
        if (!user.password) {
            throw new api_error_1.ApiError(400, "Invalid credentials");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new api_error_1.ApiError(400, "Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, config_1.config.jwt.secret, { expiresIn: "2d" });
        const assignedClass = await client_1.prisma.class.findFirst({
            where: { supervisorId: user.id },
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return {
            token,
            user: userWithoutPassword,
            assigned_class: assignedClass,
        };
    },
};
//# sourceMappingURL=auth-service.js.map