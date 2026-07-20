// ── Family Member ────────────────────────────────────────
export type FamilyRole = "Parent" | "Child" | "Partner" | "Grandparent" | "Other";

export const FAMILY_ROLES: FamilyRole[] = ["Parent", "Child", "Partner", "Grandparent", "Other"];

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  avatar: string; // emoji
  email?: string;
  phone?: string;
  birthday?: string; // ISO date
  color: string; // accent color hex for calendar display
}

export const MEMBER_COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

// ── Chore ─────────────────────────────────────────────────
export type ChorePriority = "low" | "medium" | "high";
export type ChoreRecurrence = "daily" | "weekly" | "monthly" | undefined;

export const CHORE_PRIORITY_LABELS: Record<ChorePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface Chore {
  id: string;
  name: string;
  assignedTo: string; // family member id
  dueDate: string; // ISO date YYYY-MM-DD
  completed: boolean;
  recurring?: ChoreRecurrence;
  priority: ChorePriority;
}

// ── Emergency Contact ──────────────────────────────────────
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
}

// ── Pet ────────────────────────────────────────────────────
export interface VaccinationRecord {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  type: string;
  notes?: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string; // e.g. "Dog", "Cat"
  breed: string;
  age?: number;
  vetName?: string;
  vetPhone?: string;
  notes?: string;
  vaccinations: VaccinationRecord[];
}

// ── Family Expense ─────────────────────────────────────────
export type FamilyExpenseCategory = "Groceries" | "Dining" | "Utilities" | "Entertainment" | "School" | "Medical" | "Shopping" | "Transport" | "Other";

export const FAMILY_EXPENSE_CATEGORIES: FamilyExpenseCategory[] = [
  "Groceries", "Dining", "Utilities", "Entertainment", "School", "Medical", "Shopping", "Transport", "Other",
];

export interface FamilyExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // family member id
  category: FamilyExpenseCategory;
  date: string; // ISO date YYYY-MM-DD
}

// ── Aggregate Store ────────────────────────────────────────
export interface FamilyData {
  members: FamilyMember[];
  chores: Chore[];
  contacts: EmergencyContact[];
  pets: Pet[];
  expenses: FamilyExpense[];
}
