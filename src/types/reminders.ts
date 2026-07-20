// ── Reminder Categories ──────────────────────────────────
export type ReminderCategory = "bills" | "birthdays" | "medicine" | "tasks" | "appointments" | "renewals";

export const REMINDER_CATEGORIES: ReminderCategory[] = [
  "bills",
  "birthdays",
  "medicine",
  "tasks",
  "appointments",
  "renewals",
];

export const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  bills: "Bills",
  birthdays: "Birthdays",
  medicine: "Medicine",
  tasks: "Tasks",
  appointments: "Appointments",
  renewals: "Renewals",
};

export const CATEGORY_ICONS: Record<ReminderCategory, string> = {
  bills: "💰",
  birthdays: "🎂",
  medicine: "💊",
  tasks: "✅",
  appointments: "🏥",
  renewals: "🔄",
};

// ── Bills ─────────────────────────────────────────────────
export type BillFrequency = "monthly" | "weekly" | "yearly" | "one-time";

export interface BillReminder {
  id: string;
  category: "bills";
  name: string;
  dueDate: string; // ISO date YYYY-MM-DD
  amount: number;
  recurring: BillFrequency;
  autoPay: boolean;
  paid: boolean;
  notes?: string;
}

// ── Birthdays ─────────────────────────────────────────────
export interface BirthdayReminder {
  id: string;
  category: "birthdays";
  name: string;
  date: string; // ISO date YYYY-MM-DD (year doesn't matter; we use month/day)
  reminderDaysBefore: number; // 7, 3, or 1 (week, 3 days, day of)
  notes?: string;
}

// ── Medicine ──────────────────────────────────────────────
export type MedicineFrequency = "daily" | "twice-daily" | "weekly" | "as-needed";

export interface MedicineReminder {
  id: string;
  category: "medicine";
  name: string;
  dosage: string;
  frequency: MedicineFrequency;
  timeOfDay: string; // e.g. "08:00", "08:00,20:00"
  startDate: string; // ISO date
  endDate?: string; // ISO date (optional for ongoing)
  taken: boolean; // reset daily
  notes?: string;
}

// ── Tasks ─────────────────────────────────────────────────
export type TaskPriority = "low" | "medium" | "high";

export interface TaskReminder {
  id: string;
  category: "tasks";
  title: string;
  dueDate: string; // ISO date YYYY-MM-DD
  priority: TaskPriority;
  completed: boolean;
  notes?: string;
}

// ── Appointments ──────────────────────────────────────────
export interface AppointmentReminder {
  id: string;
  category: "appointments";
  title: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // e.g. "14:00"
  location?: string;
  providerName?: string;
  notes?: string;
}

// ── Renewals ──────────────────────────────────────────────
export type RenewalPeriod = "annual" | "biannual" | "quarterly" | "monthly" | "once";

export interface RenewalReminder {
  id: string;
  category: "renewals";
  item: string;
  expirationDate: string; // ISO date YYYY-MM-DD
  renewalPeriod: RenewalPeriod;
  notes?: string;
}

// ── Union Type ────────────────────────────────────────────
export type Reminder =
  | BillReminder
  | BirthdayReminder
  | MedicineReminder
  | TaskReminder
  | AppointmentReminder
  | RenewalReminder;

// ── Aggregate Store ───────────────────────────────────────
export interface RemindersData {
  bills: BillReminder[];
  birthdays: BirthdayReminder[];
  medicine: MedicineReminder[];
  tasks: TaskReminder[];
  appointments: AppointmentReminder[];
  renewals: RenewalReminder[];
}

// ── Summary ───────────────────────────────────────────────
export interface RemindersSummary {
  total: number;
  dueToday: number;
  overdue: number;
}
