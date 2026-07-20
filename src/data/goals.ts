import type {
  Goal,
  GoalCategory,
  GoalType,
  Milestone,
  HabitCheckIn,
  ProgressEntry,
  GoalsSummary,
} from "~/types/goals";
import { getProgress } from "~/types/goals";

const STORAGE_KEY = "lifeos-goals";

// ── Helpers ────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// ── Seed Data ──────────────────────────────────────────
function createSeedData(): Goal[] {
  const now = new Date();
  const t = todayStr();

  const goals: Goal[] = [
    {
      id: "goal-1",
      title: "Save $15,000 Emergency Fund",
      description: "Build a fully-funded emergency fund covering 6 months of expenses. Contributing $1,250/month.",
      category: "financial",
      type: "numeric",
      currentValue: 8250,
      targetValue: 15000,
      unit: "$",
      completed: false,
      deadline: addDays(t, 180),
      createdAt: daysAgo(90),
      milestones: [
        { id: "ms-1a", title: "First $5,000 saved", targetValue: 5000, completed: true, completedAt: daysAgo(40) },
        { id: "ms-1b", title: "$10,000 halfway", targetValue: 10000, completed: false },
        { id: "ms-1c", title: "$12,500 — 5 months covered", targetValue: 12500, completed: false },
      ],
      habitCheckIns: [],
      currentStreak: 0,
      bestStreak: 0,
      progressHistory: [
        { date: daysAgo(90), value: 0 },
        { date: daysAgo(60), value: 3750 },
        { date: daysAgo(40), value: 5000 },
        { date: daysAgo(20), value: 7000 },
        { date: t, value: 8250 },
      ],
    },
    {
      id: "goal-2",
      title: "Read 20 Pages Daily",
      description: "Build a consistent reading habit. Aim for 20 pages every day — fiction, non-fiction, or articles.",
      category: "habits",
      type: "habit",
      currentValue: 0,
      targetValue: 7,
      unit: "days/week",
      completed: false,
      createdAt: daysAgo(30),
      milestones: [
        { id: "ms-2a", title: "7-day streak", targetValue: 7, completed: true, completedAt: daysAgo(10) },
        { id: "ms-2b", title: "30-day streak", targetValue: 30, completed: false },
      ],
      habitCheckIns: generateHabitChecks(30, 0.85),
      currentStreak: 12,
      bestStreak: 18,
      progressHistory: [],
    },
    {
      id: "goal-3",
      title: "Lose 15 lbs",
      description: "Reach healthy weight through consistent exercise and nutrition. Target: 2 lbs/week.",
      category: "fitness",
      type: "numeric",
      currentValue: 172,
      targetValue: 160,
      unit: "lbs",
      completed: false,
      deadline: addDays(t, 60),
      createdAt: daysAgo(21),
      milestones: [
        { id: "ms-3a", title: "Lost 5 lbs", targetValue: 170, completed: true, completedAt: daysAgo(10) },
        { id: "ms-3b", title: "Lost 10 lbs", targetValue: 165, completed: false },
        { id: "ms-3c", title: "Goal weight!", targetValue: 160, completed: false },
      ],
      habitCheckIns: [],
      currentStreak: 0,
      bestStreak: 0,
      progressHistory: [
        { date: daysAgo(21), value: 175 },
        { date: daysAgo(14), value: 174 },
        { date: daysAgo(10), value: 170 },
        { date: daysAgo(3), value: 172 },
        { date: t, value: 172 },
      ],
    },
    {
      id: "goal-4",
      title: "Get Passport",
      description: "Complete passport application — gather documents, photos, submit at post office.",
      category: "personal",
      type: "binary",
      currentValue: 0,
      targetValue: 1,
      unit: "",
      completed: false,
      deadline: addDays(t, 45),
      createdAt: daysAgo(7),
      milestones: [
        { id: "ms-4a", title: "Get passport photos taken", targetValue: 1, completed: true, completedAt: daysAgo(5) },
        { id: "ms-4b", title: "Fill out DS-11 form", targetValue: 2, completed: false },
        { id: "ms-4c", title: "Submit at post office", targetValue: 3, completed: false },
        { id: "ms-4d", title: "Receive passport", targetValue: 4, completed: false },
      ],
      habitCheckIns: [],
      currentStreak: 0,
      bestStreak: 0,
      progressHistory: [],
    },
    {
      id: "goal-5",
      title: "Complete TypeScript Certification",
      description: "Finish the advanced TypeScript course and pass the certification exam.",
      category: "career",
      type: "numeric",
      currentValue: 62,
      targetValue: 100,
      unit: "%",
      completed: false,
      deadline: addDays(t, 30),
      createdAt: daysAgo(14),
      milestones: [
        { id: "ms-5a", title: "Module 1-3 completed", targetValue: 30, completed: true, completedAt: daysAgo(10) },
        { id: "ms-5b", title: "Module 4-6 completed", targetValue: 60, completed: true, completedAt: daysAgo(2) },
        { id: "ms-5c", title: "Module 7-9 completed", targetValue: 85, completed: false },
        { id: "ms-5d", title: "Certification exam passed", targetValue: 100, completed: false },
      ],
      habitCheckIns: [],
      currentStreak: 0,
      bestStreak: 0,
      progressHistory: [
        { date: daysAgo(14), value: 0 },
        { date: daysAgo(10), value: 30 },
        { date: daysAgo(5), value: 45 },
        { date: daysAgo(2), value: 60 },
        { date: t, value: 62 },
      ],
    },
    {
      id: "goal-6",
      title: "Learn Spanish — A2 Level",
      description: "Complete Duolingo Spanish course through A2 level. Practice 15 minutes daily.",
      category: "education",
      type: "numeric",
      currentValue: 48,
      targetValue: 80,
      unit: "lessons",
      completed: false,
      deadline: addDays(t, 90),
      createdAt: daysAgo(45),
      milestones: [
        { id: "ms-6a", title: "Basics completed (20 lessons)", targetValue: 20, completed: true, completedAt: daysAgo(25) },
        { id: "ms-6b", title: "Phrases & travel (40 lessons)", targetValue: 40, completed: true, completedAt: daysAgo(5) },
        { id: "ms-6c", title: "A1 level complete (60 lessons)", targetValue: 60, completed: false },
        { id: "ms-6d", title: "A2 level complete (80 lessons)", targetValue: 80, completed: false },
      ],
      habitCheckIns: [],
      currentStreak: 0,
      bestStreak: 0,
      progressHistory: [
        { date: daysAgo(45), value: 0 },
        { date: daysAgo(30), value: 12 },
        { date: daysAgo(15), value: 28 },
        { date: t, value: 48 },
      ],
    },
  ];

  return goals;
}

function generateHabitChecks(days: number, rate: number): HabitCheckIn[] {
  const checks: HabitCheckIn[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i);
    // Make recent days more likely completed
    const recentBias = i < 7 ? 0.15 : 0;
    checks.push({
      date,
      completed: Math.random() < rate + recentBias,
    });
  }
  return checks;
}

// ── Persistence ─────────────────────────────────────────
function loadData(): Goal[] {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Goal[];
  } catch {
    // corrupted
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: Goal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: Goal[] | null = null;
function getData(): Goal[] {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 200;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: CRUD ────────────────────────────────────
export function getGoals(): Goal[] {
  return getData();
}

export function getGoalsByCategory(category: GoalCategory | "all"): Goal[] {
  const goals = getData();
  if (category === "all") return goals;
  return goals.filter((g) => g.category === category);
}

export function getGoal(id: string): Goal | undefined {
  return getData().find((g) => g.id === id);
}

export function addGoal(data: {
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  targetValue: number;
  unit: string;
  deadline?: string;
  milestones: Omit<Milestone, "id" | "completed">[];
}): Goal {
  const store = getData();
  const goal: Goal = {
    id: genId("goal"),
    title: data.title,
    description: data.description,
    category: data.category,
    type: data.type,
    currentValue: 0,
    targetValue: data.targetValue,
    unit: data.unit,
    completed: false,
    deadline: data.deadline,
    createdAt: todayStr(),
    milestones: data.milestones.map((m, i) => ({
      ...m,
      id: genId("ms"),
      completed: false,
    })),
    habitCheckIns: [],
    currentStreak: 0,
    bestStreak: 0,
    progressHistory: [{ date: todayStr(), value: 0 }],
  };
  store.push(goal);
  persist();
  return goal;
}

export function updateGoal(id: string, updates: Partial<Pick<Goal, "title" | "description" | "deadline" | "currentValue" | "targetValue" | "unit">>): void {
  const store = getData();
  const idx = store.findIndex((g) => g.id === id);
  if (idx === -1) return;
  store[idx] = { ...store[idx], ...updates };
  // Track progress history for numeric goals
  if (updates.currentValue !== undefined && store[idx].type === "numeric") {
    const t = todayStr();
    const existing = store[idx].progressHistory.find((p) => p.date === t);
    if (existing) {
      existing.value = updates.currentValue;
    } else {
      store[idx].progressHistory.push({ date: t, value: updates.currentValue });
    }
  }
  persist();
}

export function deleteGoal(id: string): void {
  const store = getData();
  const filtered = store.filter((g) => g.id !== id);
  _cache = filtered;
  persist();
}

export function toggleGoalComplete(id: string): void {
  const store = getData();
  const goal = store.find((g) => g.id === id);
  if (!goal || goal.type !== "binary") return;
  goal.completed = !goal.completed;
  goal.completedAt = goal.completed ? todayStr() : undefined;
  persist();
}

// ── Public API: Numeric Progress ────────────────────────
export function updateProgress(id: string, value: number): void {
  const store = getData();
  const goal = store.find((g) => g.id === id);
  if (!goal || goal.type !== "numeric") return;
  goal.currentValue = value;
  const t = todayStr();
  const existing = goal.progressHistory.find((p) => p.date === t);
  if (existing) {
    existing.value = value;
  } else {
    goal.progressHistory.push({ date: t, value });
  }
  // Check milestones
  for (const ms of goal.milestones) {
    if (!ms.completed && value >= ms.targetValue) {
      ms.completed = true;
      ms.completedAt = t;
    }
  }
  persist();
}

// ── Public API: Habit Check-ins ─────────────────────────
export function checkInHabit(id: string): HabitCheckIn {
  const store = getData();
  const goal = store.find((g) => g.id === id);
  if (!goal || goal.type !== "habit") throw new Error("Not a habit goal");
  const t = todayStr();
  const existing = goal.habitCheckIns.find((c) => c.date === t);
  if (existing) {
    existing.completed = !existing.completed;
  } else {
    goal.habitCheckIns.push({ date: t, completed: true });
  }
  recalcStreak(goal);
  persist();
  return goal.habitCheckIns.find((c) => c.date === t)!;
}

export function getTodayHabitStatus(id: string): boolean {
  const goal = getData().find((g) => g.id === id);
  if (!goal || goal.type !== "habit") return false;
  const t = todayStr();
  return goal.habitCheckIns.find((c) => c.date === t)?.completed ?? false;
}

function recalcStreak(goal: Goal): void {
  const checks = [...goal.habitCheckIns]
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort()
    .reverse();
  
  let streak = 0;
  const t = todayStr();
  let checkDate = new Date(t);
  
  // Count backwards from today
  for (let i = 0; i < 365; i++) {
    const ds = checkDate.toISOString().split("T")[0];
    if (checks.includes(ds)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (ds === t) {
      // Today not yet checked — still count if yesterday was checked
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  
  goal.currentStreak = streak;
  goal.bestStreak = Math.max(goal.bestStreak, streak);
}

// ── Public API: Milestones ──────────────────────────────
export function addMilestone(goalId: string, data: { title: string; targetValue: number }): void {
  const goal = getData().find((g) => g.id === goalId);
  if (!goal) return;
  goal.milestones.push({
    id: genId("ms"),
    title: data.title,
    targetValue: data.targetValue,
    completed: false,
  });
  persist();
}

export function toggleMilestone(goalId: string, msId: string): void {
  const goal = getData().find((g) => g.id === goalId);
  if (!goal) return;
  const ms = goal.milestones.find((m) => m.id === msId);
  if (!ms) return;
  ms.completed = !ms.completed;
  ms.completedAt = ms.completed ? todayStr() : undefined;
  persist();
}

export function deleteMilestone(goalId: string, msId: string): void {
  const goal = getData().find((g) => g.id === goalId);
  if (!goal) return;
  goal.milestones = goal.milestones.filter((m) => m.id !== msId);
  persist();
}

// ── Public API: Summary ─────────────────────────────────
export function getGoalsSummary(): GoalsSummary {
  const goals = getData();
  const completed = goals.filter((g) => {
    if (g.type === "binary") return g.completed;
    return getProgress(g) >= 100;
  });
  const active = goals.filter((g) => {
    if (g.type === "binary") return !g.completed;
    return getProgress(g) < 100;
  });

  const byCategory = {} as Record<GoalCategory, { total: number; completed: number }>;
  for (const g of goals) {
    if (!byCategory[g.category]) byCategory[g.category] = { total: 0, completed: 0 };
    byCategory[g.category].total++;
    const done = g.type === "binary" ? g.completed : getProgress(g) >= 100;
    if (done) byCategory[g.category].completed++;
  }

  const habitGoals = goals.filter((g) => g.type === "habit");
  const bestStreak = habitGoals.reduce((max, g) => Math.max(max, g.bestStreak), 0);

  return {
    total: goals.length,
    active: active.length,
    completed: completed.length,
    completionRate: goals.length > 0 ? Math.round((completed.length / goals.length) * 100) : 0,
    totalStreaks: habitGoals.reduce((s, g) => s + g.currentStreak, 0),
    bestStreak,
    byCategory,
  };
}

// ── Public API: Weekly Habit Grid ───────────────────────
export function getWeeklyHabitGrid(goalId: string): { day: string; label: string; completed: boolean; date: string }[] {
  const goal = getData().find((g) => g.id === goalId);
  const days: { day: string; label: string; completed: boolean; date: string }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const currentDay = today.getDay();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - (currentDay - i));
    const ds = d.toISOString().split("T")[0];
    const completed = goal?.habitCheckIns.find((c) => c.date === ds)?.completed ?? false;
    days.push({ day: dayNames[i], label: String(d.getDate()), completed, date: ds });
  }
  return days;
}

// ── Reset ───────────────────────────────────────────────
export function resetGoalsData(): void {
  _cache = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
