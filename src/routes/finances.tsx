import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { Wallet, TrendingUp, BarChart3 } from "lucide-react";
import { SummaryCards } from "~/components/finances/SummaryCards";
import { CategoryBreakdown } from "~/components/finances/CategoryBreakdown";
import { BudgetOverview } from "~/components/finances/BudgetOverview";
import { SavingsGoals } from "~/components/finances/SavingsGoals";
import { BillsList } from "~/components/finances/BillsList";
import { IncomeManager } from "~/components/finances/IncomeManager";
import { ExpenseManager } from "~/components/finances/ExpenseManager";
import type { IncomeSource, Expense, MonthlyBudget, SavingsGoal, RecurringBill } from "~/types/finances";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "~/types/finances";
import {
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
  getTotalMonthlyIncome,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getTotalMonthlyExpenses,
  getSpendingByCategory,
  getBudget,
  setBudget,
  getNetWorth,
  getMonthlySummary,
  getLast3Months,
  getSavingsGoals,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getRecurringBills,
  addRecurringBill,
  updateRecurringBill,
  deleteRecurringBill,
} from "~/data/finances";

export const Route = createFileRoute("/finances")({ component: FinancesPage });

type Tab = "overview" | "income" | "expenses" | "budget" | "goals" | "bills";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "income", label: "Income" },
  { id: "expenses", label: "Expenses" },
  { id: "budget", label: "Budget" },
  { id: "goals", label: "Goals" },
  { id: "bills", label: "Bills" },
];

function FinancesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Read from store (re-fetch on tick)
  const incomes = useMemo(() => getIncomes(), [tick]);
  const expenses = useMemo(() => getExpenses(), [tick]);
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return getExpenses(month);
  }, [tick]);
  const budget = useMemo(() => getBudget(), [tick]);
  const netWorth = useMemo(() => getNetWorth(), [tick]);
  const summary = useMemo(() => getMonthlySummary(), [tick]);
  const last3Months = useMemo(() => getLast3Months(), [tick]);
  const spendingByCategory = useMemo(() => getSpendingByCategory(summary.month), [tick]);
  const savingsGoals = useMemo(() => getSavingsGoals(), [tick]);
  const bills = useMemo(() => getRecurringBills(), [tick]);

  const totalIncome = useMemo(() => getTotalMonthlyIncome(), [tick]);
  const totalExpenses = summary.expenses;

  // Handlers
  const handleAddIncome = useCallback((data: Omit<IncomeSource, "id">) => { addIncome(data); refresh(); }, [refresh]);
  const handleUpdateIncome = useCallback((id: string, data: Partial<Omit<IncomeSource, "id">>) => { updateIncome(id, data); refresh(); }, [refresh]);
  const handleDeleteIncome = useCallback((id: string) => { deleteIncome(id); refresh(); }, [refresh]);

  const handleAddExpense = useCallback((data: Omit<Expense, "id">) => { addExpense(data); refresh(); }, [refresh]);
  const handleUpdateExpense = useCallback((id: string, data: Partial<Omit<Expense, "id">>) => { updateExpense(id, data); refresh(); }, [refresh]);
  const handleDeleteExpense = useCallback((id: string) => { deleteExpense(id); refresh(); }, [refresh]);

  const handleBudgetChange = useCallback((b: MonthlyBudget) => { setBudget(b); refresh(); }, [refresh]);

  const handleAddGoal = useCallback((data: { name: string; targetAmount: number; currentAmount: number; monthlyContribution: number; deadline?: string; icon?: string }) => {
    addSavingsGoal(data);
    refresh();
  }, [refresh]);
  const handleDeleteGoal = useCallback((id: string) => { deleteSavingsGoal(id); refresh(); }, [refresh]);
  const handleUpdateGoal = useCallback((id: string, data: { currentAmount: number }) => { updateSavingsGoal(id, data); refresh(); }, [refresh]);

  const handleAddBill = useCallback((data: Omit<RecurringBill, "id">) => { addRecurringBill(data); refresh(); }, [refresh]);
  const handleDeleteBill = useCallback((id: string) => { deleteRecurringBill(id); refresh(); }, [refresh]);
  const handleToggleBillPaid = useCallback((id: string) => {
    const bills = getRecurringBills();
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    updateRecurringBill(id, {
      status: bill.status === "paid" ? "upcoming" : "paid",
    });
    refresh();
  }, [refresh]);

  // Spending trends bars
  const maxExpense = Math.max(...last3Months.map((m) => m.expenses), 1);
  const monthLabels = last3Months.map((m) => {
    const [y, mo] = m.month.split("-");
    return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-US", { month: "short" });
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <Wallet className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">
              Finances
            </h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              Track spending, budgets, and financial goals — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards (always visible) */}
      <div className="mb-6">
        <SummaryCards
          netWorth={netWorth}
          monthlyIncome={totalIncome}
          monthlyExpenses={totalExpenses}
          savingsRate={summary.savingsRate}
        />
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
                : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Spending Trends */}
            <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="size-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  Spending Trends (Last 3 Months)
                </h3>
              </div>
              <div className="flex items-end gap-6 h-36 px-2">
                {last3Months.map((m, i) => {
                  const height = maxExpense > 0 ? (m.expenses / maxExpense) * 120 : 0;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex flex-col items-center gap-1 w-full">
                        <span className="text-xs font-semibold text-surface-900 dark:text-surface-100">
                          ${m.expenses.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-surface-400">
                          {m.savingsRate}% saved
                        </span>
                      </div>
                      <div className="w-full flex justify-center">
                        <div
                          className="w-16 rounded-t-lg bg-emerald-500/80 transition-all"
                          style={{ height: `${Math.max(height, 4)}px` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                        {monthLabels[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Income vs Expenses + Category Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Income vs Expenses */}
              <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    Income vs Expenses
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Income</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ${totalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-6 w-full rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Expenses</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        ${totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-6 w-full rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all"
                        style={{ width: `${totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="size-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    Top Spending Categories
                  </h3>
                </div>
                {spendingByCategory.length > 0 ? (
                  <div className="space-y-2">
                    {spendingByCategory.slice(0, 5).map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] }} />
                          <span className="text-sm text-surface-700 dark:text-surface-300">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(item.percentage, 2)}%`,
                                backgroundColor: CATEGORY_COLORS[item.category],
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-surface-900 dark:text-surface-100 w-16 text-right">
                            ${item.amount.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-4">
                    No expenses recorded yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* INCOME TAB */}
        {activeTab === "income" && (
          <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
            <IncomeManager
              incomes={incomes}
              totalMonthly={totalIncome}
              onAdd={handleAddIncome}
              onUpdate={handleUpdateIncome}
              onDelete={handleDeleteIncome}
            />
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
              <ExpenseManager
                expenses={expenses}
                onAdd={handleAddExpense}
                onUpdate={handleUpdateExpense}
                onDelete={handleDeleteExpense}
              />
            </div>
            <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
              <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
                This Month
              </h4>
              <CategoryBreakdown
                data={spendingByCategory}
                totalSpent={totalExpenses}
              />
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === "budget" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
              <BudgetOverview budget={budget} onChangeBudget={handleBudgetChange} />
            </div>
            <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
              <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Spending by Category
              </h4>
              <CategoryBreakdown
                data={spendingByCategory}
                totalSpent={totalExpenses}
              />
            </div>
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === "goals" && (
          <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
            <SavingsGoals
              goals={savingsGoals}
              onAdd={handleAddGoal}
              onDelete={handleDeleteGoal}
              onUpdate={handleUpdateGoal}
            />
          </div>
        )}

        {/* BILLS TAB */}
        {activeTab === "bills" && (
          <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
            <BillsList
              bills={bills}
              onAdd={handleAddBill}
              onDelete={handleDeleteBill}
              onTogglePaid={handleToggleBillPaid}
            />
          </div>
        )}
      </div>
    </div>
  );
}
