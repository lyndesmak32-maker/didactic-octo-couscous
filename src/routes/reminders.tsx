import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

function RemindersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Reminders</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Smart reminders that adapt to your schedule and habits.</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-950/40 dark:text-violet-400">
          <Bell className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Smart Reminders</h3>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          Location-based, time-based, and context-aware reminders that actually work for you.
        </p>
      </div>
    </div>
  );
}
