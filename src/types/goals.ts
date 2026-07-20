// ── Categories ──────────────────────────────────────────
export type GoalCategory =
  | "personal"
  | "fitness"
  | "financial"
  | "career"
  | "education"
  | "habits";

export const CATEGORIES: { id: GoalCategory; label: string; color: string; bgClass: string; textClass: string }[] = [
  { id: "personal", label: "Personal", color: "#f59e0b", bgClass: "bg-amber-100 dark:bg-amber-900/50", textClass: "text-amber-600 dark:text-amber-400" },
  { id: "fitness", label: "Fitness", color: "#10b981", bgClass: "bg-emerald-100 dark:bg-emerald-900/50", textClass: "text-emerald-600 dark:text-emerald-400" },
  { id: "financial", label: "Financial", color: "#6366f1", bgClass: "bg-indigo-100 dark:bg-indigo-900/50", textClass: "text-indigo-600 dark:text-indigo-400" },
  { id: "career", label: "Career", color: "#8b5cf6", bgClass: "bg-violet-100 dark:bg-violet-900/50", textClass: "text-violet-600 dark:text-violet-400" },
  { id: "education", label: "Education", color: "#06b6d4", bgClass: "bg-cyan-100 dark:bg-cyan-900/50", textClass: "text-cyan-600 dark:text-cyan-400" },
  { id: "habits", label: "Habits", color: "#f97316", bgClass: "bg-orange-100 dark:bg-orange-900/50", textClass: "text-orange-600 dark:text-orange-400" },
];

export function getCategory(catId: GoalCategory) {
  return CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
}

// ── Goal Types ──────────────────────────────────────────
export type GoalType = "numeric" | "habit" | "binary";

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedAt?: string;
}

export interface HabitCheckIn {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface ProgressEntry {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  // Numeric
  currentValue: number;
  targetValue: number;
  unit: string;
  // Binary
  completed: boolean;
  completedAt?: string;
  // Habit
  habitCheckIns: HabitCheckIn[];
  currentStreak: number;
  bestStreak: number;
  // Common
  deadline?: string; // ISO date YYYY-MM-DD
  createdAt: string;
  milestones: Milestone[];
  progressHistory: ProgressEntry[];
}

// ── Computed ────────────────────────────────────────────
export function getProgress(goal: Goal): number {
  if (goal.type === "binary") return goal.completed ? 100 : 0;
  if (goal.type === "habit") {
    // Progress based on this week's check-ins
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysChecked = goal.habitCheckIns.filter((c) => {
      const d = new Date(c.date);
      const diff = (today.getTime() - d.getTime()) / 86400000;
      return diff >= 0 && diff < 7 && c.completed;
    }).length;
    return Math.min(100, Math.round((daysChecked / 7) * 100));
  }
  // numeric
  if (goal.targetValue <= 0) return 0;
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
}

export function getDaysRemaining(goal: Goal): number | null {
  if (!goal.deadline) return null;
  const d = new Date(goal.deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}

// ── Goals Summary ───────────────────────────────────────
export interface GoalsSummary {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
  totalStreaks: number;
  bestStreak: number;
  byCategory: Record<GoalCategory, { total: number; completed: number }>;
}
