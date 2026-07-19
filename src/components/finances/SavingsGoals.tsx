import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import type { SavingsGoal } from "~/types/finances";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAdd: (goal: { name: string; targetAmount: number; currentAmount: number; monthlyContribution: number; deadline?: string; icon?: string }) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { currentAmount: number }) => void;
}

export function SavingsGoals({ goals, onAdd, onDelete, onUpdate }: SavingsGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [contribution, setContribution] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("");

  const handleSubmit = () => {
    const targetNum = parseFloat(target);
    const currentNum = parseFloat(current);
    const contribNum = parseFloat(contribution);
    if (!name.trim() || isNaN(targetNum) || targetNum <= 0 || isNaN(contribNum)) return;

    onAdd({
      name: name.trim(),
      targetAmount: targetNum,
      currentAmount: isNaN(currentNum) ? 0 : currentNum,
      monthlyContribution: contribNum,
      deadline: deadline || undefined,
      icon: icon || undefined,
    });

    setName("");
    setTarget("");
    setCurrent("0");
    setContribution("");
    setDeadline("");
    setIcon("");
    setShowForm(false);
  };

  const projectedCompletion = (goal: SavingsGoal): string => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return "Complete! 🎉";
    if (goal.monthlyContribution <= 0) return "No contributions set";
    const months = Math.ceil(remaining / goal.monthlyContribution);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Savings Goals
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-colors"
        >
          <Plus className="size-3.5" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50 space-y-3">
          <input
            type="text"
            placeholder="Goal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Target amount"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
            <input
              type="number"
              placeholder="Current saved"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Monthly contribution"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
            <input
              type="text"
              placeholder="Icon emoji (optional)"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Save Goal
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-2 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-4">
          No savings goals yet. Add one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {goals.map((goal) => {
            const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const remaining = goal.targetAmount - goal.currentAmount;
            const isComplete = remaining <= 0;

            return (
              <div
                key={goal.id}
                className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900 group relative"
              >
                <button
                  onClick={() => onDelete(goal.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{goal.icon || <Target className="size-4 text-emerald-500" />}</span>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{goal.name}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {isComplete ? "Complete! 🎉" : `Est. ${projectedCompletion(goal)}`}
                    </p>
                  </div>
                </div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-surface-900 dark:text-surface-100">
                    ${goal.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-surface-500 dark:text-surface-400">
                    of ${goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
                  <span>{pct}% funded</span>
                  <span>${remaining.toLocaleString()} to go</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
