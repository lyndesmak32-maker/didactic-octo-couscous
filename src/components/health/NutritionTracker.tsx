import { useState, useCallback } from "react";
import { UtensilsCrossed, Plus, Trash2, Flame } from "lucide-react";
import type { NutritionEntry } from "~/types/health";

interface Props {
  entries: NutritionEntry[];
  dailyCalorieGoal: number;
  onAdd: (data: { date: string; meal: string; calories: number; protein: number; carbs: number; fat: number; notes?: string }) => void;
  onDelete: (id: string) => void;
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function NutritionTracker({ entries, dailyCalorieGoal, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [meal, setMeal] = useState("Lunch");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayEntries = entries.filter((e) => e.date === today);
  const totalCalories = todayEntries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = todayEntries.reduce((s, e) => s + e.protein, 0);
  const totalCarbs = todayEntries.reduce((s, e) => s + e.carbs, 0);
  const totalFat = todayEntries.reduce((s, e) => s + e.fat, 0);

  const caloriesPct = Math.min(100, Math.round((totalCalories / dailyCalorieGoal) * 100));

  const handleAdd = useCallback(() => {
    const c = parseInt(calories, 10);
    const p = parseInt(protein, 10) || 0;
    const cb = parseInt(carbs, 10) || 0;
    const f = parseInt(fat, 10) || 0;
    if (!c) return;
    onAdd({ date, meal, calories: c, protein: p, carbs: cb, fat: f, notes: notes.trim() || undefined });
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setNotes("");
    setShowAdd(false);
  }, [date, meal, calories, protein, carbs, fat, notes, onAdd]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="size-5 text-orange-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Nutrition</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Plus className="size-4" />
        </button>
      </div>

      {/* Calorie ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center">
          <svg width={80} height={80} className="-rotate-90">
            <circle cx={40} cy={40} r={34} fill="none" stroke="currentColor"
              className="text-surface-200 dark:text-surface-800" strokeWidth={7} />
            <circle cx={40} cy={40} r={34} fill="none" stroke="#f97316"
              strokeWidth={7} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 - (caloriesPct / 100) * 2 * Math.PI * 34}
              className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{totalCalories}</span>
            <span className="text-[10px] text-surface-500">/ {dailyCalorieGoal}</span>
          </div>
        </div>
        {/* Macro bars */}
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-surface-500">Protein</span>
              <span className="font-medium text-surface-700 dark:text-surface-300">{totalProtein}g</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.min(100, (totalProtein / 150) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-surface-500">Carbs</span>
              <span className="font-medium text-surface-700 dark:text-surface-300">{totalCarbs}g</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (totalCarbs / 250) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-surface-500">Fat</span>
              <span className="font-medium text-surface-700 dark:text-surface-300">{totalFat}g</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div className="h-full rounded-full bg-yellow-400" style={{ width: `${Math.min(100, (totalFat / 65) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 space-y-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Meal</label>
              <select value={meal} onChange={(e) => setMeal(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
                {MEAL_TYPES.map((mt) => (
                  <option key={mt} value={mt}>{mt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-surface-500 mb-1">Calories</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
                placeholder="500" />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-1">Protein (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
                placeholder="30" />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-1">Carbs (g)</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
                placeholder="50" />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-1">Fat (g)</label>
              <input type="number" value={fat} onChange={(e) => setFat(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
                placeholder="20" />
            </div>
          </div>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="What did you eat? (optional)" />
          <button onClick={handleAdd}
            className="w-full rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 transition-colors">
            Add Meal
          </button>
        </div>
      )}

      {/* Today's meals */}
      <div>
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Today's Meals</p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {todayEntries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 text-sm">
              <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                {entry.meal}
              </span>
              <span className="flex-1 truncate text-surface-700 dark:text-surface-300">
                {entry.notes || `${entry.calories} cal`}
              </span>
              <span className="font-medium text-surface-900 dark:text-surface-100">{entry.calories} cal</span>
              <button onClick={() => onDelete(entry.id)}
                className="text-surface-300 hover:text-rose-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {todayEntries.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-4">No meals logged today</p>
          )}
        </div>
      </div>
    </div>
  );
}
