import { useMemo, useState, useCallback } from "react";
import { Heart, Footprints, Droplets, Moon, Zap } from "lucide-react";
import { getDailySummary } from "~/data/health";

export function HealthSnapshotWidget() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const summary = useMemo(() => getDailySummary(), [tick]);
  const waterPct = Math.round((summary.waterOz / summary.waterGoalOz) * 100);
  const sleepPct = summary.sleepHours ? Math.round((summary.sleepHours / summary.sleepGoalHours) * 100) : 0;
  const stepPct = Math.round(Math.min(100, (summary.steps / summary.stepGoal) * 100));

  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="size-4 text-rose-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Health Snapshot
        </h3>
      </div>

      <div className="space-y-4">
        {/* Steps */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
            <Footprints className="size-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-surface-500 dark:text-surface-400">Steps</p>
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400">
                {summary.steps.toLocaleString()} / {summary.stepGoal.toLocaleString()}
              </p>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${stepPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
            <Droplets className="size-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-surface-500 dark:text-surface-400">Water</p>
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400">
                {summary.waterOz} / {summary.waterGoalOz} oz
              </p>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(100, waterPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
            <Moon className="size-4 text-indigo-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-surface-500 dark:text-surface-400">Sleep</p>
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400">
                {summary.sleepHours ? `${summary.sleepHours}h` : "—"} / {summary.sleepGoalHours}h
              </p>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, sleepPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Minutes + Meds */}
        <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 dark:bg-surface-800/50">
          <span className="text-xs text-surface-600 dark:text-surface-400">
            Active minutes
          </span>
          <span className="text-sm font-semibold text-rose-500">
            {summary.activeMinutes} min
          </span>
        </div>

        {summary.medicationsTotal > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 dark:bg-surface-800/50">
            <span className="text-xs text-surface-600 dark:text-surface-400">
              Medications taken
            </span>
            <span className="text-sm font-semibold text-rose-500">
              {summary.medicationsTaken}/{summary.medicationsTotal}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
