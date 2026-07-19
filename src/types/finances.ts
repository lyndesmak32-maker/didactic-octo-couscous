import type { LucideIcon } from "lucide-react";

// ── Categories ──────────────────────────────────────────
export type ExpenseCategory =
  | "Housing"
  | "Food"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Healthcare"
  | "Shopping"
  | "Education"
  | "Personal"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Personal",
  "Other",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Housing: "#10b981",
  Food: "#f59e0b",
  Transport: "#6366f1",
  Utilities: "#06b6d4",
  Entertainment: "#ec4899",
  Healthcare: "#ef4444",
  Shopping: "#8b5cf6",
  Education: "#3b82f6",
  Personal: "#14b8a6",
  Other: "#6b7280",
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  Housing: "Housing",
  Food: "Food & Dining",
  Transport: "Transportation",
  Utilities: "Utilities",
  Entertainment: "Entertainment",
  Healthcare: "Healthcare",
  Shopping: "Shopping",
  Education: "Education",
  Personal: "Personal Care",
  Other: "Other",
};

// ── Income ───────────────────────────────────────────────
export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "biweekly" | "weekly" | "annually" | "once";
  category: string;
  notes?: string;
}

export type IncomeFrequency = IncomeSource["frequency"];

export const FREQUENCY_MULTIPLIER: Record<IncomeFrequency, number> = {
  monthly: 1,
  biweekly: 2.167,
  weekly: 4.333,
  annually: 1 / 12,
  once: 0,
};

// ── Expenses ─────────────────────────────────────────────
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date YYYY-MM-DD
  notes?: string;
}

// ── Budget ───────────────────────────────────────────────
export interface BudgetItem {
  category: ExpenseCategory;
  allocated: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  totalBudget: number;
  categories: BudgetItem[];
}

// ── Savings Goals ────────────────────────────────────────
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  deadline?: string; // ISO date
  createdAt: string;
  icon?: string;
}

// ── Bills & Subscriptions ────────────────────────────────
export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date YYYY-MM-DD
  frequency: "monthly" | "annually" | "weekly" | "quarterly";
  type: "bill" | "subscription";
  status: "paid" | "upcoming" | "overdue" | "due-today";
  autoPay: boolean;
  category?: string;
}

// ── Net Worth ────────────────────────────────────────────
export interface NetWorthData {
  assets: number;
  liabilities: number;
}

// ── Aggregate Store ──────────────────────────────────────
export interface FinanceData {
  incomes: IncomeSource[];
  expenses: Expense[];
  budgets: MonthlyBudget[];
  savingsGoals: SavingsGoal[];
  recurringBills: RecurringBill[];
  netWorth: NetWorthData;
}

// ── Computed / Display ───────────────────────────────────
export interface SpendingByCategory {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savingsRate: number;
}
