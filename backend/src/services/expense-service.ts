import { expenseRepository } from "../db/repositories/expense-repository";
import { ApiError } from "../utils/api-error";

export const expenseService = {
  getAllExpenses: async () => {
    return expenseRepository.findAll();
  },

  getExpenseById: async (id: number) => {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }
    return expense;
  },

  createExpense: async (
    expenseData: {
      references: { id: number };
      amount: string | number;
      date?: string;
      description?: string;
      submittedBy: number;
    },
    termId?: number
  ) => {
    const { references, amount, date, description, submittedBy } = expenseData;
    const amountData =
      typeof amount === "string" ? Number.parseFloat(amount) : amount;

    if (isNaN(amountData)) {
      throw new ApiError(400, "Invalid amount: must be a number");
    }

    return expenseRepository.create(
      {
        amount: amountData,
        date: date ? new Date(date) : new Date(),
        description,
        submitedBy: submittedBy,
        reference: {
          connect: {
            id: references.id,
          },
        },
      },
      termId
    );
  },

  updateExpense: async (
    id: number,
    expenseData: {
      references: { id: number };
      amount: string | number;
      date?: string;
      description?: string;
      submittedBy: number;
    }
  ) => {
    const { references, amount, date, description, submittedBy } = expenseData;
    const amountData =
      typeof amount === "string" ? Number.parseFloat(amount) : amount;

    if (isNaN(amountData)) {
      throw new ApiError(400, "Invalid amount: must be a number");
    }

    return expenseRepository.update(id, {
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

  deleteExpense: async (id: number) => {
    return expenseRepository.delete(id);
  },
};
