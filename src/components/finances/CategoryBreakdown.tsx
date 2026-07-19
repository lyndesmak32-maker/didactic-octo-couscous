import type { SpendingByCategory } from "~/types/finances";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "~/types/finances";

interface CategoryBreakdownProps {
  data: SpendingByCategory[];
  totalSpent: number;
}

export function CategoryBreakdown({ data, totalSpent }: CategoryBreakdownProps) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount);

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center">No expenses this month yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((item) => {
        const color = CATEGORY_COLORS[item.category];
        const pct = Math.round(item.percentage);

        return (
          <div key={item.category} className="group">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <div className="mt-0.5 text-right text-xs text-surface-400">
              {pct}% of total
            </div>
          </div>
        );
      })}
    </div>
  );
}
