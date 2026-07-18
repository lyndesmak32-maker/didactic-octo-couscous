import { Car, Clock } from "lucide-react";
import type { TrafficEstimate } from "~/types/dashboard";

const conditionColors: Record<TrafficEstimate["condition"], { color: string; label: string }> = {
  light: { color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40", label: "Light" },
  moderate: { color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40", label: "Moderate" },
  heavy: { color: "text-red-500 bg-red-50 dark:bg-red-950/40", label: "Heavy" },
};

export function TrafficWidget({ traffic }: { traffic: TrafficEstimate }) {
  const config = conditionColors[traffic.condition];
  const delta = traffic.commuteMinutes - traffic.typicalMinutes;
  const deltaStr = delta > 0 ? `+${delta}m` : delta < 0 ? `${delta}m` : "normal";

  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <Car className="size-4 text-sky-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Commute
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40">
          <Car className="size-6 text-sky-500" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            {traffic.commuteMinutes}
            <span className="text-base font-normal text-surface-400"> min</span>
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            to {traffic.destination}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2 dark:bg-surface-800/50">
        <Clock className="size-3.5 text-surface-400" />
        <span className="text-xs text-surface-600 dark:text-surface-400">
          Usually {traffic.typicalMinutes} min —
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
        >
          {deltaStr}
        </span>
      </div>
    </div>
  );
}
