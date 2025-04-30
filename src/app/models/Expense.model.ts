import { ExpenseCategory } from "../enums/ExpenseCategory.enum";

export interface Expense {
    expenseId: string;
    title: string;
    category: ExpenseCategory;
    tripId?: string;
    tax?: number;
    amount: number;
    currency: string;
    date: Date;
    paymentMethod?: string;
    location?: string;
    description?: string;
    customerId?: string;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
  }