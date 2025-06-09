"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordController = void 0;
const record_service_1 = require("../../services/record-service");
const catch_async_1 = require("../../utils/catch-async");
const api_error_1 = require("../../utils/api-error");
exports.recordController = {
    getAllRecords: (0, catch_async_1.catchAsync)(async (req, res) => {
        const records = await record_service_1.recordService.getAllRecords();
        res.status(200).json(records);
    }),
    getDashboardSummary: (0, catch_async_1.catchAsync)(async (req, res) => {
        const summary = await record_service_1.recordService.getDashboardSummary();
        res.status(200).json(summary);
    }),
    generateDailyRecords: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = req.params.classId
            ? Number.parseInt(req.params.classId)
            : undefined;
        const date = new Date(req.query.date);
        if (isNaN(date.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid date");
        }
        const result = await record_service_1.recordService.generateDailyRecords({ classId, date });
        res.status(200).json(Object.assign({ message: "Daily records generated successfully" }, result));
    }),
    getByClassAndDate: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = Number.parseInt(req.params.classId);
        const date = new Date(req.query.date);
        if (isNaN(classId) || isNaN(date.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid classId or date");
        }
        const records = await record_service_1.recordService.getRecordsByClass(classId, date);
        res.status(200).json(records);
    }),
    getStudentRecordsByClassAndDate: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classId = Number.parseInt(req.params.classId);
        const date = new Date(req.query.date);
        if (isNaN(classId) || isNaN(date.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid classId or date");
        }
        const records = await record_service_1.recordService.getStudentRecordsByClassAndDate(classId, date);
        res.status(200).json(records);
    }),
    getAllTeacherSubmittedRecords: (0, catch_async_1.catchAsync)(async (req, res) => {
        const date = new Date(req.query.date);
        if (isNaN(date.getTime())) {
            throw new api_error_1.ApiError(400, "Date is required and must be a valid date");
        }
        const records = await record_service_1.recordService.getAllTeacherSubmittedRecords(date);
        res.json(records);
    }),
    getTeacherSubmittedRecords: (0, catch_async_1.catchAsync)(async (req, res) => {
        const teacherId = Number.parseInt(req.params.teacherId);
        const date = new Date(req.query.date);
        if (isNaN(teacherId) || isNaN(date.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid teacherId or date");
        }
        const records = await record_service_1.recordService.getTeacherSubmittedRecords(teacherId, date);
        res.status(200).json(records);
    }),
    submitTeacherRecord: (0, catch_async_1.catchAsync)(async (req, res) => {
        const updatedRecords = await record_service_1.recordService.submitTeacherRecord(req.body);
        res.status(201).json(updatedRecords);
    }),
    updateStudentStatus: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const { hasPaid, isAbsent, paymentAmount } = req.body;
        const updatedRecord = await record_service_1.recordService.updateStudentStatus(Number.parseInt(id), {
            hasPaid,
            isAbsent,
            paymentAmount: paymentAmount
                ? Number.parseFloat(paymentAmount)
                : undefined,
        });
        res.status(200).json(updatedRecord);
    }),
    bulkUpdateStudentStatus: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { records } = req.body;
        if (!Array.isArray(records) || records.length === 0) {
            throw new api_error_1.ApiError(400, "Invalid request: records must be a non-empty array");
        }
        const updatedRecords = await record_service_1.recordService.bulkUpdateStudentStatus(records);
        res.status(200).json({
            message: `Successfully updated ${updatedRecords.length} records`,
            records: updatedRecords,
        });
    }),
    update: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const updatedRecord = await record_service_1.recordService.updateRecord(Number.parseInt(id), req.body);
        res.json(updatedRecord);
    }),
    delete: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        await record_service_1.recordService.deleteRecord(Number.parseInt(id));
        res.status(204).send();
    }),
};
//# sourceMappingURL=record-controller.js.map