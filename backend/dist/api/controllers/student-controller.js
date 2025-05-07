"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentController = void 0;
const student_service_1 = require("../../services/student-service");
const catch_async_1 = require("../../utils/catch-async");
exports.studentController = {
    getAll: (0, catch_async_1.catchAsync)(async (req, res) => {
        const students = await student_service_1.studentService.getAllStudents();
        res.json(students);
    }),
    getById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const student = await student_service_1.studentService.getStudentById(id);
        res.json(student);
    }),
    getClassById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = Number.parseInt(req.params.classId);
        const students = await student_service_1.studentService.getStudentsByClassId(classId);
        res.json(students);
    }),
    create: (0, catch_async_1.catchAsync)(async (req, res) => {
        const newStudent = await student_service_1.studentService.createStudent(req.body);
        res.status(201).json(newStudent);
    }),
    update: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const updatedStudent = await student_service_1.studentService.updateStudent(id, req.body);
        res.json(updatedStudent);
    }),
    delete: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await student_service_1.studentService.deleteStudent(id);
        res.status(204).send();
    }),
};
//# sourceMappingURL=student-controller.js.map