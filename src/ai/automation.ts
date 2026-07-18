import { getBills, getBudget, getHealthSnapshot, getEvents } from "~/data/dashboard";

export interface AutomationCard {
  id: string;
  type: "warning" | "info" | "tip" | "suggestion";
  title: string;
  message: string;
  action?: {
    label: string;
    prompt: string;
  };
  icon: string; // emoji or icon key
  priority: number; // 0 = highest
  dismissed?: boolean;
}

const STORAGE_KEY = "lifeos-automation-dismissed";

function getDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isDismissed(id: string): boolean {
  return getDismissed().includes(id);
}

export function dismissAutomation(id: string): void {
  const dismissed = getDismissed();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  }
}

/**
 * Generate proactive automation suggestions based on current data.
 */
export function getAutomations(): AutomationCard[] {
  const cards: AutomationCard[] = [];
  const bills = getBills();
  const budget = getBudget();
  const health = getHealthSnapshot();
  const events = getEvents();

  // Bill warnings
  const overdue = bills.filter((b) => b.status === "overdue");
  for (const bill of overdue) {
    const id = `bill-overdue-${bill.id}`;
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "warning",
        title: "Overdue Bill",
        message: `Your **${bill.name}** payment of **$${bill.amount.toFixed(2)}** is overdue. Pay now to avoid late fees.`,
        action: { label: "View Bill", prompt: `Show my bills` },
        icon: "⚠️",
        priority: 0,
      });
    }
  }

  const dueToday = bills.filter((b) => b.status === "due-today");
  for (const bill of dueToday) {
    const id = `bill-due-${bill.id}`;
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "warning",
        title: "Bill Due Today",
        message: `**${bill.name}** ($${bill.amount.toFixed(2)}) is due today. Don't forget to pay!`,
        action: { label: "View Bills", prompt: `Show my bills` },
        icon: "📅",
        priority: 1,
      });
    }
  }

  // Budget alerts
  const spentPct = Math.round((budget.spent / budget.total) * 100);
  if (spentPct > 80) {
    const id = "budget-warning";
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "warning",
        title: "Budget Alert",
        message: `You've spent **${spentPct}%** of your monthly budget with **${budget.daysRemaining} days** remaining. Only **$${(budget.total - budget.spent).toLocaleString()}** left.`,
        action: {
          label: "Review Budget",
          prompt: "How's my budget?",
        },
        icon: "💰",
        priority: 2,
      });
    }
  }

  if (spentPct > 60 && spentPct <= 80) {
    const id = "budget-heads-up";
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "suggestion",
        title: "Budget Heads Up",
        message: `You've spent ${spentPct}% of your budget. You're on pace to finish the month with about **$${Math.round((budget.total - budget.spent) / Math.max(budget.daysRemaining, 1) * 30).toLocaleString()}** left — that's a bit tight.`,
        action: {
          label: "See Breakdown",
          prompt: "How's my budget?",
        },
        icon: "📊",
        priority: 3,
      });
    }
  }

  // Health suggestions
  const stepPct = Math.round((health.steps / health.stepGoal) * 100);
  if (stepPct < 40) {
    const id = "steps-low";
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "suggestion",
        title: "Get Moving!",
        message: `You're at **${stepPct}%** of your daily step goal. A 15-minute walk would make a big difference!`,
        action: {
          label: "Log Activity",
          prompt: "Track my steps",
        },
        icon: "🚶",
        priority: 3,
      });
    }
  }

  const waterPct = Math.round((health.waterOz / health.waterGoalOz) * 100);
  if (waterPct < 50) {
    const id = "water-low";
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "tip",
        title: "Stay Hydrated",
        message: `You've only had **${health.waterOz}oz** of water today. Try to drink **${health.waterGoalOz - health.waterOz}oz** more!`,
        action: { label: "Log Water", prompt: "Log water intake" },
        icon: "💧",
        priority: 4,
      });
    }
  }

  if (health.sleepHours < health.sleepGoalHours - 0.5) {
    const id = "sleep-low";
    if (!isDismissed(id)) {
      cards.push({
        id,
        type: "tip",
        title: "Sleep Check",
        message: `You slept **${health.sleepHours}h** last night — below your ${health.sleepGoalHours}h goal. Try going to bed 30 minutes earlier tonight.`,
        action: {
          label: "Sleep Tips",
          prompt: "Sleep recommendation",
        },
        icon: "😴",
        priority: 4,
      });
    }
  }

  // Upcoming event tomorrow morning
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowMorningEvents = events.filter((e) => {
    const eventDate = new Date(e.startTime);
    return (
      eventDate >= tomorrow &&
      eventDate < new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000)
    );
  });

  if (tomorrowMorningEvents.length > 0 && now.getHours() >= 20) {
    const id = "early-event-tomorrow";
    if (!isDismissed(id)) {
      const firstEvent = tomorrowMorningEvents[0];
      const eventTime = new Date(firstEvent.startTime).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit" },
      );
      cards.push({
        id,
        type: "info",
        title: "Early Start Tomorrow",
        message: `You have **"${firstEvent.title}"** at ${eventTime} tomorrow. Consider going to bed by 10:30 PM to get enough rest.`,
        action: {
          label: "Set Bedtime Alarm",
          prompt: "Sleep recommendation",
        },
        icon: "⏰",
        priority: 2,
      });
    }
  }

  // Sort by priority
  cards.sort((a, b) => a.priority - b.priority);

  return cards;
}
