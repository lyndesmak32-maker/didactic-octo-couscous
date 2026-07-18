import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarView } from "~/types/calendar";

interface ViewToggleProps {
  view: CalendarView;
  onChange: (view: CalendarView) => void;
}

const views: { key: CalendarView; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-surface-200 bg-surface-50 p-0.5 dark:border-surface-700 dark:bg-surface-800">
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
            view === v.key
              ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
              : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

interface NavArrowsProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function NavArrows({ label, onPrev, onNext, onToday }: NavArrowsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToday}
        className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800"
      >
        Today
      </button>
      <button
        onClick={onPrev}
        className="flex size-8 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
      >
        <ChevronLeft className="size-4" />
      </button>
      <h3 className="min-w-[140px] text-center text-sm font-semibold text-surface-900 dark:text-surface-100">
        {label}
      </h3>
      <button
        onClick={onNext}
        className="flex size-8 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
