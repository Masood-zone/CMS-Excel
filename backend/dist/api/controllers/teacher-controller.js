"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherController = void 0;
const teacher_service_1 = require("../../services/teacher-service");
const catch_async_1 = require("../../utils/catch-async");
const api_error_1 = require("../../utils/api-error");
exports.teacherController = {
    getAllTeachers: (0, catch_async_1.catchAsync)(async (req, res) => {
        const result = await teacher_service_1.teacherService.getAllTeachers();
        res.status(200).json(result);
    }),
    getTeachersById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        if (isNaN(id)) {
            throw new api_error_1.ApiError(400, "Invalid teacher ID");
        }
        const result = await teacher_service_1.teacherService.getTeacherById(id);
        res.status(200).json(result);
    }),
    getOwingStudentsInClass: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        if (isNaN(id)) {
            throw new api_error_1.ApiError(400, "Invalid teacher ID");
        }
        const result = await teacher_service_1.teacherService.getOwingStudentsInTeacherClass(id);
        res.json(result);
    }),
    getTeacherRecords: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        if (isNaN(id)) {
            throw new api_error_1.ApiError(400, "Invalid teacher ID");
        }
        const result = await teacher_service_1.teacherService.getTeacherRecords(id);
        res.json(result);
    }),
    createTeacher: (0, catch_async_1.catchAsync)(async (req, res) => {
        const result = await teacher_service_1.teacherService.createTeacher(req.body);
        res.status(201).json(result);
    }),
    updateTeacher: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        if (!parseInt(id)) {
            console.log("ID is a number", id);
            throw new api_error_1.ApiError(400, "Invalid teacher ID");
        }
        const result = await teacher_service_1.teacherService.updateTeacher(parseInt(id), req.body);
        res.json(result);
    }),
    deleteTeacher: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        if (isNaN(id)) {
            throw new api_error_1.ApiError(400, "Invalid teacher ID");
        }
        const result = await teacher_service_1.teacherService.deleteTeacher(id);
        res.json(result);
    }),
    getTeachersWithRecordsSummary: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { from, to } = req.query;
        if (!from || !to) {
            throw new api_error_1.ApiError(400, "Start and end dates are required");
        }
        const startDate = new Date(from);
        const endDate = new Date(to);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid date format");
        }
        const result = await teacher_service_1.teacherService.getTeachersWithRecordsSummary(startDate, endDate);
        res.status(200).json(result);
    }),
    getTeacherRecordsDetail: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { teacherId } = req.params;
        const { from, to } = req.query;
        if (!from || !to) {
            throw new api_error_1.ApiError(400, "Start and end dates are required");
        }
        const startDate = new Date(from);
        const endDate = new Date(to);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid date format");
        }
        const result = await teacher_service_1.teacherService.getTeacherRecordsDetail(Number.parseInt(teacherId), startDate, endDate);
        res.status(200).json(result);
    }),
    getClassBySupervisorId: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        if (isNaN(id)) {
            throw new api_error_1.ApiError(400, "Invalid supervisor ID");
        }
        const result = await teacher_service_1.teacherService.getClassBySupervisorId(id);
        res.json(result);
    }),
    resetPassword: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const { password } = req.body;
        const result = await teacher_service_1.teacherService.resetTeacherPassword(Number(id), password);
        res.status(200).json(result);
    }),
};
//# sourceMappingURL=teacher-controller.js.map