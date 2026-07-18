import { Heart, Footprints, Droplets, Moon } from "lucide-react";
import type { HealthSnapshot } from "~/types/dashboard";

export function HealthSnapshotWidget({ health }: { health: HealthSnapshot }) {
  const waterPct = Math.round((health.waterOz / health.waterGoalOz) * 100);

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
                {health.steps.toLocaleString()} / {health.stepGoal.toLocaleString()}
              </p>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(100, (health.steps / health.stepGoal) * 100)}%` }}
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
                {health.waterOz} / {health.waterGoalOz} oz
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
                {health.sleepHours}h / {health.sleepGoalHours}h
              </p>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{
                  width: `${Math.min(100, (health.sleepHours / health.sleepGoalHours) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Active Minutes */}
        <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 dark:bg-surface-800/50">
          <span className="text-xs text-surface-600 dark:text-surface-400">
            Active minutes
          </span>
          <span className="text-sm font-semibold text-rose-500">
            {health.activeMinutes} min
          </span>
        </div>
      </div>
    </div>
  );
}
