import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Bill } from "~/types/dashboard";

const statusConfig: Record<
  Bill["status"],
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  paid: { icon: CheckCircle2, color: "text-emerald-500", label: "Paid" },
  upcoming: { icon: Clock, color: "text-blue-500", label: "Upcoming" },
  "due-today": { icon: AlertCircle, color: "text-red-500", label: "Due today" },
  overdue: { icon: AlertCircle, color: "text-red-600", label: "Overdue" },
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BillsWidget({ bills }: { bills: Bill[] }) {
  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle className="size-4 text-red-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Bills Due
        </h3>
      </div>
      <div className="space-y-2">
        {bills.slice(0, 4).map((bill) => {
          const config = statusConfig[bill.status];
          const Icon = config.icon;
          const isUrgent = bill.status === "due-today" || bill.status === "overdue";

          return (
            <div
              key={bill.id}
              className={`flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 ${
                isUrgent ? "bg-red-50/50 dark:bg-red-950/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`size-4 shrink-0 ${config.color}`} />
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isUrgent
                        ? "text-red-700 dark:text-red-400"
                        : "text-surface-900 dark:text-surface-100"
                    }`}
                  >
                    {bill.name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Due {formatDate(bill.dueDate)} · {config.label}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  isUrgent
                    ? "text-red-700 dark:text-red-400"
                    : "text-surface-900 dark:text-surface-100"
                }`}
              >
                ${bill.amount.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
