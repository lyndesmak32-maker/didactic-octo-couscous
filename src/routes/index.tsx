import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Sparkles,
  Clock,
  Sun,
  Sunset,
  Moon,
  Pencil,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
  RotateCcw,
  Check,
  X,
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
import {
  getWidgets,
  getWidgetOrder,
  setWidgetVisibility,
  setWidgetOrder,
  resetWidgets,
  type WidgetConfig,
  DEFAULT_WIDGET_ORDER,
} from "~/data/preferences";

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

// Widget metadata: maps widget IDs to their display names
const WIDGET_META: Record<string, { name: string; span: string }> = {
  "ai-briefing": { name: "AI Briefing", span: "sm:col-span-2 lg:col-span-2" },
  "weather": { name: "Weather", span: "" },
  "traffic": { name: "Traffic", span: "" },
  "upcoming-events": { name: "Upcoming Events", span: "lg:col-span-2" },
  "daily-goals": { name: "Daily Goals", span: "" },
  "health-snapshot": { name: "Health Snapshot", span: "" },
  "budget-snapshot": { name: "Budget Snapshot", span: "" },
  "bills": { name: "Bills", span: "" },
  "sleep-recommendation": { name: "Sleep Recommendation", span: "sm:col-span-2 lg:col-span-2" },
};

function Dashboard() {
  const businessName = Route.useLoaderData();
  const [goals, setGoals] = useState(() => getGoals());
  const navigate = useNavigate();
  const { sendMessage } = useAI();

  // Edit mode
  const [editMode, setEditMode] = useState(false);

  // Widget state loaded from preferences
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    if (typeof window !== "undefined") return getWidgets();
    return [];
  });
  const [order, setOrder] = useState<string[]>(() => {
    if (typeof window !== "undefined") return getWidgetOrder();
    return DEFAULT_WIDGET_ORDER;
  });

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

  // ── Widget helpers ──────────────────────────────────────────

  const visibleMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const w of widgets) {
      map[w.id] = w.visible;
    }
    return map;
  }, [widgets]);

  const isVisible = useCallback(
    (id: string) => visibleMap[id] ?? true,
    [visibleMap],
  );

  const toggleWidgetVisibility = useCallback(
    (id: string) => {
      const next = !isVisible(id);
      setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, visible: next } : w)));
      setWidgetVisibility(id, next);
    },
    [isVisible],
  );

  const moveUp = useCallback(
    (id: string) => {
      setOrder((prev) => {
        const idx = prev.indexOf(id);
        if (idx <= 0) return prev;
        const next = [...prev];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        setWidgetOrder(next);
        return next;
      });
    },
    [],
  );

  const moveDown = useCallback(
    (id: string) => {
      setOrder((prev) => {
        const idx = prev.indexOf(id);
        if (idx < 0 || idx >= prev.length - 1) return prev;
        const next = [...prev];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        setWidgetOrder(next);
        return next;
      });
    },
    [],
  );

  const handleReset = useCallback(() => {
    resetWidgets();
    if (typeof window !== "undefined") {
      // Re-read from prefs after reset
      import("~/data/preferences").then((m) => {
        setWidgets(m.getWidgets());
        setOrder(m.getWidgetOrder());
      });
    }
  }, []);

  // ── Render a widget with edit overlay ───────────────────────

  const renderWidget = useCallback(
    (id: string, element: React.ReactNode) => {
      const meta = WIDGET_META[id];
      const visible = isVisible(id);
      const idx = order.indexOf(id);
      const isFirst = idx === 0;
      const isLast = idx === order.length - 1;

      const wrapperClass = meta?.span ?? "";

      if (!visible && !editMode) return null;

      return (
        <div key={id} className={`relative group ${wrapperClass}`}>
          {/* Edit overlay */}
          {editMode && (
            <div className="absolute inset-0 z-10 flex items-start justify-end rounded-2xl bg-surface-950/5 ring-2 ring-accent-400/50 dark:bg-surface-950/20">
              <div className="flex items-center gap-0.5 rounded-bl-xl rounded-tr-xl bg-white p-1 shadow-lg dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                {/* Drag handle (visual only) */}
                <div className="flex cursor-grab items-center px-1 text-surface-400 active:cursor-grabbing">
                  <GripVertical className="size-3.5" />
                </div>

                {/* Up arrow */}
                <button
                  onClick={() => moveUp(id)}
                  disabled={isFirst}
                  className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 disabled:opacity-30 dark:hover:bg-surface-700 dark:hover:text-surface-300"
                  title="Move up"
                >
                  <ChevronUp className="size-3.5" />
                </button>

                {/* Down arrow */}
                <button
                  onClick={() => moveDown(id)}
                  disabled={isLast}
                  className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 disabled:opacity-30 dark:hover:bg-surface-700 dark:hover:text-surface-300"
                  title="Move down"
                >
                  <ChevronDown className="size-3.5" />
                </button>

                {/* Eye toggle */}
                <button
                  onClick={() => toggleWidgetVisibility(id)}
                  className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-surface-300"
                  title={visible ? "Hide widget" : "Show widget"}
                >
                  {visible ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Widget content (dimmed if hidden in edit mode) */}
          <div className={!visible && editMode ? "opacity-30 pointer-events-none" : ""}>
            {element}
          </div>

          {/* Hidden widget placeholder in edit mode */}
          {editMode && !visible && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-surface-400">
                {meta?.name ?? id} (hidden)
              </span>
            </div>
          )}
        </div>
      );
    },
    [editMode, isVisible, order, moveUp, moveDown, toggleWidgetVisibility],
  );

  // ── Build ordered widget list ───────────────────────────────

  const orderedWidgets = useMemo(() => {
    const elements: React.ReactNode[] = [];

    for (const id of order) {
      switch (id) {
        case "ai-briefing":
          elements.push(renderWidget(id, <AIBriefingWidget briefing={briefing} />));
          break;
        case "weather":
          elements.push(renderWidget(id, <WeatherWidget weather={weather} />));
          break;
        case "traffic":
          // Only render traffic in morning, but keep in order
          if (timeOfDay === "morning" || editMode) {
            const trafficEl = <TrafficWidget traffic={traffic} />;
            // In edit mode always show, otherwise conditionally
            if (timeOfDay === "morning") {
              elements.push(renderWidget(id, trafficEl));
            } else if (editMode) {
              elements.push(renderWidget(id, trafficEl));
            }
          }
          break;
        case "upcoming-events":
          elements.push(renderWidget(id, <UpcomingEventsWidget events={events} />));
          break;
        case "daily-goals":
          elements.push(renderWidget(id, <DailyGoalsWidget goals={goals} onToggle={toggleGoal} />));
          break;
        case "health-snapshot":
          elements.push(renderWidget(id, <HealthSnapshotWidget />));
          break;
        case "budget-snapshot":
          elements.push(renderWidget(id, <BudgetSnapshot budget={budget} />));
          break;
        case "bills":
          elements.push(renderWidget(id, <BillsWidget bills={bills} />));
          break;
        case "sleep-recommendation":
          if (timeOfDay === "evening" || editMode) {
            const sleepEl = <SleepRecommendationWidget sleep={sleep} />;
            if (timeOfDay === "evening") {
              elements.push(renderWidget(id, sleepEl));
            } else if (editMode) {
              elements.push(renderWidget(id, sleepEl));
            }
          }
          break;
      }
    }

    return elements;
  }, [order, renderWidget, briefing, weather, traffic, events, goals, toggleGoal, budget, bills, sleep, timeOfDay, editMode]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
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

          {/* Edit Widgets toggle */}
          <div className="flex items-center gap-2">
            {editMode && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            )}
            <button
              onClick={() => setEditMode((e) => !e)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                editMode
                  ? "border-accent-400 bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300"
                  : "border-surface-200 text-surface-500 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
              }`}
            >
              {editMode ? (
                <>
                  <Check className="size-3" />
                  Done
                </>
              ) : (
                <>
                  <Pencil className="size-3" />
                  Edit Widgets
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {orderedWidgets}
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
