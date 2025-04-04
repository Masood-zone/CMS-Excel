"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentService = void 0;
const student_repository_1 = require("../db/repositories/student-repository");
const record_generation_service_1 = require("./record-generation-service");
const api_error_1 = require("../utils/api-error");
exports.studentService = {
    getAllStudents: async () => {
        return student_repository_1.studentRepository.findAll();
    },
    getStudentById: async (id) => {
        const student = await student_repository_1.studentRepository.findById(id);
        if (!student) {
            throw new api_error_1.ApiError(404, "Student not found");
        }
        return student;
    },
    getStudentsByClassId: async (classId) => {
        return student_repository_1.studentRepository.findByClassId(classId);
    },
    createStudent: async (studentData) => {
        const { name, age, parentPhone, gender, classId } = studentData;
        const newStudent = await student_repository_1.studentRepository.create({
            name,
            age: typeof age === "string" ? Number.parseInt(age) : age,
            parentPhone,
            gender,
            class: classId ? { connect: { id: classId } } : undefined,
        });
        await (0, record_generation_service_1.generateRecordsForNewStudent)(newStudent.id);
        return newStudent;
    },
    updateStudent: async (id, studentData) => {
        const { name, age, parentPhone, gender } = studentData;
        return student_repository_1.studentRepository.update(id, {
            name,
            age: age !== undefined
                ? typeof age === "string"
                    ? Number.parseInt(age)
                    : age
                : undefined,
            parentPhone,
            gender,
        });
    },
    deleteStudent: async (id) => {
        return student_repository_1.studentRepository.delete(id);
    },
};
//# sourceMappingURL=student-service.js.map