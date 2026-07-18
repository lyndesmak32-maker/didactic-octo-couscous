import { useMemo } from "react";
import type { CalendarEvent, CalendarLayer } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";

interface WeekViewProps {
  year: number;
  month: number; // 0-indexed
  day: number;
  events: CalendarEvent[];
  activeLayers: CalendarLayer[];
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23
const START_HOUR = 6; // Show 6 AM onwards
const END_HOUR = 22; // Show up to 10 PM

function getWeekStart(year: number, month: number, day: number): Date {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  date.setDate(date.getDate() - dayOfWeek);
  return date;
}

export function WeekView({
  year,
  month,
  day,
  events,
  activeLayers,
  onEventClick,
}: WeekViewProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const weekStart = useMemo(() => getWeekStart(year, month, day), [year, month, day]);
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const filteredEvents = useMemo(
    () => events.filter((e) => activeLayers.includes(e.calendarLayer)),
    [events, activeLayers],
  );

  // Assign events to columns and compute positions
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of filteredEvents) {
      const key = event.startTime.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [filteredEvents]);

  const visibleHours = HOURS.filter((h) => h >= START_HOUR && h <= END_HOUR);

  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-surface-200 dark:border-surface-700">
        <div className="py-2 text-center text-[10px] font-medium text-surface-400">
          GMT
        </div>
        {days.map((d) => {
          const ds = d.toISOString().split("T")[0];
          const isToday = ds === todayStr;
          return (
            <div
              key={ds}
              className={`py-2 text-center border-l border-surface-100 dark:border-surface-800 ${
                isToday ? "bg-accent-50/50 dark:bg-accent-950/20" : ""
              }`}
            >
              <div className="text-[10px] font-medium uppercase text-surface-400">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isToday
                    ? "text-accent-600 dark:text-accent-400"
                    : "text-surface-700 dark:text-surface-300"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] overflow-auto max-h-[600px]">
        {visibleHours.map((hour) => {
          const ampm = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
          return (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="sticky left-0 border-b border-surface-100 py-2 pr-2 text-right text-[10px] text-surface-400 dark:border-surface-800">
                {ampm}
              </div>
              {/* Day columns */}
              {days.map((d) => {
                const ds = d.toISOString().split("T")[0];
                const dayEvents = eventsByDay.get(ds) || [];
                const hourEvents = dayEvents.filter((e) => {
                  const startH = new Date(e.startTime).getHours();
                  return startH === hour;
                });
                const isToday = ds === todayStr;

                return (
                  <div
                    key={ds}
                    className={`relative border-b border-l border-surface-100 dark:border-surface-800 min-h-[48px] p-0.5 ${
                      isToday ? "bg-accent-50/20 dark:bg-accent-950/10" : ""
                    }`}
                  >
                    {hourEvents.map((event) => {
                      const startHour = new Date(event.startTime).getHours();
                      const startMin = new Date(event.startTime).getMinutes();
                      const endHour = new Date(event.endTime).getHours();
                      const endMin = new Date(event.endTime).getMinutes();
                      const durationMins = (endHour - startHour) * 60 + (endMin - startMin);
                      const heightPx = Math.max((durationMins / 60) * 48, 24); // 48px per hour
                      const topOffset = (startMin / 60) * 48;
                      const colors = CATEGORY_COLORS[event.category];

                      return (
                        <button
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          style={{ height: `${heightPx}px`, top: `${topOffset}px` }}
                          className={`absolute left-0.5 right-0.5 z-10 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight transition-opacity hover:opacity-80 ${
                            event.isTimeBlock
                              ? `${colors.bg} ${colors.text} border border-dashed border-current/30`
                              : `${colors.bg} ${colors.text}`
                          }`}
                        >
                          <span className="block truncate">{event.title}</span>
                          {durationMins >= 45 && (
                            <span className="block truncate text-[9px] opacity-70">
                              {new Date(event.startTime).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
