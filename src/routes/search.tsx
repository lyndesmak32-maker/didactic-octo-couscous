import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const Route = createFileRoute("/search")({ component: SearchPage });

function SearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Smart Search</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Search across your entire life — calendar, docs, finances, and more.</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <Search className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Universal Search</h3>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          AI-powered search across all your LifeOS data — find anything in seconds.
        </p>
      </div>
    </div>
  );
}
