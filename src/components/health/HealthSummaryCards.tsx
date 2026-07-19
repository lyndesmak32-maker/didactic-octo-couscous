import { Heart, Footprints, Droplets, Moon, Zap, Flame } from "lucide-react";
import type { DailyHealthSummary } from "~/types/health";

interface Props {
  summary: DailyHealthSummary;
}

function Ring({ pct, color, size = 80, strokeWidth = 6, children }: {
  pct: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          className="text-surface-200 dark:text-surface-800" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function HealthSummaryCards({ summary }: Props) {
  const overallPct = Math.round(
    ((summary.waterOz / summary.waterGoalOz) * 25 +
     (summary.exerciseMinutes >= 30 ? 25 : (summary.exerciseMinutes / 30) * 25) +
     (summary.medicationsTotal > 0 ? (summary.medicationsTaken / summary.medicationsTotal) * 25 : 25) +
     (summary.calories > 0 ? Math.min(100, (summary.calories / summary.calorieGoal) * 100) / 4 : 0)
    )
  );

  const waterPct = Math.round((summary.waterOz / summary.waterGoalOz) * 100);
  const sleepPct = summary.sleepHours ? Math.round((summary.sleepHours / summary.sleepGoalHours) * 100) : 0;
  const caloriesPct = Math.round(Math.min(100, (summary.calories / summary.calorieGoal) * 100));
  const stepPct = Math.round(Math.min(100, (summary.steps / summary.stepGoal) * 100));

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {/* Health Ring */}
      <div className="col-span-2 lg:col-span-1 flex flex-col items-center rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
        <Ring pct={overallPct} color="#f43f5e" size={90} strokeWidth={7}>
          <span className="text-xl font-bold text-surface-900 dark:text-surface-100">{overallPct}%</span>
          <span className="text-[10px] text-surface-500 dark:text-surface-400">Health</span>
        </Ring>
        <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">Daily Score</p>
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 mb-2">
          <Footprints className="size-4 text-amber-500" />
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Steps</span>
        </div>
        <p className="text-xl font-bold text-surface-900 dark:text-surface-100">{summary.steps.toLocaleString()}</p>
        <div className="mt-1.5 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${stepPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-surface-500">{stepPct}% of {summary.stepGoal.toLocaleString()}</p>
      </div>

      {/* Water */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="size-4 text-blue-500" />
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Water</span>
        </div>
        <p className="text-xl font-bold text-surface-900 dark:text-surface-100">{summary.waterOz} oz</p>
        <div className="mt-1.5 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${waterPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-surface-500">{waterPct}% of {summary.waterGoalOz} oz</p>
      </div>

      {/* Sleep */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="size-4 text-indigo-500" />
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Sleep</span>
        </div>
        <p className="text-xl font-bold text-surface-900 dark:text-surface-100">
          {summary.sleepHours ? `${summary.sleepHours}h` : "—"}
        </p>
        <div className="mt-1.5 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${sleepPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-surface-500">Goal: {summary.sleepGoalHours}h</p>
      </div>

      {/* Calories */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="size-4 text-orange-500" />
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Calories</span>
        </div>
        <p className="text-xl font-bold text-surface-900 dark:text-surface-100">{summary.calories}</p>
        <div className="mt-1.5 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${caloriesPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-surface-500">{caloriesPct}% of {summary.calorieGoal}</p>
      </div>

      {/* Active Minutes + Meds (shown as extra row on larger screens if needed) */}
      <div className="col-span-2 flex gap-3 lg:hidden">
        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-surface-200 bg-white px-4 py-3 dark:border-surface-800 dark:bg-surface-900">
          <Zap className="size-4 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{summary.activeMinutes} min</p>
            <p className="text-[10px] text-surface-500">Active</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-surface-200 bg-white px-4 py-3 dark:border-surface-800 dark:bg-surface-900">
          <Heart className="size-4 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{summary.medicationsTaken}/{summary.medicationsTotal}</p>
            <p className="text-[10px] text-surface-500">Meds Taken</p>
          </div>
        </div>
      </div>
    </div>
  );
}
