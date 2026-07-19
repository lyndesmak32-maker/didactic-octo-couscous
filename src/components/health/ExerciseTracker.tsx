import { useState, useCallback } from "react";
import { Bike, Plus, Trash2, Timer, Flame } from "lucide-react";
import type { ExerciseEntry } from "~/types/health";

interface Props {
  entries: ExerciseEntry[];
  weeklyMinutes: number;
  weeklySessions: number;
  onAdd: (data: { date: string; activityType: string; durationMinutes: number; calories: number; notes?: string }) => void;
  onDelete: (id: string) => void;
}

const ACTIVITY_TYPES = ["Running", "Walking", "Cycling", "Swimming", "Weight Training", "Yoga", "HIIT", "Pilates", "Sports", "Other"];

export function ExerciseTracker({ entries, weeklyMinutes, weeklySessions, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [activityType, setActivityType] = useState("Running");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = useCallback(() => {
    const d = parseInt(duration, 10);
    const c = parseInt(calories, 10);
    if (!d || !c) return;
    onAdd({ date, activityType, durationMinutes: d, calories: c, notes: notes.trim() || undefined });
    setDuration("");
    setCalories("");
    setNotes("");
    setShowAdd(false);
  }, [date, activityType, duration, calories, notes, onAdd]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bike className="size-5 text-green-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Exercise</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Plus className="size-4" />
        </button>
      </div>

      {/* Weekly summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-green-50/50 p-3 dark:bg-green-950/20">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Timer className="size-4" />
            <span className="text-xs font-medium">This Week</span>
          </div>
          <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-100">{weeklyMinutes}<span className="text-sm font-normal text-surface-500"> min</span></p>
        </div>
        <div className="rounded-xl bg-orange-50/50 p-3 dark:bg-orange-950/20">
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <Flame className="size-4" />
            <span className="text-xs font-medium">Sessions</span>
          </div>
          <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-100">{weeklySessions}</p>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 space-y-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <div>
            <label className="block text-[10px] text-surface-500 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
          </div>
          <div>
            <label className="block text-[10px] text-surface-500 mb-1">Activity</label>
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              {ACTIVITY_TYPES.map((at) => (
                <option key={at} value={at}>{at}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
                placeholder="30" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Calories</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
                placeholder="300" />
            </div>
          </div>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="Notes (optional)" />
          <button onClick={handleAdd}
            className="w-full rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors">
            Log Workout
          </button>
        </div>
      )}

      {/* Recent workouts */}
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {entries.slice(0, 8).map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-50 dark:hover:bg-surface-800/50">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
              <Bike className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{entry.activityType}</p>
              {entry.notes && <p className="text-xs text-surface-500 truncate">{entry.notes}</p>}
            </div>
            <div className="text-right text-xs text-surface-500">
              <p>{entry.durationMinutes} min</p>
              <p className="text-orange-500">{entry.calories} cal</p>
            </div>
            <button onClick={() => onDelete(entry.id)}
              className="text-surface-300 hover:text-rose-500 transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-4">No workouts logged</p>
        )}
      </div>
    </div>
  );
}
