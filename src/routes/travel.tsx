import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/travel")({ component: TravelPage });

function TravelPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Travel</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Trip planning, itineraries, and travel management.</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-500 dark:bg-teal-950/40 dark:text-teal-400">
          <Globe className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Travel Planner</h3>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          AI-powered itinerary planning, flight tracking, packing lists, and local recommendations.
        </p>
      </div>
    </div>
  );
}
