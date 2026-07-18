import { Wallet } from "lucide-react";
import type { BudgetData } from "~/types/dashboard";

export function BudgetSnapshot({ budget }: { budget: BudgetData }) {
  const pct = Math.round((budget.spent / budget.total) * 100);
  const remaining = budget.total - budget.spent;
  const isOverBudget = pct > 90;

  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="size-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          {budget.category}
        </h3>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
          ${remaining.toLocaleString()}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          remaining · {budget.daysRemaining} days left
        </p>
      </div>

      <div className="mb-2 h-2.5 w-full rounded-full bg-surface-100 dark:bg-surface-800">
        <div
          className={`h-full rounded-full transition-all ${
            isOverBudget ? "bg-red-500" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-surface-500 dark:text-surface-400">
          Spent ${budget.spent.toLocaleString()}
        </span>
        <span className="font-medium text-surface-600 dark:text-surface-400">
          ${budget.total.toLocaleString()} budget
        </span>
      </div>
    </div>
  );
}
