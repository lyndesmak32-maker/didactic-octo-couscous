import { useState } from "react";
import { X, Clock, MapPin, AlignLeft } from "lucide-react";
import type { CalendarEvent, CalendarLayer, EventCategory } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";

interface EventFormModalProps {
  onSave: (event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  initial?: Partial<CalendarEvent>;
  defaultDate?: string; // ISO date string
}

const categories: { key: EventCategory; label: string; icon: string }[] = [
  { key: "work", label: "Work", icon: "💼" },
  { key: "personal", label: "Personal", icon: "👤" },
  { key: "health", label: "Health", icon: "💪" },
  { key: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { key: "finance", label: "Finance", icon: "💰" },
];

const layers: { key: CalendarLayer; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "work", label: "Work" },
  { key: "family", label: "Family" },
  { key: "holidays", label: "Holidays" },
];

export function EventFormModal({ onSave, onClose, initial, defaultDate }: EventFormModalProps) {
  const today = defaultDate || new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(() => {
    if (initial?.startTime) return initial.startTime.split("T")[0];
    return today;
  });
  const [startTime, setStartTime] = useState(() => {
    if (initial?.startTime) {
      const t = initial.startTime.split("T")[1];
      return t ? t.slice(0, 5) : "09:00";
    }
    return "09:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (initial?.endTime) {
      const t = initial.endTime.split("T")[1];
      return t ? t.slice(0, 5) : "10:00";
    }
    return "10:00";
  });
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? "work");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);
  const [isTimeBlock, setIsTimeBlock] = useState(initial?.isTimeBlock ?? false);
  const [calendarLayer, setCalendarLayer] = useState<CalendarLayer>(initial?.calendarLayer ?? "personal");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      category,
      isRecurring,
      isTimeBlock,
      calendarLayer,
      isBirthday: false,
      ...(isRecurring && {
        recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [new Date(`${date}T00:00:00`).getDay()] },
      }),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {initial?.id ? "Edit Event" : "New Event"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Title */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
            />
          </div>

          {/* Date & Time */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2.5 py-2 text-sm text-surface-900 focus:border-accent-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2.5 py-2 text-sm text-surface-900 focus:border-accent-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2.5 py-2 text-sm text-surface-900 focus:border-accent-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const colors = CATEGORY_COLORS[cat.key];
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                      category === cat.key
                        ? `${colors.bg} ${colors.text} ring-1 ring-current/20`
                        : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-9 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
              Description
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 size-3.5 text-surface-400" />
              <textarea
                placeholder="Add description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-9 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500 resize-none"
              />
            </div>
          </div>

          {/* Calendar Layer */}
          <div className="mb-4">
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-surface-400">
              Calendar
            </label>
            <div className="flex gap-1.5">
              {layers.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setCalendarLayer(l.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                    calendarLayer === l.key
                      ? "bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300"
                      : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="mb-5 space-y-3 rounded-xl bg-surface-50 p-3 dark:bg-surface-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-surface-700 dark:text-surface-300">Recurring event</span>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="size-4 rounded border-surface-300 text-accent-600 focus:ring-accent-500 dark:border-surface-600"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-surface-700 dark:text-surface-300">Time block (focus time)</span>
              <input
                type="checkbox"
                checked={isTimeBlock}
                onChange={(e) => setIsTimeBlock(e.target.checked)}
                className="size-4 rounded border-surface-300 text-accent-600 focus:ring-accent-500 dark:border-surface-600"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-surface-100 px-4 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-600/25"
            >
              {initial?.id ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
