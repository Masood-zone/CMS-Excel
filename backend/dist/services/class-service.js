"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classService = void 0;
const class_repository_1 = require("../db/repositories/class-repository");
const user_repository_1 = require("../db/repositories/user-repository");
const api_error_1 = require("../utils/api-error");
exports.classService = {
    getAllClasses: async () => {
        return class_repository_1.classRepository.findAll();
    },
    getClassById: async (id) => {
        const classItem = await class_repository_1.classRepository.findById(id);
        if (!classItem) {
            throw new api_error_1.ApiError(404, "Class not found");
        }
        return classItem;
    },
    createClass: async (classData) => {
        const { name, description, supervisorId } = classData;
        return class_repository_1.classRepository.create({
            name,
            description,
            supervisor: supervisorId
                ? {
                    connect: {
                        id: typeof supervisorId === "string"
                            ? Number.parseInt(supervisorId)
                            : supervisorId,
                    },
                }
                : undefined,
        });
    },
    updateClass: async (id, classData) => {
        const { name, description, supervisorId } = classData;
        return class_repository_1.classRepository.update(id, {
            name,
            description,
            supervisor: supervisorId
                ? {
                    connect: {
                        id: typeof supervisorId === "string"
                            ? Number.parseInt(supervisorId)
                            : supervisorId,
                    },
                }
                : undefined,
        });
    },
    deleteClass: async (id) => {
        return class_repository_1.classRepository.delete(id);
    },
    assignTeacher: async (className, teacherEmail) => {
        if (!className || !teacherEmail) {
            throw new api_error_1.ApiError(400, "Class name and teacher email are required");
        }
        const teacher = await user_repository_1.userRepository.findByEmail(teacherEmail);
        if (!teacher) {
            throw new api_error_1.ApiError(404, "Teacher not found");
        }
        return class_repository_1.classRepository.assignTeacher(className, teacher.id);
    },
    getClassBySupervisorId: async (supervisorId) => {
        return class_repository_1.classRepository.findBySupervisorId(supervisorId);
    },
};
//# sourceMappingURL=class-service.js.map