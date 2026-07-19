import type {
  WeatherData,
  CalendarEvent,
  Goal,
  Bill,
  HealthSnapshot,
  TrafficEstimate,
  SleepRecommendation,
  BudgetData,
  AIBriefing,
  TimeOfDay,
} from "~/types/dashboard";
import { getTotalMonthlyIncome, getTotalMonthlyExpenses, getBudget as getFinanceBudget, getRecurringBills } from "~/data/finances";

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

export function getWeather(): WeatherData {
  return {
    temperature: 72,
    condition: "Partly Cloudy",
    icon: "cloud",
    location: "San Francisco, CA",
    high: 76,
    low: 58,
    humidity: 64,
  };
}

export function getEvents(): CalendarEvent[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: "1",
      title: "Design review",
      startTime: `${today}T10:00:00`,
      endTime: `${today}T11:00:00`,
      location: "Conference Room A",
      color: "#6366f1",
    },
    {
      id: "2",
      title: "Lunch with Sarah",
      startTime: `${today}T12:30:00`,
      endTime: `${today}T13:30:00`,
      location: "Blue Bottle Cafe",
      color: "#ec4899",
    },
    {
      id: "3",
      title: "Product sync",
      startTime: `${today}T15:00:00`,
      endTime: `${today}T15:45:00`,
      color: "#f59e0b",
    },
    {
      id: "4",
      title: "Yoga class",
      startTime: `${today}T18:00:00`,
      endTime: `${today}T19:00:00`,
      location: "Zen Studio",
      color: "#10b981",
    },
  ];
}

export function getGoals(): Goal[] {
  return [
    { id: "g1", title: "Complete project proposal", completed: true, category: "work" },
    { id: "g2", title: "30 min cardio workout", completed: true, category: "health" },
    { id: "g3", title: "Read 20 pages", completed: false, category: "personal" },
    { id: "g4", title: "Review monthly budget", completed: false, category: "finance" },
    { id: "g5", title: "Call mom", completed: false, category: "personal" },
  ];
}

export function getBills(): Bill[] {
  const allBills = getRecurringBills();
  // Only return unpaid/non-subscription bills for the dashboard widget, limit to 4
  return allBills
    .filter((b) => b.type === "bill" && b.status !== "paid")
    .slice(0, 4)
    .map((b) => ({
      id: b.id,
      name: b.name,
      amount: b.amount,
      dueDate: b.dueDate,
      status: b.status,
    }));
}

export function getHealthSnapshot(): HealthSnapshot {
  return {
    steps: 6820,
    stepGoal: 10000,
    waterOz: 48,
    waterGoalOz: 64,
    sleepHours: 7.2,
    sleepGoalHours: 8,
    activeMinutes: 42,
  };
}

export function getTraffic(): TrafficEstimate {
  return {
    commuteMinutes: 28,
    typicalMinutes: 22,
    condition: "moderate",
    destination: "Office",
  };
}

export function getSleepRecommendation(): SleepRecommendation {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const firstEventDate = tomorrow.toISOString().split("T")[0];

  return {
    bedtime: "10:30 PM",
    wakeTime: "6:30 AM",
    hoursRecommended: 8,
    firstEventTitle: "Standup meeting",
    firstEventTime: `${firstEventDate}T09:00:00`,
  };
}

export function getBudget(): BudgetData {
  const financeBudget = getFinanceBudget(); // from finances store (current month)
  const spent = getTotalMonthlyExpenses();
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - now.getDate();

  if (financeBudget) {
    return {
      spent,
      total: financeBudget.totalBudget,
      category: "Monthly Budget",
      daysRemaining,
    };
  }

  // Fallback if no budget exists
  const income = getTotalMonthlyIncome();
  return {
    spent: income > 0 ? Math.round(income * 0.65) : 3250,
    total: income > 0 ? Math.round(income * 0.8) : 5000,
    category: "Monthly Budget",
    daysRemaining,
  };
}

export function getAIBriefing(timeOfDay: TimeOfDay): AIBriefing {
  switch (timeOfDay) {
    case "morning":
      return {
        type: "morning",
        headline: "Here's your day ahead",
        mood: "productive",
        points: [
          "You have 3 meetings today — your first is Design review at 10:00 AM",
          "Traffic is moderate today, leave by 9:20 AM to arrive on time",
          "Electric bill is due today — pay now to avoid late fees",
          "You're 68% toward your daily step goal — a morning walk would help",
          "Weather: 72°F and partly cloudy — no umbrella needed",
        ],
      };
    case "afternoon":
      return {
        type: "afternoon",
        headline: "How's your day going?",
        mood: "balanced",
        points: [
          "2 tasks remaining — you're on track to complete your goals by 6 PM",
          "You've logged 4,200 steps so far — a post-lunch walk would put you ahead",
          "Water intake at 48 oz — drink 16 more oz before dinner",
          "Budget update: $1,750 remaining with 13 days left in the month",
          "Reminder: Yoga class at 6:00 PM at Zen Studio",
        ],
      };
    case "evening":
      return {
        type: "evening",
        headline: "Here's how your day went",
        mood: "reflective",
        points: [
          "You completed 3 of 5 goals today — great progress on the proposal",
          "Steps: 6,820 — 68% of your 10,000 goal. A short evening walk could close the gap",
          "Sleep recommendation: aim for 10:30 PM bedtime for 8 hours before tomorrow's 9 AM standup",
          "Credit card payment is overdue — schedule it now to avoid interest",
          "Tomorrow preview: 2 meetings, 3 tasks, and it's looking like a lighter day",
        ],
      };
  }
}

export function getRecentActivity(): string[] {
  return [
    "Updated weekly budget — 30 min ago",
    "Completed morning workout — 2 hours ago",
    "Added grocery list item — 4 hours ago",
  ];
}
