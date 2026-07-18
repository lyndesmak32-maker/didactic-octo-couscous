import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import {
  Calendar,
  Wallet,
  Heart,
  Goal,
  Bell,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";

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

function Dashboard() {
  const businessName = Route.useLoaderData();

  const modules = [
    { icon: Calendar, label: "Calendar", value: "3 events today", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { icon: Wallet, label: "Finances", value: "$2,450 budget left", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { icon: Heart, label: "Health", value: "6,820 steps", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
    { icon: Goal, label: "Goals", value: "2 in progress", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { icon: Bell, label: "Reminders", value: "4 pending", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
    { icon: TrendingUp, label: "Focus", value: "Deep work: 2h today", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/40" },
  ];

  const quickActions = [
    "Add a task",
    "Log a workout",
    "Check budget",
    "Plan my week",
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
        </h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Here&apos;s your {businessName} overview for today.
        </p>
      </div>

      {/* Module cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.label}
              className="group cursor-pointer rounded-2xl border border-surface-200 bg-white p-4 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50"
            >
              <div
                className={`mb-3 inline-flex rounded-xl p-2.5 ${mod.bg}`}
              >
                <Icon className={`size-5 ${mod.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                {mod.label}
              </h3>
              <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                {mod.value}
              </p>
            </div>
          );
        })}
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
            <div className="mt-3 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="rounded-full border border-accent-200 bg-white px-3 py-1.5 text-xs font-medium text-accent-700 transition-all hover:bg-accent-50 hover:shadow-sm dark:border-accent-800 dark:bg-surface-800 dark:text-accent-300 dark:hover:bg-accent-950/50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity / placeholder */}
      <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-surface-400" />
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {[
            "Updated weekly budget — 30 min ago",
            "Completed morning workout — 2 hours ago",
            "Added grocery list item — 4 hours ago",
          ].map((item, i) => (
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
