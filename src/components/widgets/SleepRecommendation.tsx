import { Moon, AlarmClock, Calendar } from "lucide-react";
import type { SleepRecommendation } from "~/types/dashboard";

export function SleepRecommendationWidget({
  sleep,
}: {
  sleep: SleepRecommendation;
}) {
  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <Moon className="size-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Sleep Recommendation
        </h3>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
          <Moon className="size-6 text-indigo-500" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            {sleep.bedtime}
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Recommended bedtime
          </p>
        </div>
      </div>

      <div className="space-y-2.5 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
        <div className="flex items-center gap-2">
          <AlarmClock className="size-3.5 text-indigo-400" />
          <span className="text-xs text-surface-600 dark:text-surface-400">
            Wake up at{" "}
            <span className="font-medium text-surface-900 dark:text-surface-100">
              {sleep.wakeTime}
            </span>{" "}
            for{" "}
            <span className="font-medium text-surface-900 dark:text-surface-100">
              {sleep.hoursRecommended}h
            </span>{" "}
            of sleep
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-indigo-400" />
          <span className="text-xs text-surface-600 dark:text-surface-400">
            First event tomorrow:{" "}
            <span className="font-medium text-surface-900 dark:text-surface-100">
              {sleep.firstEventTitle}
            </span>{" "}
            at{" "}
            {new Date(sleep.firstEventTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
