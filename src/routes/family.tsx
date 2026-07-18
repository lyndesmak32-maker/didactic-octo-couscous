import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/family")({ component: FamilyPage });

function FamilyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Family Hub</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Shared calendars, lists, and family coordination.</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500 dark:bg-purple-950/40 dark:text-purple-400">
          <Users className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Family Hub</h3>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          Shared calendars, grocery lists, chore tracking, and family messaging in one place.
        </p>
      </div>
    </div>
  );
}
