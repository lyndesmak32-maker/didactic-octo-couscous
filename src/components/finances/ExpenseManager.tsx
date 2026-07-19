import { useState, useMemo } from "react";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";
import type { Expense, ExpenseCategory } from "~/types/finances";
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from "~/types/finances";

interface ExpenseManagerProps {
  expenses: Expense[];
  onAdd: (data: Omit<Expense, "id">) => void;
  onUpdate: (id: string, data: Partial<Omit<Expense, "id">>) => void;
  onDelete: (id: string) => void;
}

export function ExpenseManager({ expenses, onAdd, onUpdate, onDelete }: ExpenseManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExpenseCategory | "all">("all");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const sorted = useMemo(() => {
    let filtered = expenses;
    if (filter !== "all") {
      filtered = expenses.filter((e) => e.category === filter);
    }
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filter]);

  const filteredTotal = useMemo(() => sorted.reduce((s, e) => s + e.amount, 0), [sorted]);

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!description.trim() || isNaN(amt) || amt <= 0) return;
    onAdd({ description: description.trim(), amount: amt, category, date });
    setDescription("");
    setAmount("");
    setShowForm(false);
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditAmount(String(exp.amount));
    setEditDesc(exp.description);
  };

  const saveEdit = (id: string) => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0 || !editDesc.trim()) return;
    onUpdate(id, { amount: amt, description: editDesc.trim() });
    setEditingId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Expenses</h4>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {sorted.length} transactions · ${filteredTotal.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-colors"
        >
          <Plus className="size-3.5" />
          Add Expense
        </button>
      </div>

      {/* Category filter pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
            filter === "all"
              ? "bg-surface-800 text-white dark:bg-surface-200 dark:text-surface-900"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
          }`}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              filter === cat
                ? "text-white dark:text-surface-900"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
            }`}
            style={filter === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50 space-y-3">
          <input
            type="text" placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number" placeholder="Amount" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-2 text-sm text-surface-600 dark:text-surface-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {sorted.slice(0, 50).map((exp) => (
          <div key={exp.id} className="flex items-center justify-between rounded-lg p-2.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 group">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[exp.category] }}
              />
              <div className="min-w-0 flex-1">
                {editingId === exp.id ? (
                  <input
                    type="text" value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full rounded-md border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-2 py-0.5 text-sm text-surface-900 dark:text-surface-100"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(exp.id); if (e.key === "Escape") setEditingId(null); }}
                  />
                ) : (
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{exp.description}</p>
                )}
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {CATEGORY_LABELS[exp.category]} · {formatDate(exp.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {editingId === exp.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number" value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-20 rounded-md border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-2 py-0.5 text-sm text-surface-900 dark:text-surface-100"
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(exp.id); if (e.key === "Escape") setEditingId(null); }}
                  />
                  <button onClick={() => saveEdit(exp.id)} className="text-emerald-500 hover:text-emerald-600"><Check className="size-3.5" /></button>
                  <button onClick={() => setEditingId(null)} className="text-surface-400 hover:text-surface-600"><X className="size-3.5" /></button>
                </div>
              ) : (
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -${exp.amount.toFixed(2)}
                </span>
              )}
              {editingId !== exp.id && (
                <>
                  <button onClick={() => startEdit(exp)} className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-surface-600 transition-all">
                    <Edit3 className="size-3.5" />
                  </button>
                  <button onClick={() => onDelete(exp.id)} className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all">
                    <Trash2 className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-4">
            No expenses in this category. Add one to start tracking.
          </p>
        )}
      </div>
    </div>
  );
}
