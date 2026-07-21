import type {
  LifeScoreResult,
  CategoryScores,
  ScoreFactor,
  Recommendation,
  LifeScoreEntry,
} from "~/types/lifescore";

// ── Finance ────────────────────────────────────────────
import {
  getTotalMonthlyIncome,
  getTotalMonthlyExpenses,
  getSavingsGoals,
  getRecurringBills,
  getBudget,
  getBudgetSpent,
} from "~/data/finances";

// ── Health ─────────────────────────────────────────────
import {
  getExerciseEntries,
  getWaterEntries,
  getSleepEntries,
  getWeightEntries,
  getMoodEntries,
  getSettings,
} from "~/data/health";

// ── Goals ──────────────────────────────────────────────
import { getGoals, getGoalsSummary } from "~/data/goals";

// ── Reminders ──────────────────────────────────────────
import { getRemindersSummary, getTasks } from "~/data/reminders";

// ── Calendar ───────────────────────────────────────────
import { getUpcomingEvents } from "~/data/calendar";

// ── Travel ─────────────────────────────────────────────
import { getTrips } from "~/data/travel";

// ── Documents ──────────────────────────────────────────
import { getDocuments } from "~/data/documents";

// ── Helpers ────────────────────────────────────────────
const STORAGE_KEY = "lifeos-lifescore-history";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ── Score Computation ──────────────────────────────────

function computeFinancialHealth(): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [];
  let score = 0;

  // Income vs expense ratio (10 pts)
  const income = getTotalMonthlyIncome();
  const expenses = getTotalMonthlyExpenses();
  const ratio = income > 0 ? expenses / income : 2;
  const ratioScore = ratio <= 0.7 ? 10 : ratio <= 0.85 ? 8 : ratio <= 1.0 ? 6 : ratio <= 1.2 ? 3 : 1;
  score += ratioScore;
  if (ratioScore >= 8) {
    factors.push({ label: "Income/Expense Ratio", impact: "positive", detail: `Spending ${Math.round(ratio * 100)}% of income — great margin`, route: "/finances" });
  } else if (ratioScore <= 3) {
    factors.push({ label: "Income/Expense Ratio", impact: "negative", detail: `Spending ${Math.round(ratio * 100)}% of income — tight margin`, route: "/finances" });
  }

  // Bills paid on time (7 pts)
  const bills = getRecurringBills();
  const paidCount = bills.filter((b) => b.status === "paid").length;
  const overdueCount = bills.filter((b) => b.status === "overdue").length;
  const billRatio = bills.length > 0 ? paidCount / bills.length : 1;
  const billScore = Math.round(billRatio * 7);
  score += billScore;
  if (overdueCount > 0) {
    factors.push({ label: "Overdue Bills", impact: "negative", detail: `${overdueCount} overdue bill(s)`, route: "/finances" });
  } else if (billRatio >= 0.9) {
    factors.push({ label: "Bills On Track", impact: "positive", detail: "All bills paid or on schedule", route: "/finances" });
  }

  // Savings goal progress (5 pts)
  const savingsGoals = getSavingsGoals();
  if (savingsGoals.length > 0) {
    const avgProgress = avg(savingsGoals.map((g) =>
      g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0
    ));
    const savingsScore = Math.round(avgProgress * 5);
    score += savingsScore;
    if (savingsScore >= 4) {
      factors.push({ label: "Savings Progress", impact: "positive", detail: "Savings goals on track", route: "/finances" });
    } else if (savingsScore <= 2 && savingsGoals.length > 0) {
      factors.push({ label: "Savings Lagging", impact: "negative", detail: "Behind on savings goals", route: "/finances" });
    }
  } else {
    score += 3; // neutral — no goals set
  }

  // Budget adherence (3 pts)
  const budget = getBudget();
  if (budget) {
    const spent = getBudgetSpent();
    const adherence = budget.totalBudget > 0 ? spent / budget.totalBudget : 1;
    const budgetScore = adherence <= 0.9 ? 3 : adherence <= 1.0 ? 2 : adherence <= 1.1 ? 1 : 0;
    score += budgetScore;
    if (budgetScore >= 2) {
      factors.push({ label: "Budget On Track", impact: "positive", detail: `Budget ${Math.round(adherence * 100)}% used`, route: "/finances" });
    } else if (budgetScore === 0) {
      factors.push({ label: "Budget Exceeded", impact: "negative", detail: "Over budget this month", route: "/finances" });
    }
  } else {
    score += 2; // neutral
  }

  return { score: clamp(score, 0, 25), factors };
}

function computePhysicalHealth(): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [];
  let score = 0;

  // Exercise frequency last 7 days (7 pts)
  const exercises = getExerciseEntries();
  const weekAgo = daysAgo(7);
  const recentExercises = exercises.filter((e) => e.date >= weekAgo);
  const exerciseSessions = recentExercises.length;
  const totalExerciseMins = recentExercises.reduce((s, e) => s + e.durationMinutes, 0);

  let exerciseScore: number;
  if (exerciseSessions >= 4) exerciseScore = 7;
  else if (exerciseSessions >= 2) exerciseScore = 5;
  else if (exerciseSessions >= 1) exerciseScore = 3;
  else exerciseScore = 0;
  score += exerciseScore;

  if (exerciseSessions >= 4) {
    factors.push({ label: "Exercise Routine", impact: "positive", detail: `${exerciseSessions} workouts — ${totalExerciseMins} mins this week`, route: "/health" });
  } else if (exerciseSessions < 2) {
    factors.push({ label: "Low Exercise", impact: "negative", detail: `Only ${exerciseSessions} workout(s) in 7 days`, route: "/health" });
  }

  // Water intake consistency (4 pts)
  const waterEntries = getWaterEntries();
  const recentWater = waterEntries.filter((w) => w.date >= weekAgo);
  const waterGoal = getSettings().waterGoalOz;
  const waterDaysHit = recentWater.filter((w) => w.totalOz >= waterGoal * 0.8).length;
  const waterScore = Math.min(4, Math.round((waterDaysHit / 7) * 4));
  score += waterScore;
  if (waterDaysHit >= 6) {
    factors.push({ label: "Hydration", impact: "positive", detail: "Consistently hitting water goal", route: "/health" });
  } else if (waterDaysHit < 3) {
    factors.push({ label: "Dehydration Risk", impact: "negative", detail: `Hitting water goal only ${waterDaysHit}/7 days`, route: "/health" });
  }

  // Sleep quality — hours and consistency (5 pts)
  const sleepEntries = getSleepEntries();
  const recentSleep = sleepEntries.filter((s) => s.date >= weekAgo);
  if (recentSleep.length > 0) {
    const avgHours = avg(recentSleep.map((s) => s.hours));
    const sleepGoal = getSettings().sleepGoalHours;
    const hoursScore = Math.min(2.5, (avgHours / sleepGoal) * 2.5);

    // Consistency: standard deviation (lower = better)
    const sleepVariance = recentSleep.length > 1
      ? Math.sqrt(avg(recentSleep.map((s) => (s.hours - avgHours) ** 2)))
      : 0;
    const consistencyScore = sleepVariance < 0.5 ? 2.5 : sleepVariance < 1.0 ? 1.5 : sleepVariance < 1.5 ? 0.5 : 0;

    score += hoursScore + consistencyScore;

    if (avgHours >= sleepGoal * 0.9) {
      factors.push({ label: "Good Sleep", impact: "positive", detail: `Avg ${avgHours.toFixed(1)}h — meeting goal`, route: "/health" });
    } else if (avgHours < sleepGoal * 0.7) {
      factors.push({ label: "Sleep Deprived", impact: "negative", detail: `Avg only ${avgHours.toFixed(1)}h — goal is ${sleepGoal}h`, route: "/health" });
    }
  } else {
    score += 3;
  }

  // Weight trend — stable/improving (4 pts)
  const weightEntries = getWeightEntries();
  const recentWeight = weightEntries.filter((w) => w.date >= daysAgo(30));
  if (recentWeight.length >= 2) {
    const oldest = recentWeight[0].weight;
    const newest = recentWeight[recentWeight.length - 1].weight;
    const change = newest - oldest;
    const pctChange = oldest > 0 ? (change / oldest) * 100 : 0;

    // Stable or slight decrease is good (health context — slight improvement)
    let weightScore: number;
    if (Math.abs(pctChange) <= 1) weightScore = 4; // stable
    else if (pctChange < 0 && pctChange >= -3) weightScore = 4; // gradual improvement
    else if (pctChange < -3) weightScore = 3; // rapid loss
    else if (pctChange <= 3) weightScore = 2; // slight gain
    else weightScore = 1; // rapid gain
    score += weightScore;

    if (weightScore >= 3) {
      factors.push({ label: "Weight Trend", impact: "positive", detail: "Weight stable or improving", route: "/health" });
    } else {
      factors.push({ label: "Weight Trend", impact: "negative", detail: "Weight trending upward recently", route: "/health" });
    }
  } else {
    score += 2;
  }

  return { score: clamp(Math.round(score), 0, 20), factors };
}

function computeMentalWellness(): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [];
  let score = 0;

  // Mood tracker average last 30 days (10 pts)
  const moodEntries = getMoodEntries();
  const recentMoods = moodEntries.filter((m) => m.date >= daysAgo(30));

  if (recentMoods.length > 0) {
    const moodValues: Record<string, number> = {
      "😊": 5, "😐": 3, "😞": 1, "😡": 0, "😴": 2,
    };
    const moodAvg = avg(recentMoods.map((m) => moodValues[m.mood] ?? 3));
    const moodScore = Math.round((moodAvg / 5) * 10);
    score += moodScore;

    // Consistency bonus — lower variance = higher score (5 pts)
    const moodVariance = recentMoods.length > 1
      ? Math.sqrt(avg(recentMoods.map((m) => ((moodValues[m.mood] ?? 3) - moodAvg) ** 2)))
      : 0;
    const consistencyBonus = moodVariance < 0.8 ? 5 : moodVariance < 1.2 ? 3 : moodVariance < 1.8 ? 1 : 0;
    score += consistencyBonus;

    if (moodAvg >= 4.5) {
      factors.push({ label: "Mood Excellent", impact: "positive", detail: "Consistently positive mood", route: "/health" });
    } else if (moodAvg >= 3.5) {
      factors.push({ label: "Mood Stable", impact: "positive", detail: "Generally balanced mood", route: "/health" });
    } else if (moodAvg < 2.5) {
      factors.push({ label: "Low Mood", impact: "negative", detail: "Mood has been trending low lately", route: "/health" });
    }

    if (consistencyBonus <= 1) {
      factors.push({ label: "Mood Volatility", impact: "negative", detail: "Large mood swings — stress indicator", route: "/health" });
    }
  } else {
    score += 8; // neutral
  }

  return { score: clamp(Math.round(score), 0, 15), factors };
}

function computeProductivity(): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [];
  let score = 0;

  // Goal completion rate (10 pts)
  const summary = getGoalsSummary();
  const goalRate = summary.completionRate;
  const goalScore = Math.round((goalRate / 100) * 10);
  score += goalScore;
  if (goalRate >= 60) {
    factors.push({ label: "Goal Progress", impact: "positive", detail: `${summary.completed}/${summary.total} goals completed`, route: "/goals" });
  } else if (goalRate < 30 && summary.total > 0) {
    factors.push({ label: "Goals Behind", impact: "negative", detail: "Low goal completion rate", route: "/goals" });
  }

  // Task reminders completed (5 pts)
  const tasks = getTasks();
  if (tasks.length > 0) {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const tasksCompleted = tasks.filter((t) => t.completed && t.dueDate >= daysAgo(7)).length;
    const totalRecent = tasks.filter((t) => t.dueDate >= daysAgo(7)).length;
    const taskRate = totalRecent > 0 ? tasksCompleted / totalRecent : 0;
    const taskScore = Math.round(taskRate * 5);
    score += taskScore;
    if (taskRate >= 0.8 && totalRecent > 0) {
      factors.push({ label: "Tasks On Track", impact: "positive", detail: "Most tasks completed on time", route: "/reminders" });
    } else if (taskRate < 0.5 && totalRecent > 2) {
      factors.push({ label: "Missed Tasks", impact: "negative", detail: `${totalRecent - tasksCompleted} tasks overdue or missed`, route: "/reminders" });
    }
  } else {
    score += 4;
  }

  // Habit streak maintenance (5 pts)
  const goals = getGoals();
  const habitGoals = goals.filter((g) => g.type === "habit");
  if (habitGoals.length > 0) {
    const avgStreak = avg(habitGoals.map((g) => g.currentStreak));
    const maxStreak = Math.max(...habitGoals.map((g) => g.currentStreak));
    const streakScore = Math.min(5, Math.round((avgStreak / 7) * 5));
    score += streakScore;
    if (maxStreak >= 14) {
      factors.push({ label: "Strong Habits", impact: "positive", detail: `Longest streak: ${maxStreak} days`, route: "/goals" });
    } else if (avgStreak < 2 && habitGoals.length > 2) {
      factors.push({ label: "Weak Habits", impact: "negative", detail: "Habit streaks are slipping", route: "/goals" });
    }
  } else {
    score += 3;
  }

  return { score: clamp(Math.round(score), 0, 20), factors };
}

function computeLifeManagement(): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [];
  let score = 0;

  // Calendar utilization — events this week (6 pts)
  const now = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  const upcomingEvents = getUpcomingEvents(50);
  const thisWeekEvents = upcomingEvents.filter((e) => {
    const d = new Date(e.startTime);
    return d >= now && d <= weekEnd;
  });
  const eventCount = thisWeekEvents.length;
  const calScore = eventCount >= 5 ? 6 : eventCount >= 3 ? 4 : eventCount >= 1 ? 2 : 0;
  score += calScore;
  if (eventCount >= 5) {
    factors.push({ label: "Active Calendar", impact: "positive", detail: `${eventCount} events this week — busy and organized`, route: "/calendar" });
  } else if (eventCount < 2) {
    factors.push({ label: "Empty Calendar", impact: "negative", detail: "Few events scheduled — calendar underutilized", route: "/calendar" });
  }

  // Reminders handled (6 pts)
  const remindersSummary = getRemindersSummary();
  const totalReminders = remindersSummary.total;
  const overdueReminders = remindersSummary.overdue;
  const dueToday = remindersSummary.dueToday;
  const handledOk = totalReminders - overdueReminders - (dueToday > 0 ? 0 : 0);
  const reminderRatio = totalReminders > 0 ? handledOk / totalReminders : 1;
  const reminderScore = Math.round(reminderRatio * 6);
  score += reminderScore;
  if (overdueReminders > 0) {
    factors.push({ label: "Overdue Reminders", impact: "negative", detail: `${overdueReminders} overdue — needs attention`, route: "/reminders" });
  } else if (reminderRatio >= 0.9 && totalReminders > 0) {
    factors.push({ label: "Reminders Clean", impact: "positive", detail: "No overdue reminders", route: "/reminders" });
  }

  // Documents organized (4 pts)
  const documents = getDocuments();
  const docCount = documents.length;
  let docScore: number;
  if (docCount >= 10) docScore = 4;
  else if (docCount >= 5) docScore = 3;
  else if (docCount >= 2) docScore = 2;
  else docScore = 1;
  score += docScore;
  if (docCount >= 8) {
    factors.push({ label: "Documents Organized", impact: "positive", detail: `${docCount} documents filed`, route: "/documents" });
  } else if (docCount < 3) {
    factors.push({ label: "Sparse Documents", impact: "negative", detail: "Few documents stored — add more", route: "/documents" });
  }

  // Upcoming trips planned (4 pts)
  const trips = getTrips();
  const upcomingTrips = trips.filter((t) => t.status === "upcoming" || t.status === "planning");
  const tripScore = upcomingTrips.length >= 2 ? 4 : upcomingTrips.length === 1 ? 3 : trips.length >= 1 ? 2 : 0;
  score += tripScore;
  if (upcomingTrips.length > 0) {
    factors.push({ label: "Trips Planned", impact: "positive", detail: `${upcomingTrips.length} trip(s) on the horizon`, route: "/travel" });
  }

  return { score: clamp(Math.round(score), 0, 20), factors };
}

// ── Main Computation ──────────────────────────────────

export function computeLifeScore(): LifeScoreResult {
  const financial = computeFinancialHealth();
  const physical = computePhysicalHealth();
  const mental = computeMentalWellness();
  const productivity = computeProductivity();
  const lifeManagement = computeLifeManagement();

  const categories: CategoryScores = {
    financialHealth: financial.score,
    physicalHealth: physical.score,
    mentalWellness: mental.score,
    productivity: productivity.score,
    lifeManagement: lifeManagement.score,
  };

  const total = Object.values(categories).reduce((s, v) => s + v, 0);

  // Collect all factors
  const allFactors: ScoreFactor[] = [
    ...financial.factors,
    ...physical.factors,
    ...mental.factors,
    ...productivity.factors,
    ...lifeManagement.factors,
  ];

  // Sort: negatives first (most impactful to improve), then positives
  const negativeFactors = allFactors.filter((f) => f.impact === "negative");
  const positiveFactors = allFactors.filter((f) => f.impact === "positive");
  const factors = [
    ...negativeFactors.slice(0, 3),
    ...positiveFactors.slice(0, 3),
  ];

  // Generate recommendations
  const recommendations: Recommendation[] = generateRecommendations(categories, negativeFactors);

  return { total, categories, factors, recommendations };
}

function generateRecommendations(
  categories: CategoryScores,
  negativeFactors: ScoreFactor[],
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Financial
  if (categories.financialHealth < 15) {
    const billsRec = negativeFactors.find((f) => f.label.includes("Bill"));
    if (billsRec) {
      recs.push({ text: "You have overdue bills — pay them to boost your score", actionLabel: "Open Finances", route: "/finances", icon: "💰" });
    }
    const savingsRec = negativeFactors.find((f) => f.label.includes("Savings"));
    if (savingsRec && recs.length < 5) {
      recs.push({ text: "Contribute to your savings goals to build financial security", actionLabel: "Open Finances", route: "/finances", icon: "💰" });
    }
    const budgetRec = negativeFactors.find((f) => f.label.includes("Budget"));
    if (budgetRec && recs.length < 5) {
      recs.push({ text: "Review your budget — you're spending more than planned", actionLabel: "Open Finances", route: "/finances", icon: "💰" });
    }
    const ratioRec = negativeFactors.find((f) => f.label.includes("Ratio"));
    if (ratioRec && recs.length < 5) {
      recs.push({ text: "Your expenses are high relative to income — look for ways to cut back", actionLabel: "Open Finances", route: "/finances", icon: "💰" });
    }
  }

  // Health
  if (categories.physicalHealth < 12) {
    const exerciseRec = negativeFactors.find((f) => f.label.includes("Exercise"));
    if (exerciseRec) {
      recs.push({ text: "You've missed workouts lately — schedule 3 sessions this week", actionLabel: "Open Health", route: "/health", icon: "💪" });
    }
    const sleepRec = negativeFactors.find((f) => f.label.includes("Sleep"));
    if (sleepRec && recs.length < 5) {
      recs.push({ text: "Your sleep is below target — aim for consistent bedtimes", actionLabel: "Open Health", route: "/health", icon: "💪" });
    }
    const waterRec = negativeFactors.find((f) => f.label.includes("Hydration") || f.label.includes("Dehydration"));
    if (waterRec && recs.length < 5) {
      recs.push({ text: "Drink more water — you're missing your daily hydration goal", actionLabel: "Open Health", route: "/health", icon: "💪" });
    }
  }

  // Mental
  if (categories.mentalWellness < 9) {
    const moodRec = negativeFactors.find((f) => f.label.includes("Mood"));
    if (moodRec) {
      recs.push({ text: "Your mood is trending low — try journaling or a mindful break", actionLabel: "Open Health", route: "/health", icon: "🧠" });
    }
  }

  // Productivity
  if (categories.productivity < 12) {
    const goalRec = negativeFactors.find((f) => f.label.includes("Goal"));
    if (goalRec) {
      recs.push({ text: "Focus on completing your most important goal this week", actionLabel: "Open Goals", route: "/goals", icon: "🎯" });
    }
    const taskRec = negativeFactors.find((f) => f.label.includes("Task"));
    if (taskRec && recs.length < 5) {
      recs.push({ text: "Clear your overdue tasks — tackle the highest priority first", actionLabel: "Open Reminders", route: "/reminders", icon: "🎯" });
    }
    const habitRec = negativeFactors.find((f) => f.label.includes("Habit"));
    if (habitRec && recs.length < 5) {
      recs.push({ text: "Rebuild your habit streaks — start with one small daily action", actionLabel: "Open Goals", route: "/goals", icon: "🎯" });
    }
  }

  // Life Management
  if (categories.lifeManagement < 12) {
    const calRec = negativeFactors.find((f) => f.label.includes("Calendar"));
    if (calRec) {
      recs.push({ text: "Plan your week — add events and reminders to stay organized", actionLabel: "Open Calendar", route: "/calendar", icon: "📋" });
    }
    const remRec = negativeFactors.find((f) => f.label.includes("Reminders"));
    if (remRec && recs.length < 5) {
      recs.push({ text: "Handle your overdue reminders to stay on top of things", actionLabel: "Open Reminders", route: "/reminders", icon: "📋" });
    }
  }

  // Fallback if no specific recommendations
  if (recs.length === 0) {
    recs.push({ text: "Track your mood daily to gain better mental health insights", actionLabel: "Open Health", route: "/health", icon: "🧠" });
    recs.push({ text: "Set up savings goals to build long-term financial health", actionLabel: "Open Finances", route: "/finances", icon: "💰" });
    recs.push({ text: "Create a weekly exercise habit — consistency is key", actionLabel: "Open Health", route: "/health", icon: "💪" });
  }

  return recs.slice(0, 5);
}

// ── History ────────────────────────────────────────────

function loadHistory(): LifeScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: LifeScoreEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getScoreHistory(): LifeScoreEntry[] {
  return loadHistory();
}

export function recordScore(result: LifeScoreResult): void {
  const history = loadHistory();
  const entry: LifeScoreEntry = {
    date: todayStr(),
    total: result.total,
    categories: result.categories,
  };

  // Update today's entry or add new
  const existing = history.findIndex((e) => e.date === entry.date);
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.push(entry);
  }

  // Keep last 30 days
  const recent = history
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  saveHistory(recent);
}

export function getPreviousScore(): LifeScoreEntry | null {
  const history = loadHistory();
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[1] ?? null; // second most recent
}

export function getWeekTrend(): "up" | "down" | "stable" {
  const history = loadHistory();
  if (history.length < 2) return "stable";

  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const prev = sorted.length >= 2 ? sorted[1] : null;

  if (!prev) return "stable";
  if (latest.total > prev.total + 2) return "up";
  if (latest.total < prev.total - 2) return "down";
  return "stable";
}
