import { useState } from "react";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";
import type { IncomeSource, IncomeFrequency } from "~/types/finances";

interface IncomeManagerProps {
  incomes: IncomeSource[];
  totalMonthly: number;
  onAdd: (data: Omit<IncomeSource, "id">) => void;
  onUpdate: (id: string, data: Partial<Omit<IncomeSource, "id">>) => void;
  onDelete: (id: string) => void;
}

const FREQ_LABELS: Record<IncomeFrequency, string> = {
  monthly: "/mo",
  biweekly: "× 2.167",
  weekly: "× 4.333",
  annually: "/12",
  once: "once",
};

export function IncomeManager({ incomes, totalMonthly, onAdd, onUpdate, onDelete }: IncomeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<IncomeFrequency>("monthly");
  const [category, setCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAdd({ name: name.trim(), amount: amt, frequency, category: category || "Other" });
    setName("");
    setAmount("");
    setCategory("");
    setShowForm(false);
  };

  const startEdit = (inc: IncomeSource) => {
    setEditingId(inc.id);
    setEditAmount(String(inc.amount));
  };

  const saveEdit = (id: string) => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) return;
    onUpdate(id, { amount: amt });
    setEditingId(null);
  };

  const monthlyAmount = (inc: IncomeSource): number => {
    switch (inc.frequency) {
      case "monthly": return inc.amount;
      case "biweekly": return inc.amount * 2.167;
      case "weekly": return inc.amount * 4.333;
      case "annually": return inc.amount / 12;
      default: return 0;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Income Sources</h4>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            ${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-colors"
        >
          <Plus className="size-3.5" />
          Add Income
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50 space-y-3">
          <input
            type="text" placeholder="Source name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number" placeholder="Amount" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
            >
              <option value="monthly">Monthly</option>
              <option value="biweekly">Biweekly</option>
              <option value="weekly">Weekly</option>
              <option value="annually">Annually</option>
              <option value="once">One-time</option>
            </select>
          </div>
          <input
            type="text" placeholder="Category (e.g. Employment)" value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-2 text-sm text-surface-600 dark:text-surface-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {incomes.map((inc) => (
          <div key={inc.id} className="flex items-center justify-between rounded-lg p-2.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold">
                {inc.category.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{inc.name}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {inc.category} · {inc.frequency} {FREQ_LABELS[inc.frequency]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {editingId === inc.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number" value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-24 rounded-md border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-2 py-0.5 text-sm text-surface-900 dark:text-surface-100"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(inc.id); if (e.key === "Escape") setEditingId(null); }}
                  />
                  <button onClick={() => saveEdit(inc.id)} className="text-emerald-500 hover:text-emerald-600"><Check className="size-3.5" /></button>
                  <button onClick={() => setEditingId(null)} className="text-surface-400 hover:text-surface-600"><X className="size-3.5" /></button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    ${inc.amount.toLocaleString()}{FREQ_LABELS[inc.frequency]}
                  </span>
                  <span className="text-xs text-surface-500 dark:text-surface-400 w-20 text-right">
                    ${monthlyAmount(inc).toFixed(0)}/mo
                  </span>
                </>
              )}
              <button onClick={() => startEdit(inc)} className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-surface-600 transition-all">
                <Edit3 className="size-3.5" />
              </button>
              <button onClick={() => onDelete(inc.id)} className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
