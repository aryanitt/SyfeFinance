export type CategoryType = 'INCOME' | 'EXPENSE';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Category {
  id?: number;
  name: string;
  type: CategoryType;
  isCustom?: boolean;
}

export interface Transaction {
  id: number;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryName: string;
  categoryType: CategoryType;
  description?: string;
}

export interface TransactionRequest {
  amount: number;
  date: string; // YYYY-MM-DD
  categoryName: string;
  description?: string;
}

export interface SavingsGoal {
  id: number;
  goalName: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  startDate: string;
  currentProgress: number;
  progressPercentage: number;
  remainingAmount: number;
}

export interface SavingsGoalRequest {
  goalName: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
}

export interface CategoryReport {
  categoryName: string;
  totalAmount: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  incomeByCategory: CategoryReport[];
  expenseByCategory: CategoryReport[];
}

export interface YearlyReport {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  monthlyBreakdown: MonthlyReport[];
}
