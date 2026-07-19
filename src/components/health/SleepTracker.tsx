import { useState, useCallback } from "react";
import { Moon, Plus, Clock, Star } from "lucide-react";
import type { SleepEntry, SleepQuality } from "~/types/health";

interface Props {
  sleepEntries: SleepEntry[];
  sleepGoalHours: number;
  onAdd: (data: { date: string; bedtime: string; wakeTime: string; hours: number; quality: SleepQuality; notes?: string }) => void;
}

const QUALITY_OPTIONS: { value: SleepQuality; label: string; stars: number }[] = [
  { value: "poor", label: "Poor", stars: 1 },
  { value: "fair", label: "Fair", stars: 2 },
  { value: "good", label: "Good", stars: 3 },
  { value: "excellent", label: "Excellent", stars: 4 },
];

export function SleepTracker({ sleepEntries, sleepGoalHours, onAdd }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState<SleepQuality>("good");

  const lastNight = sleepEntries[sleepEntries.length - 1];
  const weekly = sleepEntries.slice(-7);

  const calcHours = useCallback((bed: string, wake: string) => {
    const [bH, bM] = bed.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    let hours = wH - bH + (wM - bM) / 60;
    if (hours < 0) hours += 24;
    return Math.round(hours * 10) / 10;
  }, []);

  const handleAdd = useCallback(() => {
    const hours = calcHours(bedtime, wakeTime);
    onAdd({ date, bedtime, wakeTime, hours, quality });
    setShowAdd(false);
  }, [date, bedtime, wakeTime, quality, onAdd, calcHours]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="size-5 text-indigo-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Sleep</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Plus className="size-4" />
        </button>
      </div>

      {/* Last night summary */}
      {lastNight && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-indigo-50/50 p-3 dark:bg-indigo-950/20">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Moon className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">{lastNight.hours}h</span>
              <span className="text-sm text-surface-500">/ {sleepGoalHours}h goal</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
              <Clock className="size-3" />
              <span>{lastNight.bedtime} → {lastNight.wakeTime}</span>
              <span className="text-yellow-500">
                {QUALITY_OPTIONS.find((q) => q.value === lastNight.quality)?.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly sleep chart */}
      {weekly.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">This Week</p>
          <div className="flex items-end gap-1.5 h-14">
            {weekly.map((entry, i) => {
              const pct = Math.min(100, (entry.hours / sleepGoalHours) * 100);
              const dayName = new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
              const isToday = entry.date === new Date().toISOString().split("T")[0];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm" style={{
                    height: `${Math.max(4, (pct / 100) * 48)}px`,
                    backgroundColor: isToday ? "#6366f1" : entry.hours >= sleepGoalHours ? "#818cf8" : "#a5b4fc"
                  }} />
                  <span className="text-[10px] text-surface-400">{dayName}</span>
                </div>
              );
            })}
            {/* Goal line */}
            <div className="absolute left-0 right-0 border-t border-dashed border-indigo-300 dark:border-indigo-700"
              style={{ bottom: `${(sleepGoalHours / 10) * 48}px` }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="space-y-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Bedtime</label>
              <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Wake time</label>
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-surface-500 mb-1">Quality</label>
            <div className="flex gap-1">
              {QUALITY_OPTIONS.map((q) => (
                <button key={q.value} onClick={() => setQuality(q.value)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    quality === q.value
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-surface-600 hover:bg-surface-100 dark:bg-surface-900 dark:text-surface-400"
                  }`}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAdd}
            className="w-full rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-colors">
            Log Sleep
          </button>
        </div>
      )}
    </div>
  );
}
