import { useMemo } from "react";
import { RefreshCw, Gift } from "lucide-react";
import type { CalendarEvent, CalendarLayer } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
  activeLayers: CalendarLayer[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({
  year,
  month,
  events,
  activeLayers,
  onDateClick,
  onEventClick,
  onAddEvent,
}: MonthViewProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from the Sunday before the first of the month
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());

    // End on the Saturday after the last of the month
    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const weeks: Date[][] = [];
    let current = new Date(start);
    while (current <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      if (!activeLayers.includes(event.calendarLayer)) continue;
      const dateKey = event.startTime.split("T")[0];
      const existing = map.get(dateKey) || [];
      existing.push(event);
      map.set(dateKey, existing);
    }
    return map;
  }, [events, activeLayers]);

  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-surface-200 dark:border-surface-700">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-surface-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Weeks grid */}
      <div className="grid grid-cols-7">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const dateStr = day.toISOString().split("T")[0];
            const isCurrentMonth = day.getMonth() === month;
            const isToday = dateStr === todayStr;
            const dayEvents = eventsByDate.get(dateStr) || [];
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={`${wi}-${di}`}
                onClick={() => onDateClick(day)}
                onDoubleClick={() => onAddEvent(day)}
                className={`relative min-h-[100px] cursor-pointer border-b border-r border-surface-100 p-1.5 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/50 ${
                  !isCurrentMonth ? "bg-surface-50/50 dark:bg-surface-800/30" : ""
                } ${isWeekend ? "bg-surface-50/30 dark:bg-surface-800/20" : ""}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-accent-600 text-white"
                      : isCurrentMonth
                        ? "text-surface-700 dark:text-surface-300"
                        : "text-surface-300 dark:text-surface-600"
                  }`}
                >
                  {day.getDate()}
                </span>

                {/* Events */}
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => {
                    const colors = CATEGORY_COLORS[event.category];
                    const isTimeBlock = event.isTimeBlock;
                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium transition-colors hover:opacity-80 ${
                          isTimeBlock
                            ? `${colors.bg} ${colors.text} border border-dashed border-current/30`
                            : `${colors.bg} ${colors.text}`
                        }`}
                      >
                        {event.isBirthday ? (
                          <Gift className="size-2.5 shrink-0" />
                        ) : event.isRecurring ? (
                          <RefreshCw className="size-2.5 shrink-0" />
                        ) : (
                          <div
                            className={`size-1.5 shrink-0 rounded-full ${colors.dot}`}
                          />
                        )}
                        <span className="truncate">
                          {new Date(event.startTime).getHours() > 0 &&
                            new Date(event.startTime).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}{" "}
                          {event.title}
                        </span>
                      </button>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="block px-1.5 text-[10px] font-medium text-surface-400">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
