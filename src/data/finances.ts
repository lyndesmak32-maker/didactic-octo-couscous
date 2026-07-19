import type {
  FinanceData,
  IncomeSource,
  Expense,
  MonthlyBudget,
  SavingsGoal,
  RecurringBill,
  ExpenseCategory,
  SpendingByCategory,
  MonthlySummary,
} from "~/types/finances";
import {
  EXPENSE_CATEGORIES,
  FREQUENCY_MULTIPLIER,
} from "~/types/finances";

const STORAGE_KEY = "lifeos-finances";

// ── Seed Data ────────────────────────────────────────────
function createSeedData(): FinanceData {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const twoMonthsAgoStr = `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, "0")}`;

  const today = now.toISOString().split("T")[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const in3Days = new Date(now);
  in3Days.setDate(now.getDate() + 3);
  const in3DaysStr = in3Days.toISOString().split("T")[0];
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  return {
    incomes: [
      { id: "inc-1", name: "Primary Salary", amount: 7500, frequency: "monthly", category: "Employment" },
      { id: "inc-2", name: "Freelance Consulting", amount: 1200, frequency: "monthly", category: "Freelance" },
      { id: "inc-3", name: "Investment Dividends", amount: 350, frequency: "monthly", category: "Investments" },
      { id: "inc-4", name: "Rental Income", amount: 500, frequency: "monthly", category: "Real Estate" },
    ],
    expenses: [
      // This month
      { id: "exp-1", description: "Apartment Rent", amount: 2200, category: "Housing", date: `${thisMonth}-01` },
      { id: "exp-2", description: "Grocery Store", amount: 185.42, category: "Food", date: `${thisMonth}-03` },
      { id: "exp-3", description: "Electric Bill", amount: 138.75, category: "Utilities", date: `${thisMonth}-05` },
      { id: "exp-4", description: "Gas Station", amount: 62.3, category: "Transport", date: `${thisMonth}-05` },
      { id: "exp-5", description: "Restaurant - Italian", amount: 87.5, category: "Food", date: `${thisMonth}-07` },
      { id: "exp-6", description: "Netflix Subscription", amount: 15.99, category: "Entertainment", date: `${thisMonth}-08` },
      { id: "exp-7", description: "Spotify Premium", amount: 9.99, category: "Entertainment", date: `${thisMonth}-08` },
      { id: "exp-8", description: "Gym Membership", amount: 49.0, category: "Healthcare", date: `${thisMonth}-01` },
      { id: "exp-9", description: "Amazon Order", amount: 127.83, category: "Shopping", date: `${thisMonth}-10` },
      { id: "exp-10", description: "Phone Bill", amount: 85.0, category: "Utilities", date: `${thisMonth}-12` },
      { id: "exp-11", description: "Car Insurance", amount: 210.0, category: "Transport", date: `${thisMonth}-15` },
      { id: "exp-12", description: "Grocery Store", amount: 153.67, category: "Food", date: `${thisMonth}-15` },
      { id: "exp-13", description: "Coffee Shop", amount: 4.75, category: "Food", date: `${thisMonth}-16` },
      { id: "exp-14", description: "Doctor Copay", amount: 35.0, category: "Healthcare", date: `${thisMonth}-17` },
      { id: "exp-15", description: "Internet Bill", amount: 79.99, category: "Utilities", date: `${thisMonth}-18` },
      // Last month
      { id: "exp-16", description: "Apartment Rent", amount: 2200, category: "Housing", date: `${lastMonthStr}-01` },
      { id: "exp-17", description: "Grocery Store", amount: 210.3, category: "Food", date: `${lastMonthStr}-05` },
      { id: "exp-18", description: "Electric Bill", amount: 142.5, category: "Utilities", date: `${lastMonthStr}-05` },
      { id: "exp-19", description: "Restaurant", amount: 95.0, category: "Food", date: `${lastMonthStr}-10` },
      { id: "exp-20", description: "Clothing", amount: 185.0, category: "Shopping", date: `${lastMonthStr}-12` },
      { id: "exp-21", description: "Gas Station", amount: 58.4, category: "Transport", date: `${lastMonthStr}-15` },
      // Two months ago
      { id: "exp-22", description: "Apartment Rent", amount: 2200, category: "Housing", date: `${twoMonthsAgoStr}-01` },
      { id: "exp-23", description: "Grocery Store", amount: 195.8, category: "Food", date: `${twoMonthsAgoStr}-03` },
      { id: "exp-24", description: "Electric Bill", amount: 155.2, category: "Utilities", date: `${twoMonthsAgoStr}-05` },
      { id: "exp-25", description: "Restaurant", amount: 78.5, category: "Food", date: `${twoMonthsAgoStr}-10` },
    ],
    budgets: [
      {
        month: thisMonth,
        totalBudget: 5000,
        categories: [
          { category: "Housing", allocated: 2200 },
          { category: "Food", allocated: 800 },
          { category: "Transport", allocated: 500 },
          { category: "Utilities", allocated: 350 },
          { category: "Entertainment", allocated: 200 },
          { category: "Healthcare", allocated: 300 },
          { category: "Shopping", allocated: 300 },
          { category: "Education", allocated: 100 },
          { category: "Personal", allocated: 150 },
          { category: "Other", allocated: 100 },
        ],
      },
    ],
    savingsGoals: [
      {
        id: "goal-1",
        name: "Emergency Fund",
        targetAmount: 15000,
        currentAmount: 8500,
        monthlyContribution: 1000,
        createdAt: `${now.getFullYear() - 1}-01-15`,
        icon: "🛡️",
      },
      {
        id: "goal-2",
        name: "Summer Vacation",
        targetAmount: 5000,
        currentAmount: 3200,
        monthlyContribution: 500,
        deadline: `${now.getFullYear()}-08-01`,
        createdAt: `${now.getFullYear()}-02-01`,
        icon: "✈️",
      },
      {
        id: "goal-3",
        name: "New MacBook Pro",
        targetAmount: 2500,
        currentAmount: 1800,
        monthlyContribution: 300,
        createdAt: `${now.getFullYear()}-04-01`,
        icon: "💻",
      },
      {
        id: "goal-4",
        name: "House Down Payment",
        targetAmount: 60000,
        currentAmount: 22000,
        monthlyContribution: 1500,
        deadline: `${now.getFullYear() + 3}-06-01`,
        createdAt: `${now.getFullYear() - 1}-06-01`,
        icon: "🏠",
      },
    ],
    recurringBills: [
      { id: "bill-1", name: "Electric Bill", amount: 138.75, dueDate: today, frequency: "monthly", type: "bill", status: "due-today", autoPay: false },
      { id: "bill-2", name: "Internet", amount: 79.99, dueDate: tomorrowStr, frequency: "monthly", type: "bill", status: "upcoming", autoPay: true },
      { id: "bill-3", name: "Car Insurance", amount: 210.0, dueDate: in3DaysStr, frequency: "monthly", type: "bill", status: "upcoming", autoPay: false },
      { id: "bill-4", name: "Credit Card Payment", amount: 450.0, dueDate: yesterdayStr, frequency: "monthly", type: "bill", status: "overdue", autoPay: false },
      { id: "bill-5", name: "Netflix", amount: 15.99, dueDate: `${thisMonth}-15`, frequency: "monthly", type: "subscription", status: "paid", autoPay: true, category: "Entertainment" },
      { id: "bill-6", name: "Spotify", amount: 9.99, dueDate: `${thisMonth}-08`, frequency: "monthly", type: "subscription", status: "paid", autoPay: true, category: "Entertainment" },
      { id: "bill-7", name: "Rent", amount: 2200, dueDate: `${thisMonth}-01`, frequency: "monthly", type: "bill", status: "paid", autoPay: true },
      { id: "bill-8", name: "Phone Bill", amount: 85.0, dueDate: `${thisMonth}-20`, frequency: "monthly", type: "bill", status: "upcoming", autoPay: true },
      { id: "bill-9", name: "Gym Membership", amount: 49.0, dueDate: `${thisMonth}-25`, frequency: "monthly", type: "subscription", status: "upcoming", autoPay: true, category: "Healthcare" },
      { id: "bill-10", name: "iCloud Storage", amount: 2.99, dueDate: `${thisMonth}-10`, frequency: "monthly", type: "subscription", status: "paid", autoPay: true, category: "Other" },
      { id: "bill-11", name: "Amazon Prime", amount: 139.0, dueDate: `${now.getFullYear()}-11-15`, frequency: "annually", type: "subscription", status: "upcoming", autoPay: true, category: "Shopping" },
    ],
    netWorth: {
      assets: 125000,
      liabilities: 45000,
    },
  };
}

// ── Persistence ──────────────────────────────────────────
function loadData(): FinanceData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FinanceData;
  } catch {
    // corrupted data, reset
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: FinanceData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Memoized singleton in module scope (browser only) ────
let _cache: FinanceData | null = null;
function getData(): FinanceData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

// ── ID Generator ─────────────────────────────────────────
let _idCounter = 100;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: Incomes ──────────────────────────────────
export function getIncomes(): IncomeSource[] {
  return getData().incomes;
}

export function addIncome(data: Omit<IncomeSource, "id">): IncomeSource {
  const store = getData();
  const income: IncomeSource = { ...data, id: genId("inc") };
  store.incomes.push(income);
  persist();
  return income;
}

export function updateIncome(id: string, data: Partial<Omit<IncomeSource, "id">>): void {
  const store = getData();
  const idx = store.incomes.findIndex((i) => i.id === id);
  if (idx === -1) return;
  store.incomes[idx] = { ...store.incomes[idx], ...data };
  persist();
}

export function deleteIncome(id: string): void {
  const store = getData();
  store.incomes = store.incomes.filter((i) => i.id !== id);
  persist();
}

export function getTotalMonthlyIncome(): number {
  const store = getData();
  return store.incomes.reduce((sum, inc) => {
    return sum + inc.amount * (FREQUENCY_MULTIPLIER[inc.frequency] ?? 0);
  }, 0);
}

// ── Public API: Expenses ─────────────────────────────────
export function getExpenses(month?: string): Expense[] {
  const all = getData().expenses;
  if (!month) return all;
  return all.filter((e) => e.date.startsWith(month));
}

export function addExpense(data: Omit<Expense, "id">): Expense {
  const store = getData();
  const expense: Expense = { ...data, id: genId("exp") };
  store.expenses.push(expense);
  persist();
  return expense;
}

export function updateExpense(id: string, data: Partial<Omit<Expense, "id">>): void {
  const store = getData();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return;
  store.expenses[idx] = { ...store.expenses[idx], ...data };
  persist();
}

export function deleteExpense(id: string): void {
  const store = getData();
  store.expenses = store.expenses.filter((e) => e.id !== id);
  persist();
}

export function getTotalMonthlyExpenses(month?: string): number {
  const expenses = month ? getExpenses(month) : getData().expenses;
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getSpendingByCategory(month?: string): SpendingByCategory[] {
  const expenses = month ? getExpenses(month) : getData().expenses;
  const totals = new Map<ExpenseCategory, number>();
  let grandTotal = 0;

  for (const e of expenses) {
    const prev = totals.get(e.category) ?? 0;
    totals.set(e.category, prev + e.amount);
    grandTotal += e.amount;
  }

  return EXPENSE_CATEGORIES.filter((cat) => totals.has(cat)).map((cat) => ({
    category: cat,
    amount: totals.get(cat)!,
    percentage: grandTotal > 0 ? (totals.get(cat)! / grandTotal) * 100 : 0,
  }));
}

// ── Public API: Budgets ──────────────────────────────────
export function getBudget(month?: string): MonthlyBudget | undefined {
  const store = getData();
  const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  return store.budgets.find((b) => b.month === targetMonth);
}

export function setBudget(budget: MonthlyBudget): void {
  const store = getData();
  const idx = store.budgets.findIndex((b) => b.month === budget.month);
  if (idx === -1) {
    store.budgets.push(budget);
  } else {
    store.budgets[idx] = budget;
  }
  persist();
}

export function getBudgetSpent(month?: string): number {
  return getTotalMonthlyExpenses(month);
}

// ── Public API: Savings Goals ────────────────────────────
export function getSavingsGoals(): SavingsGoal[] {
  return getData().savingsGoals;
}

export function addSavingsGoal(data: Omit<SavingsGoal, "id" | "createdAt">): SavingsGoal {
  const store = getData();
  const goal: SavingsGoal = {
    ...data,
    id: genId("goal"),
    createdAt: new Date().toISOString().split("T")[0],
  };
  store.savingsGoals.push(goal);
  persist();
  return goal;
}

export function updateSavingsGoal(id: string, data: Partial<Omit<SavingsGoal, "id" | "createdAt">>): void {
  const store = getData();
  const idx = store.savingsGoals.findIndex((g) => g.id === id);
  if (idx === -1) return;
  store.savingsGoals[idx] = { ...store.savingsGoals[idx], ...data };
  persist();
}

export function deleteSavingsGoal(id: string): void {
  const store = getData();
  store.savingsGoals = store.savingsGoals.filter((g) => g.id !== id);
  persist();
}

// ── Public API: Bills ────────────────────────────────────
export function getRecurringBills(): RecurringBill[] {
  return getData().recurringBills;
}

export function addRecurringBill(data: Omit<RecurringBill, "id">): RecurringBill {
  const store = getData();
  const bill: RecurringBill = { ...data, id: genId("bill") };
  store.recurringBills.push(bill);
  persist();
  return bill;
}

export function updateRecurringBill(id: string, data: Partial<Omit<RecurringBill, "id">>): void {
  const store = getData();
  const idx = store.recurringBills.findIndex((b) => b.id === id);
  if (idx === -1) return;
  store.recurringBills[idx] = { ...store.recurringBills[idx], ...data };
  persist();
}

export function deleteRecurringBill(id: string): void {
  const store = getData();
  store.recurringBills = store.recurringBills.filter((b) => b.id !== id);
  persist();
}

// ── Public API: Net Worth ────────────────────────────────
export function getNetWorth(): NetWorthData {
  return getData().netWorth;
}

// ── Public API: Computed / Helpers ───────────────────────
export function getMonthlySummary(month?: string): MonthlySummary {
  const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const income = getTotalMonthlyIncome();
  const expenses = getTotalMonthlyExpenses(targetMonth);
  return {
    month: targetMonth,
    income,
    expenses,
    savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
  };
}

export function getLast3Months(): MonthlySummary[] {
  const now = new Date();
  const months: MonthlySummary[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(getMonthlySummary(month));
  }
  return months;
}

export function getTotalSubscriptionCost(): number {
  const store = getData();
  return store.recurringBills
    .filter((b) => b.type === "subscription")
    .reduce((sum, b) => {
      if (b.frequency === "annually") return sum + b.amount / 12;
      if (b.frequency === "quarterly") return sum + b.amount / 3;
      if (b.frequency === "weekly") return sum + b.amount * 4.333;
      return sum + b.amount;
    }, 0);
}

// ── Reset for testing ────────────────────────────────────
export function resetFinanceData(): void {
  _cache = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
