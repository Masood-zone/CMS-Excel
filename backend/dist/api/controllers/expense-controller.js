"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseController = void 0;
const expense_service_1 = require("../../services/expense-service");
const reference_service_1 = require("../../services/reference-service");
const catch_async_1 = require("../../utils/catch-async");
exports.expenseController = {
    getAllExpenses: (0, catch_async_1.catchAsync)(async (req, res) => {
        const expenses = await expense_service_1.expenseService.getAllExpenses();
        res.status(200).json(expenses);
    }),
    getExpenseById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const expense = await expense_service_1.expenseService.getExpenseById(id);
        res.status(200).json(expense);
    }),
    createExpense: (0, catch_async_1.catchAsync)(async (req, res) => {
        const expense = await expense_service_1.expenseService.createExpense(req.body);
        res.status(201).json(expense);
    }),
    updateExpense: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const expense = await expense_service_1.expenseService.updateExpense(id, req.body);
        res.status(200).json(expense);
    }),
    deleteExpense: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await expense_service_1.expenseService.deleteExpense(id);
        res.status(204).end();
    }),
    getAllReferences: (0, catch_async_1.catchAsync)(async (req, res) => {
        const references = await reference_service_1.referenceService.getAllReferences();
        res.status(200).json(references);
    }),
    getReferenceById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const reference = await reference_service_1.referenceService.getReferenceById(id);
        res.status(200).json(reference);
    }),
    createReference: (0, catch_async_1.catchAsync)(async (req, res) => {
        const reference = await reference_service_1.referenceService.createReference(req.body);
        res.status(201).json(reference);
    }),
    updateReference: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const reference = await reference_service_1.referenceService.updateReference(id, req.body);
        res.status(200).json(reference);
    }),
    deleteReference: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await reference_service_1.referenceService.deleteReference(id);
        res.status(204).end();
    }),
};
//# sourceMappingURL=expense-controller.js.map