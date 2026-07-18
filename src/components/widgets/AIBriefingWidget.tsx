import { Sparkles, Sun, Sunset, Moon } from "lucide-react";
import type { AIBriefing } from "~/types/dashboard";

const timeIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
};

const gradientClasses = {
  morning:
    "from-amber-50 via-orange-50 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-surface-900",
  afternoon:
    "from-blue-50 via-sky-50 to-white dark:from-blue-950/30 dark:via-sky-950/20 dark:to-surface-900",
  evening:
    "from-indigo-50 via-purple-50 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-surface-900",
};

const borderClasses = {
  morning: "border-amber-200 dark:border-amber-800",
  afternoon: "border-blue-200 dark:border-blue-800",
  evening: "border-indigo-200 dark:border-indigo-800",
};

export function AIBriefingWidget({ briefing }: { briefing: AIBriefing }) {
  const TimeIcon = timeIcons[briefing.type];

  return (
    <div
      className={`group rounded-2xl border bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-lg lg:p-6 ${gradientClasses[briefing.type]} ${borderClasses[briefing.type]} dark:hover:shadow-surface-950/50`}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-lg shadow-accent-600/25">
          <Sparkles className="size-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              AI Briefing
            </h3>
            <TimeIcon className="size-4 text-accent-500" />
          </div>
          <p className="mt-1 text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100">
            {briefing.headline}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {briefing.points.map((point, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-white/60 dark:hover:bg-white/5"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700 dark:bg-accent-900/50 dark:text-accent-300">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
