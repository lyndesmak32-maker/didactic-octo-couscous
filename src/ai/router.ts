import {
  getEvents,
  getGoals,
  getBills,
  getHealthSnapshot,
  getBudget,
  getWeather,
  getTraffic,
  getSleepRecommendation,
  getTimeOfDay,
  getAIBriefing,
} from "~/data/dashboard";
import { getMemories, getMemoryContext } from "./memory";
import { getAutomations } from "./automation";
import { getPlans, generatePlan } from "./planner";
import type { AIResponse, AICommand } from "./types";

export type { AIResponse, AICommand } from "./types";

type CommandHandler = (input: string) => AIResponse;

const handlers: Record<string, CommandHandler> = {
  calendar: handleCalendar,
  finances: handleFinances,
  reminders: handleReminders,
  health: handleHealth,
  goals: handleGoals,
  shopping: handleShopping,
  documents: handleDocuments,
  travel: handleTravel,
  general: handleGeneral,
  memory: handleMemoryCommands,
};

/**
 * Main entry point: route user input to the appropriate handler.
 */
export function routeCommand(input: string): AIResponse {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      category: "general",
      message: "I'm listening! What would you like help with?",
      suggestions: [
        "Plan my week",
        "How's my budget?",
        "What's on my calendar?",
        "Set a reminder",
      ],
    };
  }

  const lower = trimmed.toLowerCase();

  // Check for memory commands first
  if (
    lower.startsWith("remember") ||
    lower.startsWith("i hate") ||
    lower.startsWith("i love") ||
    lower.startsWith("i prefer") ||
    lower.startsWith("i like") ||
    lower.startsWith("i dislike") ||
    lower.startsWith("my favorite") ||
    lower.startsWith("i have") ||
    lower.startsWith("i am") ||
    lower.startsWith("i'm") ||
    lower.startsWith("forget that") ||
    lower.startsWith("what do you know")
  ) {
    return handlers.memory(trimmed);
  }

  // Plan generation
  if (
    lower.includes("i want to lose") ||
    lower.includes("i want to save") ||
    lower.includes("i want to start") ||
    lower.includes("i want to learn") ||
    lower.includes("i want to run") ||
    lower.includes("i want to build") ||
    lower.includes("i want to write") ||
    lower.includes("i want to get") ||
    lower.includes("help me plan") ||
    lower.includes("create a plan") ||
    lower.includes("make a plan")
  ) {
    return handlePlanGeneration(trimmed);
  }

  // Calendar
  if (
    lower.includes("schedule") ||
    lower.includes("plan my week") ||
    lower.includes("plan my day") ||
    lower.includes("what's next") ||
    lower.includes("create event") ||
    lower.includes("my calendar") ||
    lower.includes("upcoming") ||
    lower.includes("appointment") ||
    lower.includes("what's on my")
  ) {
    return handlers.calendar(trimmed);
  }

  // Finances
  if (
    lower.includes("budget") ||
    lower.includes("can i afford") ||
    lower.includes("spending") ||
    lower.includes("bills") ||
    lower.includes("money") ||
    lower.includes("expense") ||
    lower.includes("save money") ||
    lower.includes("how much")
  ) {
    return handlers.finances(trimmed);
  }

  // Reminders
  if (
    lower.includes("remind") ||
    lower.includes("what's due") ||
    lower.includes("deadline") ||
    lower.includes("task") ||
    lower.includes("to-do") ||
    lower.includes("todo")
  ) {
    return handlers.reminders(trimmed);
  }

  // Health
  if (
    lower.includes("workout") ||
    lower.includes("log water") ||
    lower.includes("sleep") ||
    lower.includes("steps") ||
    lower.includes("health") ||
    lower.includes("exercise") ||
    lower.includes("fitness") ||
    lower.includes("hydration")
  ) {
    return handlers.health(trimmed);
  }

  // Goals
  if (
    lower.includes("goal") ||
    lower.includes("progress") ||
    lower.includes("track") ||
    lower.includes("achievement") ||
    lower.includes("resolution")
  ) {
    return handlers.goals(trimmed);
  }

  // Shopping
  if (
    lower.includes("add to list") ||
    lower.includes("groceries") ||
    lower.includes("buy") ||
    lower.includes("shopping") ||
    lower.includes("purchase")
  ) {
    return handlers.shopping(trimmed);
  }

  // Documents
  if (
    lower.includes("find document") ||
    lower.includes("where is my") ||
    lower.includes("search for") ||
    lower.includes("file")
  ) {
    return handlers.documents(trimmed);
  }

  // Travel
  if (
    lower.includes("plan trip") ||
    lower.includes("flight") ||
    lower.includes("itinerary") ||
    lower.includes("travel") ||
    lower.includes("vacation") ||
    lower.includes("hotel")
  ) {
    return handlers.travel(trimmed);
  }

  // General / fallback
  return handlers.general(trimmed);
}

function handleCalendar(input: string): AIResponse {
  const events = getEvents();
  const lower = input.toLowerCase();

  if (lower.includes("plan my week") || lower.includes("plan my day")) {
    const eventList = events
      .map((e) => {
        const startTime = new Date(e.startTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        const location = e.location ? ` at ${e.location}` : "";
        return `- **${e.title}** — ${startTime}${location}`;
      })
      .join("\n");

    return {
      category: "calendar",
      message: `Here's your schedule for today:\n\n${eventList}\n\nYou have **${events.length} events** today. Need me to add anything?`,
      data: { events },
    };
  }

  if (lower.includes("what's next") || lower.includes("upcoming")) {
    const now = new Date();
    const upcoming = events
      .filter((e) => new Date(e.startTime) > now)
      .slice(0, 2);

    if (upcoming.length === 0) {
      return {
        category: "calendar",
        message:
          "You have no more events today. Enjoy your free time! Want to schedule something?",
      };
    }

    const next = upcoming[0];
    const startTime = new Date(next.startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return {
      category: "calendar",
      message: `Next up: **${next.title}** at ${startTime}${next.location ? ` — ${next.location}` : ""}.`,
      data: { nextEvent: next },
    };
  }

  // Default calendar response
  const briefing = getAIBriefing(getTimeOfDay());
  return {
    category: "calendar",
    message: `Here's a quick overview: you have **${events.length} events** today. ${briefing.points[0]}`,
    suggestions: ["Plan my week", "What's next?", "Add an event"],
  };
}

function handleFinances(input: string): AIResponse {
  const budget = getBudget();
  const bills = getBills();
  const lower = input.toLowerCase();

  if (lower.includes("can i afford")) {
    const match = input.match(/can i afford (?:a |an )?(.+)\?/i);
    const item = match ? match[1] : "that";
    const remaining = budget.total - budget.spent;

    if (remaining > 500) {
      return {
        category: "finances",
        message: `Based on your budget, you have **$${remaining.toLocaleString()} remaining** with ${budget.daysRemaining} days left. A ${item} should be manageable — just keep an eye on upcoming bills!`,
      };
    } else if (remaining > 100) {
      return {
        category: "finances",
        message: `You have **$${remaining.toLocaleString()} remaining** this month. A ${item} might be tight — you have **$${bills.filter((b) => b.status === "upcoming" || b.status === "due-today").reduce((s, b) => s + b.amount, 0).toLocaleString()}** in bills coming up.`,
      };
    } else {
      return {
        category: "finances",
        message: `You only have **$${remaining.toLocaleString()} left** this month. I'd recommend waiting on the ${item} until next month.`,
      };
    }
  }

  if (lower.includes("bills")) {
    const overdue = bills.filter((b) => b.status === "overdue");
    const dueToday = bills.filter((b) => b.status === "due-today");
    const upcoming = bills.filter((b) => b.status === "upcoming");

    let msg = "**Your bills:**\n\n";
    if (overdue.length) {
      msg += `⚠️ **Overdue:** ${overdue.map((b) => `${b.name} ($${b.amount})`).join(", ")}\n`;
    }
    if (dueToday.length) {
      msg += `📅 **Due today:** ${dueToday.map((b) => `${b.name} ($${b.amount})`).join(", ")}\n`;
    }
    if (upcoming.length) {
      msg += `⏳ **Upcoming:** ${upcoming.map((b) => `${b.name} ($${b.amount})`).join(", ")}`;
    }

    return { category: "finances", message: msg };
  }

  // Default: budget overview
  const spentPct = Math.round((budget.spent / budget.total) * 100);
  return {
    category: "finances",
    message: `You've spent **$${budget.spent.toLocaleString()}** of your **$${budget.total.toLocaleString()}** monthly budget (${spentPct}%). You have **$${(budget.total - budget.spent).toLocaleString()} remaining** with ${budget.daysRemaining} days left.\n\nYou have **${bills.filter((b) => b.status === "upcoming" || b.status === "due-today").length} bills** due soon totaling **$${bills.filter((b) => b.status === "upcoming" || b.status === "due-today").reduce((s, b) => s + b.amount, 0).toLocaleString()}**.`,
    suggestions: ["Can I afford a vacation?", "Show my bills", "Track spending"],
  };
}

function handleReminders(input: string): AIResponse {
  const goals = getGoals();
  const incomplete = goals.filter((g) => !g.completed);
  const lower = input.toLowerCase();

  if (lower.includes("what's due")) {
    if (incomplete.length === 0) {
      return {
        category: "reminders",
        message: "You're all caught up! No pending tasks. 🎉",
      };
    }
    return {
      category: "reminders",
      message: `You have **${incomplete.length} pending tasks**:\n\n${incomplete.map((g) => `- ${g.title}`).join("\n")}\n\nWant me to prioritize these?`,
      data: { tasks: incomplete },
    };
  }

  if (lower.includes("remind me") || lower.includes("set reminder")) {
    const reminderMatch =
      input.match(/remind me (?:to )?(.+?)(?: at | on | in )(.+)/i) ||
      input.match(/set (?:a )?reminder (?:for |to )?(.+?)(?: at | on | in )(.+)/i);

    if (reminderMatch) {
      return {
        category: "reminders",
        message: `✅ Reminder set: **"${reminderMatch[1].trim()}"** — ${reminderMatch[2].trim()}. I'll make sure you don't forget!`,
        data: {
          reminder: reminderMatch[1].trim(),
          time: reminderMatch[2].trim(),
        },
      };
    }
  }

  return {
    category: "reminders",
    message: `You have **${incomplete.length} tasks remaining** today. Here's what's left:\n\n${incomplete.length > 0 ? incomplete.map((g) => `- ${g.title}`).join("\n") : "Nothing! Great job!"}`,
    suggestions: ["What's due?", "Remind me to...", "Set a reminder"],
  };
}

function handleHealth(input: string): AIResponse {
  const health = getHealthSnapshot();
  const lower = input.toLowerCase();

  if (lower.includes("steps")) {
    const pct = Math.round((health.steps / health.stepGoal) * 100);
    return {
      category: "health",
      message: `You've taken **${health.steps.toLocaleString()} steps** today (${pct}% of your ${health.stepGoal.toLocaleString()} goal). ${pct < 50 ? "A walk would help you catch up!" : "You're on track — keep it up! 💪"}`,
    };
  }

  if (lower.includes("water") || lower.includes("hydration")) {
    const pct = Math.round((health.waterOz / health.waterGoalOz) * 100);
    return {
      category: "health",
      message: `Water intake: **${health.waterOz} oz** of ${health.waterGoalOz} oz (${pct}%). ${pct < 70 ? "Try to drink more water before the day ends!" : "Great hydration! 💧"}`,
    };
  }

  if (lower.includes("sleep")) {
    const sleep = getSleepRecommendation();
    return {
      category: "health",
      message: `Last night you slept **${health.sleepHours}h** (goal: ${health.sleepGoalHours}h).\n\nTonight's recommendation: go to bed by **${sleep.bedtime}** to wake at **${sleep.wakeTime}** — you'll get ${sleep.hoursRecommended}h before your ${sleep.firstEventTime ? new Date(sleep.firstEventTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "morning"} ${sleep.firstEventTitle}.`,
    };
  }

  // Default health summary
  const stepPct = Math.round((health.steps / health.stepGoal) * 100);
  const waterPct = Math.round((health.waterOz / health.waterGoalOz) * 100);

  return {
    category: "health",
    message: `**Today's health snapshot:**\n\n- 🚶 Steps: **${health.steps.toLocaleString()}** (${stepPct}% of goal)\n- 💧 Water: **${health.waterOz} oz** (${waterPct}% of goal)\n- 😴 Sleep: **${health.sleepHours}h** last night\n- 🔥 Active minutes: **${health.activeMinutes} min**\n\nYou're doing well! Need specific health advice?`,
    suggestions: [
      "How are my steps?",
      "Track water",
      "Sleep recommendation",
    ],
  };
}

function handleGoals(input: string): AIResponse {
  const goals = getGoals();
  const completed = goals.filter((g) => g.completed);
  const incomplete = goals.filter((g) => !g.completed);

  if (incomplete.length === 0) {
    return {
      category: "goals",
      message: `Amazing! You've completed all **${goals.length} goals** today. 🎉 Time to set some new ones?`,
      suggestions: ["Set a new goal", "Review progress", "Plan tomorrow"],
    };
  }

  return {
    category: "goals",
    message: `**Goal progress:** ${completed.length}/${goals.length} completed\n\n✅ Done:\n${completed.map((g) => `- ~~${g.title}~~`).join("\n")}\n\n⏳ Remaining:\n${incomplete.map((g) => `- ${g.title}`).join("\n")}\n\nKeep pushing — you've got this!`,
    suggestions: ["Track progress", "Set a new goal", "What's left?"],
  };
}

function handleShopping(input: string): AIResponse {
  const lower = input.toLowerCase();

  if (lower.includes("add to list") || lower.includes("add")) {
    const itemMatch = input.match(/(?:add|put) (.+?)(?: to | on )?(?:my |the )?(?:list|shopping)/i);
    const item = itemMatch ? itemMatch[1].trim() : input.replace(/add to (?:my |the )?(?:list|shopping)/i, "").trim();

    return {
      category: "shopping",
      message: `✅ Added **"${item}"** to your shopping list. You now have several items ready for your next trip.`,
      data: { addedItem: item },
    };
  }

  if (lower.includes("groceries")) {
    return {
      category: "shopping",
      message: `**Your grocery list:**\n\n🥛 Milk\n🍞 Bread\n🥚 Eggs\n🧈 Butter\n🥑 Avocados\n\nAnything else to add?`,
      suggestions: ["Add to list", "Plan grocery trip", "Find deals"],
    };
  }

  return {
    category: "shopping",
    message: "What would you like to shop for? I can help manage your grocery list, track purchases, and find good deals.",
    suggestions: ["Add to list", "Show groceries", "Buy...", "Shopping list"],
  };
}

function handleDocuments(input: string): AIResponse {
  return {
    category: "documents",
    message: "Your document vault is ready. I can help you find files, organize documents, and keep important papers secure.\n\n**Recent documents:**\n- 📄 Tax Return 2025\n- 📄 Car Insurance Policy\n- 📄 Medical Records\n- 📄 Lease Agreement\n\nWhat are you looking for?",
    suggestions: [
      "Find document...",
      "Where is my insurance?",
      "Upload file",
    ],
  };
}

function handleTravel(input: string): AIResponse {
  if (input.toLowerCase().includes("plan trip")) {
    return {
      category: "travel",
      message: "I'd love to help plan your trip! Where are you thinking of going? I can help with flights, hotels, itinerary planning, and packing lists. Just tell me your destination and dates!",
      suggestions: [
        "Plan trip to Tokyo",
        "Find flights",
        "Pack for a weekend",
      ],
    };
  }

  if (input.toLowerCase().includes("flight")) {
    return {
      category: "travel",
      message: "I can help you search for flights! Where are you flying from and to? I'll find the best options for your dates and budget.",
    };
  }

  return {
    category: "travel",
    message: "Ready to plan your next adventure? I can help with flights, hotels, itineraries, packing lists, and travel documents. Where to? ✈️",
    suggestions: [
      "Plan a trip",
      "Find flights",
      "Create itinerary",
      "Pack for...",
    ],
  };
}

function handleGeneral(input: string): AIResponse {
  const lower = input.toLowerCase();
  const automations = getAutomations();

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(lower)) {
    const timeOfDay = getTimeOfDay();
    const greeting =
      timeOfDay === "morning"
        ? "Good morning"
        : timeOfDay === "afternoon"
          ? "Good afternoon"
          : "Good evening";

    return {
      category: "general",
      message: `${greeting}! 👋 I'm your LifeOS assistant. I can help with:\n\n- 📅 **Calendar** — schedule & manage events\n- 💰 **Finances** — track budget & bills\n- 🏃 **Health** — monitor fitness & sleep\n- 🎯 **Goals** — set & track progress\n- 🛒 **Shopping** — manage lists\n- ✈️ **Travel** — plan trips\n- 📝 **Reminders** — never forget\n- 📄 **Documents** — find & organize\n\nJust tell me what you need!${automations.length > 0 ? `\n\nAlso, I have **${automations.length} suggestions** for you — check the cards below!` : ""}`,
      suggestions: [
        "Plan my week",
        "How's my budget?",
        "What's on my calendar?",
        "Track my health",
      ],
    };
  }

  // Help / what can you do
  if (lower.includes("help") || lower.includes("what can you do")) {
    return {
      category: "general",
      message: "I'm your AI chief of staff for LifeOS! Here's what I can do:\n\n**📅 Calendar** — Schedule events, plan your week, check what's next\n**💰 Finances** — Monitor budget, track bills, check if you can afford things\n**🏃 Health** — Track steps, water, sleep, and activity\n**🎯 Goals** — Set goals, track progress, get motivated\n**🛒 Shopping** — Manage grocery lists and purchases\n**✈️ Travel** — Plan trips, find flights, build itineraries\n**📝 Reminders** — Set reminders and track tasks\n**📄 Documents** — Find and organize files\n**🧠 Memory** — I can remember things about you!\n**📋 Planning** — Tell me a goal and I'll create a step-by-step plan\n\nJust type or say what you need!",
      suggestions: [
        "Plan my week",
        "Track my health",
        "How's my budget?",
        "I want to lose 30 pounds",
      ],
    };
  }

  // Thanks
  if (
    lower.includes("thanks") ||
    lower.includes("thank you") ||
    lower.includes("thx")
  ) {
    return {
      category: "general",
      message: "You're welcome! 😊 Is there anything else I can help with?",
    };
  }

  // Default fallback — try to be helpful
  return {
    category: "general",
    message: `I'm not quite sure how to help with that yet, but I'm learning! Here are some things I can do:\n\n- 🗓️ Plan your week\n- 💰 Check your budget\n- 🏃 Track your health\n- 🎯 Set and track goals\n- 📝 Set reminders\n- 🛒 Manage shopping lists\n\nTry asking me something like "Plan my week" or "How's my budget?"${automations.length > 0 ? `\n\nBy the way, I have **${automations.length} suggestions** for you — check the cards!` : ""}`,
    suggestions: [
      "Plan my week",
      "How's my budget?",
      "What can you do?",
      "Track health",
    ],
  };
}

function handleMemoryCommands(input: string): AIResponse {
  const lower = input.toLowerCase();

  // "what do you know about me"
  if (
    lower.includes("what do you know") ||
    lower.includes("what do you remember")
  ) {
    const allMemories = getMemories();
    if (allMemories.length === 0) {
      return {
        category: "memory",
        message:
          "I don't know anything specific about you yet. Tell me something! Try saying:\n\n- \"Remember that I have asthma\"\n- \"My favorite store is Walmart\"\n- \"I hate early meetings\"",
        suggestions: [
          "Remember that I...",
          "My favorite...",
          "I prefer...",
        ],
      };
    }
    return {
      category: "memory",
      message: `Here's what I know about you:\n\n${allMemories.map((m: { key: string; value: string }) => `- **${m.key}**: ${m.value}`).join("\n")}\n\nWant me to remember something else?`,
      data: { memories: allMemories },
    };
  }

  // "forget that..."
  if (lower.startsWith("forget")) {
    const match = input.match(/forget (?:that |about )?(.+)/i);
    if (match) {
      const key = match[1].trim();
      const removed = forget(key);
      return {
        category: "memory",
        message: removed
          ? `✅ I've forgotten about "${key}".`
          : `I don't have anything stored about "${key}".`,
      };
    }
  }

  // Try to extract a memory
  const extracted = extractMemoryFromInput(input);
  if (extracted) {
    remember(extracted.key, extracted.value);
    return {
      category: "memory",
      message: `✅ Got it! I'll remember that **${extracted.key}** is **${extracted.value}**.`,
      data: { memory: extracted },
    };
  }

  return {
    category: "memory",
    message:
      "I can remember things about you! Try:\n- \"Remember that I have asthma\"\n- \"My favorite store is Walmart\"\n- \"I hate early meetings\"",
    suggestions: ["Remember that I...", "What do you know about me?"],
  };
}

function handlePlanGeneration(input: string): AIResponse {
  const plan = generatePlan(input);
  if (!plan) {
    return {
      category: "goals",
      message:
        "I'd love to help you create a plan! Can you be more specific? Try: \"I want to lose 30 pounds\", \"I want to save $15,000\", or \"I want to start a business\".",
      suggestions: [
        "I want to lose 30 pounds",
        "I want to save $15,000",
        "I want to start a business",
      ],
    };
  }

  return {
    category: "goals",
    message: `Here's your step-by-step plan to achieve **"${plan.goal}"**:\n\n${plan.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.description}`).join("\n")}\n\nI've saved this plan for you. Check off each step as you go! 💪`,
    data: { plan },
  };
}
