import { createFileRoute } from "@tanstack/react-router";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

function CalendarPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Calendar</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Your schedule, intelligently managed.</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400">
          <CalendarIcon className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Smart Calendar</h3>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          AI-powered scheduling with conflict detection, travel time estimation, and smart reminders.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-surface-50 px-4 py-2 dark:bg-surface-800">
          <Clock className="size-4 text-surface-400" />
          <span className="text-sm text-surface-500 dark:text-surface-400">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
