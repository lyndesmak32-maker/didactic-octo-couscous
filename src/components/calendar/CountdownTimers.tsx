import { useMemo } from "react";
import { Gift, Plane, CalendarClock, PartyPopper, Star, Plus, Trash2 } from "lucide-react";
import type { CountdownItem } from "~/types/calendar";

interface CountdownTimersProps {
  countdowns: CountdownItem[];
  onAdd?: () => void;
  onDelete?: (id: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  birthday: Gift,
  trip: Plane,
  deadline: CalendarClock,
  holiday: PartyPopper,
  custom: Star,
};

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function CountdownTimers({ countdowns, onAdd, onDelete }: CountdownTimersProps) {
  const sorted = useMemo(() => {
    return [...countdowns].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
  }, [countdowns]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          ⏳ Countdowns
        </h3>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex size-7 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-surface-400">No countdowns yet. Add one!</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => {
            const days = getDaysUntil(item.date);
            const Icon = iconMap[item.type] || Star;
            const isClose = days <= 7;
            const isPast = days < 0;

            return (
              <div
                key={item.id}
                className={`group flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                  isPast
                    ? "opacity-50"
                    : isClose
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : "hover:bg-surface-50 dark:hover:bg-surface-800/50"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    isClose && !isPast
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                      : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {isPast
                      ? `${Math.abs(days)}d ago`
                      : days === 0
                        ? "Today! 🎉"
                        : days === 1
                          ? "Tomorrow"
                          : `${days} days`}
                  </p>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-surface-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-surface-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
