import { Clock, MapPin, Gift, RefreshCw } from "lucide-react";
import type { CalendarEvent } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getTimeUntil(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.round((then - now) / 60000);

  if (diffMin < 0) return "Now";
  if (diffMin < 60) return `In ${diffMin}m`;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours < 5) return `In ${hours}h ${mins}m`;
  return `Today at ${formatEventTime(iso)}`;
}

export function UpcomingEventsWidget({ events }: { events: CalendarEvent[] }) {
  const upcoming = events.slice(0, 4);

  return (
    <div className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-surface-300 hover:shadow-lg hover:shadow-surface-200/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-surface-950/50">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Upcoming Events
        </h3>
      </div>
      <div className="space-y-3">
        {upcoming.length === 0 && (
          <p className="text-xs text-surface-400">No upcoming events</p>
        )}
        {upcoming.map((event) => {
          const colors = CATEGORY_COLORS[event.category] ?? { dot: "bg-accent-400" };
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
            >
              <div
                className={`mt-0.5 h-3 w-1 shrink-0 rounded-full ${colors.dot}`}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                  {event.title}
                  {event.isBirthday && <Gift className="size-3 text-amber-500" />}
                  {event.isRecurring && !event.isBirthday && (
                    <RefreshCw className="size-3 text-surface-400" />
                  )}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                  <span>
                    {formatEventTime(event.startTime)} – {formatEventTime(event.endTime)}
                  </span>
                </div>
                {event.location && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
                    <MapPin className="size-3" />
                    {event.location}
                  </div>
                )}
              </div>
              <span className="shrink-0 text-xs font-medium text-accent-600 dark:text-accent-400">
                {getTimeUntil(event.startTime)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
