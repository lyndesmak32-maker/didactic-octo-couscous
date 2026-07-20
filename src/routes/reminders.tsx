import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  Bell,
  Stethoscope,
  RefreshCw,
  Plus,
  Circle,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  X,
} from "lucide-react";
import type {
  ReminderCategory,
  RemindersData,
  RemindersSummary,
  BillReminder,
  BirthdayReminder,
  MedicineReminder,
  TaskReminder,
  AppointmentReminder,
  RenewalReminder,
  BillFrequency,
  MedicineFrequency,
  TaskPriority,
  RenewalPeriod,
} from "~/types/reminders";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  REMINDER_CATEGORIES,
} from "~/types/reminders";
import {
  getRemindersSummary,
  getUpcomingReminders,
  getOverdueReminders,
  getByCategory,
  addBill,
  updateBill,
  deleteBill,
  toggleBillPaid,
  addBirthday,
  updateBirthday,
  deleteBirthday,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  toggleMedicineTaken,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  addRenewal,
  updateRenewal,
  deleteRenewal,
} from "~/data/reminders";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

// ── Helpers ────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (iso === todayStr()) return "Today";
  if (iso === tomorrow.toISOString().split("T")[0]) return "Tomorrow";
  if (iso === yesterday.toISOString().split("T")[0]) return "Yesterday";

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

function isOverdue(iso: string): boolean {
  return iso < todayStr();
}

function isToday(iso: string): boolean {
  return iso === todayStr();
}

function daysUntil(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  const now = new Date(todayStr() + "T00:00:00");
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-surface-200 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
};

const FREQ_LABEL: Record<BillFrequency, string> = {
  monthly: "Monthly",
  weekly: "Weekly",
  yearly: "Yearly",
  "one-time": "One-time",
};

const MED_FREQ_LABEL: Record<MedicineFrequency, string> = {
  daily: "Daily",
  "twice-daily": "2x Daily",
  weekly: "Weekly",
  "as-needed": "As needed",
};

const PERIOD_LABEL: Record<RenewalPeriod, string> = {
  annual: "Annual",
  biannual: "Biannual",
  quarterly: "Quarterly",
  monthly: "Monthly",
  once: "One-time",
};

// ── Add Modal ──────────────────────────────────────────
function AddModal({
  category,
  onClose,
  onAdd,
}: {
  category: ReminderCategory | null;
  onClose: () => void;
  onAdd: () => void;
}) {
  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-xl dark:border-surface-700 dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Add {CATEGORY_LABELS[category].replace(/s$/, "")}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
            <X className="size-5" />
          </button>
        </div>
        <AddForm category={category} onClose={onClose} onAdd={onAdd} />
      </div>
    </div>
  );
}

function AddForm({ category, onClose, onAdd }: { category: ReminderCategory; onClose: () => void; onAdd: () => void }) {
  const t = todayStr();
  const [submitting, setSubmitting] = useState(false);

  // Common
  const handleSubmit = (fn: () => void) => {
    fn();
    setSubmitting(true);
    setTimeout(() => {
      onAdd();
      onClose();
    }, 50);
  };

  switch (category) {
    case "bills": {
      const [name, setName] = useState("");
      const [amount, setAmount] = useState("");
      const [dueDate, setDueDate] = useState(t);
      const [recurring, setRecurring] = useState<BillFrequency>("monthly");
      const [autoPay, setAutoPay] = useState(false);
      const [notes, setNotes] = useState("");
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => addBill({ name: name || "New Bill", dueDate, amount: parseFloat(amount) || 0, recurring, autoPay, paid: false, notes: notes || undefined })); }} className="space-y-4">
          <Input label="Bill Name" value={name} onChange={setName} placeholder="e.g. Electric Bill" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount ($)" value={amount} onChange={setAmount} placeholder="0.00" type="number" step="0.01" />
            <div>
              <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Recurring" value={recurring} onChange={(v) => setRecurring(v as BillFrequency)} options={Object.entries(FREQ_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <input type="checkbox" checked={autoPay} onChange={(e) => setAutoPay(e.target.checked)} className="rounded" /> Auto-pay
              </label>
            </div>
          </div>
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
          <button type="submit" className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Add Bill
          </button>
        </form>
      );
    }
    case "birthdays": {
      const [name, setName] = useState("");
      const [date, setDate] = useState("");
      const [reminderDays, setReminderDays] = useState(7);
      const [notes, setNotes] = useState("");
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => addBirthday({ name: name || "New Birthday", date: date || t, reminderDaysBefore: reminderDays, notes: notes || undefined })); }} className="space-y-4">
          <Input label="Name" value={name} onChange={setName} placeholder="e.g. Mom" />
          <Input label="Birthday" value={date} onChange={setDate} type="date" />
          <Select label="Remind me" value={String(reminderDays)} onChange={(v) => setReminderDays(Number(v))} options={[{ value: "7", label: "1 week before" }, { value: "3", label: "3 days before" }, { value: "1", label: "Day of" }]} />
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Gift ideas..." />
          <button type="submit" className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Add Birthday
          </button>
        </form>
      );
    }
    case "medicine": {
      const [name, setName] = useState("");
      const [dosage, setDosage] = useState("");
      const [frequency, setFrequency] = useState<MedicineFrequency>("daily");
      const [timeOfDay, setTimeOfDay] = useState("08:00");
      const [startDate, setStartDate] = useState(t);
      const [endDate, setEndDate] = useState("");
      const [notes, setNotes] = useState("");
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => addMedicine({ name: name || "New Medicine", dosage: dosage || "N/A", frequency, timeOfDay: frequency === "as-needed" ? "as-needed" : timeOfDay, startDate, endDate: endDate || undefined, taken: false, notes: notes || undefined })); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={name} onChange={setName} placeholder="e.g. Vitamin D" />
            <Input label="Dosage" value={dosage} onChange={setDosage} placeholder="e.g. 2000 IU" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Frequency" value={frequency} onChange={(v) => setFrequency(v as MedicineFrequency)} options={Object.entries(MED_FREQ_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
            {frequency !== "as-needed" && <Input label="Time" value={timeOfDay} onChange={setTimeOfDay} type="time" />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" value={startDate} onChange={setStartDate} type="date" />
            <Input label="End Date (optional)" value={endDate} onChange={setEndDate} type="date" />
          </div>
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
          <button type="submit" className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Add Medicine
          </button>
        </form>
      );
    }
    case "tasks": {
      const [title, setTitle] = useState("");
      const [dueDate, setDueDate] = useState(t);
      const [priority, setPriority] = useState<TaskPriority>("medium");
      const [notes, setNotes] = useState("");
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => addTask({ title: title || "New Task", dueDate, priority, completed: false, notes: notes || undefined })); }} className="space-y-4">
          <Input label="Title" value={title} onChange={setTitle} placeholder="e.g. Buy groceries" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due Date" value={dueDate} onChange={setDueDate} type="date" />
            <Select label="Priority" value={priority} onChange={(v) => setPriority(v as TaskPriority)} options={[{ value: "high", label: "⚠️ High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} />
          </div>
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
          <button type="submit" className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Add Task
          </button>
        </form>
      );
    }
    case "appointments": {
      const [title, setTitle] = useState("");
      const [date, setDate] = useState(t);
      const [time, setTime] = useState("10:00");
      const [location, setLocation] = useState("");
      const [providerName, setProviderName] = useState("");
      const [notes, setNotes] = useState("");
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => addAppointment({ title: title || "New Appointment", date, time, location: location || undefined, providerName: providerName || undefined, notes: notes || undefined })); }} className="space-y-4">
          <Input label="Title" value={title} onChange={setTitle} placeholder="e.g. Dental Cleaning" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" value={date} onChange={setDate} type="date" />
            <Input label="Time" value={time} onChange={setTime} type="time" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" value={location} onChange={setLocation} placeholder="Optional" />
            <Input label="Provider" value={providerName} onChange={setProviderName} placeholder="e.g. Dr. Smith" />
          </div>
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
          <button type="submit" className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Add Appointment
          </button>
        </form>
      );
    }
    case "renewals": {
      const [item, setItem] = useState("");
      const [expirationDate, setExpirationDate] = useState(t);
      const [renewalPeriod, setRenewalPeriod] = useState<RenewalPeriod>("annual");
      const [notes, setNotes] = useState("");
      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => addRenewal({ item: item || "New Item", expirationDate, renewalPeriod, notes: notes || undefined })); }} className="space-y-4">
          <Input label="Item" value={item} onChange={setItem} placeholder="e.g. Passport" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Expiration Date" value={expirationDate} onChange={setExpirationDate} type="date" />
            <Select label="Period" value={renewalPeriod} onChange={(v) => setRenewalPeriod(v as RenewalPeriod)} options={Object.entries(PERIOD_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
          </div>
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
          <button type="submit" className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            Add Renewal
          </button>
        </form>
      );
    }
  }
}

// ── Reusable Input / Select ────────────────────────────
function Input({ label, value, onChange, placeholder, type = "text", step }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; step?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} step={step}
        className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500" />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Summary Bar ────────────────────────────────────────
function SummaryBar({ summary }: { summary: RemindersSummary }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <SummaryCard label="Total" value={summary.total} icon={<Bell className="size-5" />} />
      <SummaryCard label="Due Today" value={summary.dueToday} icon={<AlertCircle className="size-5" />} accent />
      <SummaryCard label="Overdue" value={summary.overdue} icon={<Clock className="size-5" />} danger={summary.overdue > 0} />
    </div>
  );
}

function SummaryCard({ label, value, icon, accent, danger }: {
  label: string; value: number; icon: React.ReactNode; accent?: boolean; danger?: boolean;
}) {
  const colorClass = danger
    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
    : accent
      ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
      : "bg-surface-50 text-surface-600 dark:bg-surface-800/50 dark:text-surface-400 border-surface-200 dark:border-surface-700";
  return (
    <div className={`rounded-xl border p-3 sm:p-4 flex items-center gap-3 ${colorClass}`}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-white/50 dark:bg-black/20">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
function RemindersPage() {
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<ReminderCategory>("bills");
  const [showAdd, setShowAdd] = useState(false);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const summary = useMemo(() => getRemindersSummary(), [tick]);
  const items = useMemo(() => getByCategory(activeTab), [tick, activeTab]);

  const overdueItems = useMemo(() => {
    const data = getByCategory(activeTab);
    const t = todayStr();
    if (activeTab === "bills") return (data as BillReminder[]).filter((b) => !b.paid && b.dueDate < t);
    if (activeTab === "tasks") return (data as TaskReminder[]).filter((tk) => !tk.completed && tk.dueDate < t);
    if (activeTab === "appointments") return (data as AppointmentReminder[]).filter((a) => a.date < t);
    if (activeTab === "renewals") return (data as RenewalReminder[]).filter((r) => r.expirationDate < t);
    return [];
  }, [tick, activeTab]);

  const handleDelete = useCallback((id: string) => {
    switch (activeTab) {
      case "bills": deleteBill(id); break;
      case "birthdays": deleteBirthday(id); break;
      case "medicine": deleteMedicine(id); break;
      case "tasks": deleteTask(id); break;
      case "appointments": deleteAppointment(id); break;
      case "renewals": deleteRenewal(id); break;
    }
    refresh();
  }, [activeTab, refresh]);

  const handleQuickAction = useCallback((id: string) => {
    switch (activeTab) {
      case "bills": toggleBillPaid(id); break;
      case "medicine": toggleMedicineTaken(id); break;
      case "tasks": toggleTaskComplete(id); break;
    }
    refresh();
  }, [activeTab, refresh]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Reminders</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Stay on top of bills, tasks, meds, and more.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
        >
          <Plus className="size-4" />
          Add {CATEGORY_LABELS[activeTab].replace(/s$/, "")}
        </button>
      </div>

      {/* Summary Bar */}
      <div className="mb-6">
        <SummaryBar summary={summary} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
        {REMINDER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === cat
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
                : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === "bills" && (
          <BillsSection items={items as BillReminder[]} onDelete={handleDelete} onTogglePaid={handleQuickAction} />
        )}
        {activeTab === "birthdays" && (
          <BirthdaysSection items={items as BirthdayReminder[]} onDelete={handleDelete} />
        )}
        {activeTab === "medicine" && (
          <MedicineSection items={items as MedicineReminder[]} onDelete={handleDelete} onToggleTaken={handleQuickAction} />
        )}
        {activeTab === "tasks" && (
          <TasksSection items={items as TaskReminder[]} onDelete={handleDelete} onToggleComplete={handleQuickAction} />
        )}
        {activeTab === "appointments" && (
          <AppointmentsSection items={items as AppointmentReminder[]} onDelete={handleDelete} />
        )}
        {activeTab === "renewals" && (
          <RenewalsSection items={items as RenewalReminder[]} onDelete={handleDelete} />
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 text-4xl">{CATEGORY_ICONS[activeTab]}</div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
              No {CATEGORY_LABELS[activeTab].toLowerCase()} yet
            </p>
            <button onClick={() => setShowAdd(true)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20">
              <Plus className="size-3.5" /> Add one
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddModal category={activeTab} onClose={() => setShowAdd(false)} onAdd={refresh} />
      )}
    </div>
  );
}

// ── Section Components ─────────────────────────────────

function BillsSection({ items, onDelete, onTogglePaid }: {
  items: BillReminder[]; onDelete: (id: string) => void; onTogglePaid: (id: string) => void;
}) {
  const sorted = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <>
      {sorted.map((bill) => {
        const overdue = !bill.paid && isOverdue(bill.dueDate);
        const due = !bill.paid && isToday(bill.dueDate);
        return (
          <div
            key={bill.id}
            className={`rounded-xl border bg-white p-4 transition-all dark:bg-surface-900 ${
              overdue
                ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10"
                : due
                  ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
                  : bill.paid
                    ? "border-surface-200 opacity-60 dark:border-surface-800"
                    : "border-surface-200 dark:border-surface-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onTogglePaid(bill.id)}
                  className="mt-0.5 flex-shrink-0 text-surface-400 hover:text-green-500 transition-colors"
                >
                  {bill.paid ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : overdue ? (
                    <AlertCircle className="size-5 text-red-500" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${bill.paid ? "text-surface-400 line-through dark:text-surface-500" : "text-surface-900 dark:text-surface-100"}`}>
                      {bill.name}
                    </p>
                    {overdue && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">OVERDUE</span>}
                    {due && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">DUE TODAY</span>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                    <span className="font-medium text-surface-700 dark:text-surface-300">${bill.amount.toFixed(2)}</span>
                    <span>·</span>
                    <span>{formatDate(bill.dueDate)}</span>
                    <span>·</span>
                    <span>{FREQ_LABEL[bill.recurring]}</span>
                    {bill.autoPay && (
                      <>
                        <span>·</span>
                        <span className="text-green-600 dark:text-green-400">Auto-pay</span>
                      </>
                    )}
                  </div>
                  {bill.notes && (
                    <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{bill.notes}</p>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(bill.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function BirthdaysSection({ items, onDelete }: {
  items: BirthdayReminder[]; onDelete: (id: string) => void;
}) {
  const todayDate = new Date(todayStr() + "T00:00:00");
  const currentYear = todayDate.getFullYear();

  const withUpcoming = items.map((bd) => {
    const bdDate = new Date(bd.date + "T00:00:00");
    const bdThisYear = new Date(currentYear, bdDate.getMonth(), bdDate.getDate());
    const checkBd = bdThisYear < todayDate
      ? new Date(currentYear + 1, bdDate.getMonth(), bdDate.getDate())
      : bdThisYear;
    const daysDiff = Math.ceil((checkBd.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return { ...bd, daysUntil: daysDiff, upcomingDate: checkBd.toISOString().split("T")[0] };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <>
      {withUpcoming.map((bd) => {
        const isClose = bd.daysUntil <= bd.reminderDaysBefore;
        return (
          <div
            key={bd.id}
            className={`rounded-xl border bg-white p-4 transition-all dark:bg-surface-900 ${
              isClose
                ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
                : "border-surface-200 dark:border-surface-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-pink-50 text-lg dark:bg-pink-900/20">
                  🎂
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{bd.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                    <span>{formatDate(bd.upcomingDate)}</span>
                    {bd.daysUntil === 0 ? (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">TODAY! 🎉</span>
                    ) : (
                      <span>· {bd.daysUntil} days away</span>
                    )}
                    <span>· Remind {bd.reminderDaysBefore} day{bd.reminderDaysBefore > 1 ? "s" : ""} before</span>
                  </div>
                  {bd.notes && (
                    <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{bd.notes}</p>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(bd.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function MedicineSection({ items, onDelete, onToggleTaken }: {
  items: MedicineReminder[]; onDelete: (id: string) => void; onToggleTaken: (id: string) => void;
}) {
  const t = todayStr();
  const active = items.filter((m) => !m.endDate || m.endDate >= t);
  const sorted = [...active].sort((a, b) => {
    if (a.frequency === "as-needed") return 1;
    if (b.frequency === "as-needed") return -1;
    return 0;
  });

  return (
    <>
      {sorted.map((med) => (
        <div
          key={med.id}
          className={`rounded-xl border bg-white p-4 transition-all dark:bg-surface-900 ${
            med.taken
              ? "border-surface-200 opacity-60 dark:border-surface-800"
              : "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <button
                onClick={() => { if (med.frequency !== "as-needed") onToggleTaken(med.id); }}
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  med.frequency === "as-needed" ? "cursor-default" : "hover:text-green-500"
                }`}
                style={{ color: med.taken ? "#22c55e" : med.frequency === "as-needed" ? "#9ca3af" : "#d1d5db" }}
              >
                {med.frequency === "as-needed" ? (
                  <RefreshCw className="size-5" />
                ) : med.taken ? (
                  <CheckCircle className="size-5" />
                ) : (
                  <Circle className="size-5" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${med.taken ? "text-surface-400 line-through dark:text-surface-500" : "text-surface-900 dark:text-surface-100"}`}>
                    {med.name}
                  </p>
                  {!med.taken && med.frequency !== "as-needed" && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      TAKE NOW
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                  <span>{med.dosage}</span>
                  <span>·</span>
                  <span>{MED_FREQ_LABEL[med.frequency]}</span>
                  {med.frequency !== "as-needed" && (
                    <>
                      <span>·</span>
                      <span>{med.timeOfDay}</span>
                    </>
                  )}
                  {med.endDate && (
                    <>
                      <span>·</span>
                      <span>Until {formatDate(med.endDate)}</span>
                    </>
                  )}
                </div>
                {med.notes && (
                  <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{med.notes}</p>
                )}
              </div>
            </div>
            <button onClick={() => onDelete(med.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500 transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function TasksSection({ items, onDelete, onToggleComplete }: {
  items: TaskReminder[]; onDelete: (id: string) => void; onToggleComplete: (id: string) => void;
}) {
  const sorted = [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <>
      {sorted.map((task) => {
        const overdue = !task.completed && isOverdue(task.dueDate);
        const due = !task.completed && isToday(task.dueDate);
        return (
          <div
            key={task.id}
            className={`rounded-xl border bg-white p-4 transition-all dark:bg-surface-900 ${
              overdue
                ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10"
                : due
                  ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
                  : task.completed
                    ? "border-surface-200 opacity-60 dark:border-surface-800"
                    : "border-surface-200 dark:border-surface-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-0.5 flex-shrink-0 text-surface-400 hover:text-green-500 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : overdue ? (
                    <AlertCircle className="size-5 text-red-500" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${task.completed ? "text-surface-400 line-through dark:text-surface-500" : "text-surface-900 dark:text-surface-100"}`}>
                      {task.title}
                    </p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${PRIORITY_CLASSES[task.priority]}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    {overdue && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">OVERDUE</span>}
                    {due && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">DUE TODAY</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  {task.notes && (
                    <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{task.notes}</p>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(task.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function AppointmentsSection({ items, onDelete }: {
  items: AppointmentReminder[]; onDelete: (id: string) => void;
}) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      {sorted.map((apt) => {
        const overdue = isOverdue(apt.date);
        const due = isToday(apt.date);
        return (
          <div
            key={apt.id}
            className={`rounded-xl border bg-white p-4 transition-all dark:bg-surface-900 ${
              overdue
                ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10"
                : due
                  ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
                  : "border-surface-200 dark:border-surface-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Stethoscope className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{apt.title}</p>
                    {overdue && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">PAST</span>}
                    {due && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">TODAY</span>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                    <span className="font-medium text-surface-700 dark:text-surface-300">{formatDate(apt.date)} at {apt.time}</span>
                    {apt.providerName && (
                      <>
                        <span>·</span>
                        <span>{apt.providerName}</span>
                      </>
                    )}
                    {apt.location && (
                      <>
                        <span>·</span>
                        <span>{apt.location}</span>
                      </>
                    )}
                  </div>
                  {apt.notes && (
                    <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{apt.notes}</p>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(apt.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function RenewalsSection({ items, onDelete }: {
  items: RenewalReminder[]; onDelete: (id: string) => void;
}) {
  const sorted = [...items].sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));

  return (
    <>
      {sorted.map((ren) => {
        const overdue = isOverdue(ren.expirationDate);
        const due = isToday(ren.expirationDate);
        const daysLeft = daysUntil(ren.expirationDate);
        return (
          <div
            key={ren.id}
            className={`rounded-xl border bg-white p-4 transition-all dark:bg-surface-900 ${
              overdue
                ? "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10"
                : daysLeft <= 30
                  ? "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10"
                  : "border-surface-200 dark:border-surface-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <RefreshCw className="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{ren.item}</p>
                    {overdue && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">EXPIRED</span>}
                    {due && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">EXPIRES TODAY</span>}
                    {!overdue && !due && daysLeft <= 30 && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">{daysLeft}d left</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                    <span>{formatDate(ren.expirationDate)}</span>
                    <span>·</span>
                    <span>{PERIOD_LABEL[ren.renewalPeriod]}</span>
                  </div>
                  {ren.notes && (
                    <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{ren.notes}</p>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(ren.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
