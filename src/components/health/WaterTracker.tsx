import { useState, useCallback } from "react";
import { Droplets, Plus, Minus, Settings2 } from "lucide-react";
import type { WaterEntry } from "~/types/health";

interface Props {
  waterOz: number;
  goalOz: number;
  weeklyWater: WaterEntry[];
  onAddWater: (oz: number) => void;
  onChangeGoal: (oz: number) => void;
}

const QUICK_ADDS = [
  { label: "+8 oz", oz: 8, icon: "🥤" },
  { label: "+16 oz", oz: 16, icon: "💧" },
  { label: "+1 Cup", oz: 8, icon: "☕" },
  { label: "+1 Bottle", oz: 16.9, icon: "🍶" },
];

export function WaterTracker({ waterOz, goalOz, weeklyWater, onAddWater, onChangeGoal }: Props) {
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goalOz));
  const pct = Math.min(100, Math.round((waterOz / goalOz) * 100));

  const handleSetGoal = useCallback(() => {
    const val = parseInt(goalInput, 10);
    if (val > 0 && val <= 200) {
      onChangeGoal(val);
      setShowGoalEdit(false);
    }
  }, [goalInput, onChangeGoal]);

  const waveHeight = Math.min(100, (waterOz / goalOz) * 100);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="size-5 text-blue-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Water</h3>
        </div>
        <button onClick={() => setShowGoalEdit(!showGoalEdit)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Settings2 className="size-4" />
        </button>
      </div>

      {/* Water glass visualization */}
      <div className="flex gap-4 mb-5">
        <div className="relative w-20 h-28 shrink-0 rounded-b-2xl rounded-t-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-blue-400/60 dark:bg-blue-500/50 transition-all duration-700 rounded-b-2xl"
            style={{ height: `${waveHeight}%` }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-300/40 dark:bg-blue-400/30 rounded-full animate-pulse" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-300 drop-shadow-sm">{pct}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{waterOz}<span className="text-sm font-normal text-surface-500"> oz</span></p>
          <p className="text-sm text-surface-500 dark:text-surface-400">of {goalOz} oz goal</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_ADDS.map((qa) => (
              <button key={qa.label} onClick={() => onAddWater(qa.oz)}
                className="inline-flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 text-xs font-medium text-surface-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-blue-950 dark:hover:border-blue-700 dark:hover:text-blue-300 transition-colors">
                <span>{qa.icon}</span> {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal edit */}
      {showGoalEdit && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <input type="number" value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
            className="w-20 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            min={8} max={200} />
          <span className="text-sm text-surface-500">oz/day</span>
          <button onClick={handleSetGoal}
            className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors">Set</button>
        </div>
      )}

      {/* Weekly mini-bars */}
      <div>
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">This Week</p>
        <div className="flex items-end gap-1.5 h-16">
          {weeklyWater.map((day, i) => {
            const dayPct = Math.min(100, (day.totalOz / goalOz) * 100);
            const dayName = new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm" style={{ height: `${Math.max(4, (dayPct / 100) * 56)}px`,
                  backgroundColor: isToday ? "#3b82f6" : dayPct >= 100 ? "#60a5fa" : "#93c5fd" }} />
                <span className="text-[10px] text-surface-400">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
