import { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import type { MonthlyBudget, ExpenseCategory } from "~/types/finances";
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from "~/types/finances";
import { getBudgetSpent } from "~/data/finances";
import { getSpendingByCategory } from "~/data/finances";

interface BudgetOverviewProps {
  budget: MonthlyBudget | undefined;
  onChangeBudget: (budget: MonthlyBudget) => void;
}

export function BudgetOverview({ budget, onChangeBudget }: BudgetOverviewProps) {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editValue, setEditValue] = useState("");

  if (!budget) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
          No budget set for this month. Set one up to track spending.
        </p>
        <button
          onClick={() => {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            onChangeBudget({
              month,
              totalBudget: 5000,
              categories: EXPENSE_CATEGORIES.map((cat) => ({ category: cat, allocated: cat === "Housing" ? 2000 : 300 })),
            });
          }}
          className="mt-4 mx-auto block rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Create Budget
        </button>
      </div>
    );
  }

  const totalSpent = getBudgetSpent(budget.month);
  const totalBudget = budget.totalBudget;
  const overallPct = Math.round((totalSpent / totalBudget) * 100);
  const spendingByCategory = getSpendingByCategory(budget.month);
  const spentMap = new Map(spendingByCategory.map((s) => [s.category, s.amount]));

  const startEditing = (cat: ExpenseCategory) => {
    const item = budget.categories.find((c) => c.category === cat);
    setEditValue(item ? String(item.allocated) : "0");
    setEditingCategory(cat);
  };

  const saveEdit = () => {
    if (!editingCategory) return;
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) return;
    const updated = {
      ...budget,
      categories: budget.categories.map((c) =>
        c.category === editingCategory ? { ...c, allocated: val } : c,
      ),
      totalBudget: budget.categories.reduce((sum, c) => {
        if (c.category === editingCategory) return sum + val;
        const old = budget.categories.find((oc) => oc.category === c.category);
        return sum + (old?.allocated ?? c.allocated);
      }, 0),
    };
    updated.totalBudget = updated.categories.reduce((s, c) => s + c.allocated, 0);
    onChangeBudget(updated);
    setEditingCategory(null);
  };

  const overallColor =
    overallPct > 100 ? "bg-red-500" : overallPct > 85 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div>
      {/* Total Budget Ring */}
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:gap-6">
        <div className="relative mb-4 sm:mb-0">
          <svg className="size-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-100 dark:text-surface-800" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={overallColor}
              strokeDasharray={`${Math.min(overallPct, 100) * 3.267} 326.7`}
              stroke="currentColor"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-surface-900 dark:text-surface-100">{overallPct}%</span>
            <span className="text-[10px] text-surface-500 dark:text-surface-400">spent</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Monthly Budget: ${totalBudget.toLocaleString()}
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Spent ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })} · ${(totalBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining
          </p>
          <p className="text-xs text-surface-400 mt-1">
            {overallPct > 100
              ? "⚠️ Over budget — review spending"
              : overallPct > 85
                ? "⚠️ Approaching limit"
                : "On track"}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Category Breakdown
        </h4>
        {budget.categories.map((cat) => {
          const spent = spentMap.get(cat.category) ?? 0;
          const pct = cat.allocated > 0 ? Math.round((spent / cat.allocated) * 100) : 0;
          const barColor =
            pct > 100 ? "bg-red-500" : pct > 85 ? "bg-amber-500" : "bg-emerald-500";
          const textColor =
            pct > 100 ? "text-red-600 dark:text-red-400" : pct > 85 ? "text-amber-600 dark:text-amber-400" : "text-surface-700 dark:text-surface-300";

          return (
            <div key={cat.category} className="group">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category] }}
                  />
                  <span className={`text-xs font-medium ${textColor}`}>
                    {CATEGORY_LABELS[cat.category]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editingCategory === cat.category ? (
                    <>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 rounded-md border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-2 py-0.5 text-xs text-surface-900 dark:text-surface-100"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditingCategory(null);
                        }}
                      />
                      <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-600">
                        <Check className="size-3.5" />
                      </button>
                      <button onClick={() => setEditingCategory(null)} className="text-surface-400 hover:text-surface-600">
                        <X className="size-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-surface-900 dark:text-surface-100">
                        ${spent.toFixed(0)} / ${cat.allocated.toFixed(0)}
                      </span>
                      <button
                        onClick={() => startEditing(cat.category)}
                        className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-surface-600 transition-opacity"
                      >
                        <Edit3 className="size-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
