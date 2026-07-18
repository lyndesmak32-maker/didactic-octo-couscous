import { Clock, MapPin, RefreshCw, Gift, X } from "lucide-react";
import type { CalendarEvent } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";

interface EventModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function EventModal({ event, onClose, onEdit, onDelete }: EventModalProps) {
  const colors = CATEGORY_COLORS[event.category];
  const isAllDay =
    event.startTime.includes("T00:00:00") && event.endTime.includes("T23:59:59");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: colors.hex }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
            >
              {event.isBirthday ? (
                <Gift className="size-5" />
              ) : event.isRecurring ? (
                <RefreshCw className="size-5" />
              ) : (
                <Clock className="size-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                {event.title}
              </h3>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
              >
                {event.category}
                {event.isTimeBlock && " · Time Block"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3 px-5 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Clock className="size-3.5 shrink-0 text-surface-400" />
              {isAllDay ? (
                <span>{formatDate(event.startTime)} — All day</span>
              ) : (
                <span>
                  {formatDate(event.startTime)} · {formatTime(event.startTime)} –{" "}
                  {formatTime(event.endTime)}
                </span>
              )}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <MapPin className="size-3.5 shrink-0 text-surface-400" />
                {event.location}
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-sm leading-relaxed text-surface-500 dark:text-surface-400 border-t border-surface-100 dark:border-surface-800 pt-3">
              {event.description}
            </p>
          )}

          {event.isRecurring && (
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-50 px-3 py-2 text-xs text-surface-500 dark:bg-surface-800 dark:text-surface-400">
              <RefreshCw className="size-3" />
              Recurring event
              {event.recurringPattern && (
                <span className="lowercase">
                  — {event.recurringPattern.frequency}
                  {event.recurringPattern.interval > 1 && ` (every ${event.recurringPattern.interval})`}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="flex-1 rounded-lg bg-surface-100 px-4 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="flex-1 rounded-lg bg-rose-50 px-4 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
