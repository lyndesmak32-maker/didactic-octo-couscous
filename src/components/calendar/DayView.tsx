import { useMemo } from "react";
import type { CalendarEvent, CalendarLayer } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";

interface DayViewProps {
  year: number;
  month: number; // 0-indexed
  day: number;
  events: CalendarEvent[];
  activeLayers: CalendarLayer[];
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const START_HOUR = 5;
const END_HOUR = 23;

export function DayView({
  year,
  month,
  day,
  events,
  activeLayers,
  onEventClick,
}: DayViewProps) {
  const today = new Date(year, month, day);
  const dateStr = today.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = dateStr === todayStr;

  const dayEvents = useMemo(() => {
    return events
      .filter((e) => activeLayers.includes(e.calendarLayer))
      .filter((e) => e.startTime.split("T")[0] === dateStr)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, dateStr, activeLayers]);

  const visibleHours = HOURS.filter((h) => h >= START_HOUR && h <= END_HOUR);

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Cluster overlapping events into columns
  const columns = useMemo(() => {
    const cols: CalendarEvent[][] = [];

    for (const event of dayEvents) {
      const eventStart = new Date(event.startTime).getTime();
      let placed = false;

      for (const col of cols) {
        const lastInCol = col[col.length - 1];
        const lastEnd = new Date(lastInCol.endTime).getTime();
        if (eventStart >= lastEnd) {
          col.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        cols.push([event]);
      }
    }

    return cols;
  }, [dayEvents]);

  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900">
      {/* Day header */}
      <div
        className={`border-b border-surface-200 px-4 py-3 dark:border-surface-700 ${
          isToday ? "bg-accent-50/50 dark:bg-accent-950/20" : ""
        }`}
      >
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
          {formattedDate}
        </h3>
        {isToday && (
          <span className="mt-0.5 inline-block rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-medium text-accent-700 dark:bg-accent-900/50 dark:text-accent-300">
            Today
          </span>
        )}
      </div>

      {/* Hourly timeline */}
      <div className="max-h-[600px] overflow-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {visibleHours.map((hour) => {
            const ampm =
              hour === 0
                ? "12 AM"
                : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`;

            // Find events that start in this hour
            const hourEvents = dayEvents.filter((e) => {
              const h = new Date(e.startTime).getHours();
              return h === hour;
            });

            return (
              <div key={hour} className="contents">
                {/* Time label */}
                <div className="border-b border-surface-100 py-2 pr-2 text-right text-[11px] font-medium text-surface-400 dark:border-surface-800">
                  {ampm}
                </div>

                {/* Events slot */}
                <div className="relative border-b border-l border-surface-100 dark:border-surface-800">
                  {/* Hour line */}
                  <div className="absolute inset-0">
                    {/* Half-hour dashed line at :30 */}
                    <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-surface-100 dark:border-surface-800" />
                  </div>

                  {/* Events */}
                  <div className="relative min-h-[60px]">
                    {hourEvents.map((event) => {
                      const startHour = new Date(event.startTime).getHours();
                      const startMin = new Date(event.startTime).getMinutes();
                      const endHour = new Date(event.endTime).getHours();
                      const endMin = new Date(event.endTime).getMinutes();
                      const durationMins = (endHour - startHour) * 60 + (endMin - startMin);
                      const heightPx = Math.max((durationMins / 60) * 60, 24);
                      const topOffset = (startMin / 60) * 60;
                      const colors = CATEGORY_COLORS[event.category];

                      return (
                        <button
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          style={{
                            height: `${heightPx}px`,
                            top: `${topOffset}px`,
                            zIndex: 10,
                          }}
                          className={`absolute left-1 right-1 overflow-hidden rounded-lg px-2.5 py-1.5 text-left text-xs transition-opacity hover:opacity-80 ${
                            event.isTimeBlock
                              ? `${colors.bg} ${colors.text} border border-dashed border-current/40`
                              : `${colors.bg} ${colors.text}`
                          }`}
                        >
                          <p className="truncate font-semibold">{event.title}</p>
                          <p className="mt-0.5 truncate text-[10px] opacity-70">
                            {new Date(event.startTime).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}{" "}
                            –{" "}
                            {new Date(event.endTime).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          {event.location && (
                            <p className="mt-0.5 truncate text-[10px] opacity-60">
                              📍 {event.location}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
