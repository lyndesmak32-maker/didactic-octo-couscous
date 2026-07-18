import { Goal } from "lucide-react";
import type { Goal as GoalType } from "~/types/dashboard";

export function DailyGoalsWidget({
  goals,
  onToggle,
}: {
  goals: GoalType[];
  onToggle?: (id: string) => void;
}) {
  const completed = goals.filter((g) => g.completed).length;
  const total = goals.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <Goal className="size-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Today&apos;s Goals
        </h3>
      </div>

      {/* Progress ring */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative size-14 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-surface-200 dark:text-surface-800"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(pct / 100) * 88} 88`}
              strokeLinecap="round"
              className="text-amber-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-surface-900 dark:text-surface-100">
            {pct}%
          </span>
        </div>
        <div>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-100">
            {completed}/{total}
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">goals completed</p>
        </div>
      </div>

      {/* Goal list */}
      <div className="space-y-2">
        {goals.map((goal) => (
          <label
            key={goal.id}
            className="flex items-center gap-2.5 rounded-lg p-1.5 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
            onClick={() => onToggle?.(goal.id)}
          >
            <span
              className={`flex size-4 items-center justify-center rounded border-2 transition-colors ${
                goal.completed
                  ? "border-amber-500 bg-amber-500"
                  : "border-surface-300 dark:border-surface-600"
              }`}
            >
              {goal.completed && (
                <svg
                  className="size-2.5 text-white"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 6l3 3 5-6" />
                </svg>
              )}
            </span>
            <span
              className={`text-sm ${
                goal.completed
                  ? "text-surface-500 line-through dark:text-surface-400"
                  : "text-surface-900 dark:text-surface-100"
              }`}
            >
              {goal.title}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
