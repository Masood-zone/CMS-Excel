"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseService = void 0;
const expense_repository_1 = require("../db/repositories/expense-repository");
const api_error_1 = require("../utils/api-error");
exports.expenseService = {
    getAllExpenses: async () => {
        return expense_repository_1.expenseRepository.findAll();
    },
    getExpenseById: async (id) => {
        const expense = await expense_repository_1.expenseRepository.findById(id);
        if (!expense) {
            throw new api_error_1.ApiError(404, "Expense not found");
        }
        return expense;
    },
    createExpense: async (expenseData) => {
        const { references, amount, date, description, submittedBy } = expenseData;
        const amountData = typeof amount === "string" ? Number.parseFloat(amount) : amount;
        if (isNaN(amountData)) {
            throw new api_error_1.ApiError(400, "Invalid amount: must be a number");
        }
        return expense_repository_1.expenseRepository.create({
            amount: amountData,
            date: date ? new Date(date) : new Date(),
            description,
            submitedBy: submittedBy,
            reference: {
                connect: {
                    id: references.id,
                },
            },
        });
    },
    updateExpense: async (id, expenseData) => {
        const { references, amount, date, description, submittedBy } = expenseData;
        const amountData = typeof amount === "string" ? Number.parseFloat(amount) : amount;
        if (isNaN(amountData)) {
            throw new api_error_1.ApiError(400, "Invalid amount: must be a number");
        }
        return expense_repository_1.expenseRepository.update(id, {
            amount: amountData,
            date: date ? new Date(date) : new Date(),
            description,
            submitedBy: submittedBy,
            reference: {
                connect: {
                    id: references.id,
                },
            },
        });
    },
    deleteExpense: async (id) => {
        return expense_repository_1.expenseRepository.delete(id);
    },
};
//# sourceMappingURL=expense-service.js.map