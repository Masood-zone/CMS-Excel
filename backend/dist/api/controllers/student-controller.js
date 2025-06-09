"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentController = void 0;
const student_service_1 = require("../../services/student-service");
const catch_async_1 = require("../../utils/catch-async");
const api_error_1 = require("../../utils/api-error");
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
    getOwingStudentsByClass: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = Number.parseInt(req.params.classId);
        const owingStudents = await student_service_1.studentService.getOwingStudentsByClassId(classId);
        res.json(owingStudents);
    }),
    getAllOwingStudents: (0, catch_async_1.catchAsync)(async (req, res) => {
        const owingStudents = await student_service_1.studentService.getAllOwingStudents();
        res.json(owingStudents);
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
    getStudentOwing: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const owingDetails = await student_service_1.studentService.getStudentOwingDetails(id);
        res.json(owingDetails);
    }),
    payStudentOwing: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const { amount } = req.body;
        if (!amount || isNaN(Number.parseFloat(amount))) {
            throw new api_error_1.ApiError(400, "Valid payment amount is required");
        }
        const result = await student_service_1.studentService.payStudentOwing(id, Number.parseFloat(amount));
        res.json(result);
    }),
    delete: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await student_service_1.studentService.deleteStudent(id);
        res.status(204).send();
    }),
};
//# sourceMappingURL=student-controller.js.map