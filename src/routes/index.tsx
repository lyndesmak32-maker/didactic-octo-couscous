import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { useState, useMemo, useCallback } from "react";
import {
  Sparkles,
  Clock,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { useAI } from "~/hooks/useAI";
import type { TimeOfDay } from "~/types/dashboard";
import { WeatherWidget } from "~/components/widgets/WeatherWidget";
import { UpcomingEventsWidget } from "~/components/widgets/UpcomingEventsWidget";
import { DailyGoalsWidget } from "~/components/widgets/DailyGoalsWidget";
import { BillsWidget } from "~/components/widgets/BillsWidget";
import { HealthSnapshotWidget } from "~/components/widgets/HealthSnapshotWidget";
import { AIBriefingWidget } from "~/components/widgets/AIBriefingWidget";
import { BudgetSnapshot } from "~/components/widgets/BudgetSnapshot";
import { TrafficWidget } from "~/components/widgets/TrafficWidget";
import { SleepRecommendationWidget } from "~/components/widgets/SleepRecommendation";
import {
  getTimeOfDay,
  getWeather,
  getGoals,
  getBills,
  getTraffic,
  getSleepRecommendation,
  getBudget,
  getAIBriefing,
  getRecentActivity,
} from "~/data/dashboard";
import { getUpcomingEvents } from "~/data/calendar";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "LifeOS";
  } catch {
    return "LifeOS";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Dashboard,
});

const timeConfig: Record<
  TimeOfDay,
  { greeting: string; icon: typeof Sun; subtext: string }
> = {
  morning: {
    greeting: "Good morning",
    icon: Sun,
    subtext: "Here's your day ahead. Let's make it great.",
  },
  afternoon: {
    greeting: "Good afternoon",
    icon: Sunset,
    subtext: "Keep the momentum going. You've got this.",
  },
  evening: {
    greeting: "Good evening",
    icon: Moon,
    subtext: "Time to wind down. Here's how your day went.",
  },
};

function Dashboard() {
  const businessName = Route.useLoaderData();
  const [goals, setGoals] = useState(() => getGoals());
  const navigate = useNavigate();
  const { sendMessage } = useAI();

  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const config = timeConfig[timeOfDay];
  const GreetingIcon = config.icon;

  const weather = useMemo(() => getWeather(), []);
  const events = useMemo(() => getUpcomingEvents(20), []);
  const bills = useMemo(() => getBills(), []);
  const traffic = useMemo(() => getTraffic(), []);
  const sleep = useMemo(() => getSleepRecommendation(), []);
  const budget = useMemo(() => getBudget(), []);
  const briefing = useMemo(() => getAIBriefing(timeOfDay), [timeOfDay]);
  const recentActivity = useMemo(() => getRecentActivity(), []);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
    );
  };

  const handleQuickAction = useCallback((action: string) => {
    sendMessage(action);
    navigate({ to: "/ai" });
  }, [sendMessage, navigate]);

  const quickActions = useMemo(() => {
    switch (timeOfDay) {
      case "morning":
        return ["Plan my day", "Check weather", "Review schedule", "Morning briefing"];
      case "afternoon":
        return ["Log lunch", "Update budget", "Check health", "Afternoon focus"];
      case "evening":
        return ["Reflect on today", "Plan tomorrow", "Log sleep", "Evening review"];
    }
  }, [timeOfDay]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400">
            <GreetingIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">
              {config.greeting}
            </h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              {config.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {/* AI Briefing - spans 2 columns on tablet+ */}
        <div className="sm:col-span-2 lg:col-span-2">
          <AIBriefingWidget briefing={briefing} />
        </div>

        {/* Weather - always visible */}
        <WeatherWidget weather={weather} />

        {/* Morning-only: Traffic */}
        {timeOfDay === "morning" && <TrafficWidget traffic={traffic} />}

        {/* Upcoming Events - spans 2 columns on desktop */}
        <div className="lg:col-span-2">
          <UpcomingEventsWidget events={events} />
        </div>

        {/* Daily Goals */}
        <DailyGoalsWidget goals={goals} onToggle={toggleGoal} />

        {/* Health Snapshot */}
        <HealthSnapshotWidget />

        {/* Budget Snapshot */}
        <BudgetSnapshot budget={budget} />

        {/* Bills */}
        <BillsWidget bills={bills} />

        {/* Evening-only: Sleep Recommendation */}
        {timeOfDay === "evening" && (
          <div className="sm:col-span-2 lg:col-span-2">
            <SleepRecommendationWidget sleep={sleep} />
          </div>
        )}
      </div>

      {/* AI prompt card */}
      <div className="mb-8 rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50 to-white p-5 dark:border-accent-800 dark:from-accent-950/30 dark:to-surface-900 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-lg shadow-accent-600/25">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Ask your AI assistant
            </h3>
            <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
              What would you like help with?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="rounded-full border border-accent-200 bg-white px-3 py-1.5 text-xs font-medium text-accent-700 transition-all hover:bg-accent-50 hover:shadow-sm dark:border-accent-800 dark:bg-surface-800 dark:text-accent-300 dark:hover:bg-accent-950/50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-surface-400" />
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg py-2 text-sm text-surface-600 dark:text-surface-400"
            >
              <div className="size-1.5 rounded-full bg-accent-400" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
