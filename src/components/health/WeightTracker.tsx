import { useState, useCallback, useMemo } from "react";
import { Scale, TrendingDown, Plus, Trash2 } from "lucide-react";
import type { WeightEntry } from "~/types/health";

interface Props {
  entries: WeightEntry[];
  goalWeight?: number;
  onAdd: (data: { date: string; weight: number }) => void;
  onDelete: (id: string) => void;
}

export function WeightTracker({ entries, goalWeight, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const latest = entries[entries.length - 1];
  const trend = useMemo(() => {
    if (entries.length < 2) return null;
    const first = entries[0].weight;
    const last = entries[entries.length - 1].weight;
    return last - first;
  }, [entries]);

  // Mini sparkline data (last 14 entries or all)
  const plotEntries = entries.slice(-14);
  const minW = Math.min(...plotEntries.map((e) => e.weight)) - 1;
  const maxW = Math.max(...plotEntries.map((e) => e.weight)) + 1;
  const range = maxW - minW || 1;

  const handleAdd = useCallback(() => {
    const w = parseFloat(newWeight);
    if (w > 0) {
      onAdd({ date: newDate, weight: w });
      setNewWeight("");
      setShowAdd(false);
    }
  }, [newWeight, newDate, onAdd]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-teal-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Weight</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Plus className="size-4" />
        </button>
      </div>

      {/* Current weight display */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-surface-900 dark:text-surface-100">
          {latest ? latest.weight : "—"}
        </span>
        <span className="text-sm text-surface-500">lbs</span>
        {goalWeight && (
          <span className="ml-auto text-sm text-surface-500">
            Goal: <span className="font-medium text-teal-500">{goalWeight} lbs</span>
          </span>
        )}
      </div>

      {trend !== null && (
        <div className="flex items-center gap-1 mb-4 text-xs">
          <TrendingDown className={`size-3 ${trend < 0 ? "text-teal-500" : "text-rose-500"}`} />
          <span className={trend < 0 ? "text-teal-500" : "text-rose-500"}>
            {Math.abs(trend).toFixed(1)} lbs {trend < 0 ? "lost" : "gained"} (all time)
          </span>
        </div>
      )}

      {/* Sparkline */}
      {plotEntries.length >= 2 && (
        <div className="mb-4 h-16 flex items-end gap-px">
          {plotEntries.map((e, i) => {
            const h = ((e.weight - minW) / range) * 56 + 4;
            return (
              <div key={i} className="flex-1 flex items-end justify-center">
                <div className="w-full rounded-t-sm bg-teal-400/60 dark:bg-teal-500/40"
                  style={{ height: `${h}px` }}
                  title={`${e.date}: ${e.weight} lbs`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 flex items-end gap-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <div>
            <label className="block text-[10px] text-surface-500 mb-1">Weight (lbs)</label>
            <input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
              className="w-24 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              placeholder="175" step="0.1" />
          </div>
          <div>
            <label className="block text-[10px] text-surface-500 mb-1">Date</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
          </div>
          <button onClick={handleAdd}
            className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-600 transition-colors">
            Log
          </button>
        </div>
      )}

      {/* Recent entries */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {entries.slice(-7).reverse().map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 text-sm">
            <span className="text-surface-600 dark:text-surface-400">
              {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-surface-900 dark:text-surface-100">{e.weight} lbs</span>
              <button onClick={() => onDelete(e.id)}
                className="text-surface-300 hover:text-rose-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
