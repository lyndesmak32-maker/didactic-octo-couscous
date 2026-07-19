import { useState, useMemo } from "react";
import { AlertCircle, CheckCircle2, Clock, Plus, Trash2, ArrowUpDown } from "lucide-react";
import type { RecurringBill } from "~/types/finances";

const statusConfig: Record<RecurringBill["status"], { icon: typeof CheckCircle2; color: string; label: string }> = {
  paid: { icon: CheckCircle2, color: "text-emerald-500", label: "Paid" },
  upcoming: { icon: Clock, color: "text-blue-500", label: "Upcoming" },
  "due-today": { icon: AlertCircle, color: "text-amber-500", label: "Due today" },
  overdue: { icon: AlertCircle, color: "text-red-500", label: "Overdue" },
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type SortField = "dueDate" | "amount" | "name";

interface BillsListProps {
  bills: RecurringBill[];
  onAdd: (bill: Omit<RecurringBill, "id">) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export function BillsList({ bills, onAdd, onDelete, onTogglePaid }: BillsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("dueDate");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState<RecurringBill["frequency"]>("monthly");
  const [billType, setBillType] = useState<RecurringBill["type"]>("bill");

  const sorted = useMemo(() => {
    const arr = [...bills];
    if (sortBy === "dueDate") {
      arr.sort((a, b) => {
        const daysA = daysUntil(a.dueDate);
        const daysB = daysUntil(b.dueDate);
        return daysA - daysB;
      });
    } else if (sortBy === "amount") {
      arr.sort((a, b) => b.amount - a.amount);
    } else {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [bills, sortBy]);

  const totalMonthly = bills
    .filter((b) => b.type === "subscription")
    .reduce((sum, b) => {
      if (b.frequency === "annually") return sum + b.amount / 12;
      if (b.frequency === "quarterly") return sum + b.amount / 3;
      if (b.frequency === "weekly") return sum + b.amount * 4.333;
      return sum + b.amount;
    }, 0);

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0 || !dueDate) return;
    onAdd({
      name: name.trim(),
      amount: amt,
      dueDate,
      frequency,
      type: billType,
      status: "upcoming",
      autoPay: false,
    });
    setName("");
    setAmount("");
    setDueDate("");
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Bills & Subscriptions
          </h4>
          {totalMonthly > 0 && (
            <p className="text-xs text-surface-500 dark:text-surface-400">
              ${totalMonthly.toFixed(2)}/mo in subscriptions
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(sortBy === "dueDate" ? "amount" : sortBy === "amount" ? "name" : "dueDate")}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
          >
            <ArrowUpDown className="size-3" />
            {sortBy === "dueDate" ? "Due" : sortBy === "amount" ? "Amount" : "Name"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-colors"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50 space-y-3">
          <input
            type="text"
            placeholder="Bill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringBill["frequency"])}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
            >
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
              <option value="quarterly">Quarterly</option>
              <option value="weekly">Weekly</option>
            </select>
            <select
              value={billType}
              onChange={(e) => setBillType(e.target.value as RecurringBill["type"])}
              className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-900 dark:text-surface-100"
            >
              <option value="bill">Bill</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Add {billType === "subscription" ? "Subscription" : "Bill"}
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

      <div className="space-y-1.5">
        {sorted.map((bill) => {
          const config = statusConfig[bill.status];
          const Icon = config.icon;
          const isUrgent = bill.status === "due-today" || bill.status === "overdue";
          const days = daysUntil(bill.dueDate);

          return (
            <div
              key={bill.id}
              className={`flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 group ${
                isUrgent ? "bg-red-50/50 dark:bg-red-950/20" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onTogglePaid(bill.id)}
                  className="shrink-0"
                  title={bill.status === "paid" ? "Mark unpaid" : "Mark paid"}
                >
                  <Icon className={`size-4 ${config.color}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        isUrgent ? "text-red-700 dark:text-red-400" : "text-surface-900 dark:text-surface-100"
                      }`}
                    >
                      {bill.name}
                    </p>
                    {bill.type === "subscription" && (
                      <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                        Sub
                      </span>
                    )}
                    {bill.autoPay && (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        Auto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Due {formatDate(bill.dueDate)}
                    {!isUrgent && days > 0 && ` (${days}d)`}
                    {!isUrgent && days === 0 && " (today)"}
                    {" · "}{config.label}
                    {bill.frequency !== "monthly" && ` · ${bill.frequency}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    isUrgent ? "text-red-700 dark:text-red-400" : "text-surface-900 dark:text-surface-100"
                  }`}
                >
                  ${bill.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDelete(bill.id)}
                  className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-4">
            No bills yet. Add one to start tracking.
          </p>
        )}
      </div>
    </div>
  );
}
