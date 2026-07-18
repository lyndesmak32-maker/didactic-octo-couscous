import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import type { CalendarView, CalendarLayer, CalendarEvent } from "~/types/calendar";
import { CATEGORY_COLORS } from "~/types/calendar";
import {
  getEventsForRange,
  addEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getCountdowns,
  addCountdown,
  deleteCountdown,
  getActiveLayers,
  setActiveLayers,
  toggleLayer,
} from "~/data/calendar";
import { ViewToggle, NavArrows } from "~/components/calendar/ViewToggle";
import { CalendarLayerToggle } from "~/components/calendar/CalendarLayerToggle";
import { MonthView } from "~/components/calendar/MonthView";
import { WeekView } from "~/components/calendar/WeekView";
import { DayView } from "~/components/calendar/DayView";
import { EventModal } from "~/components/calendar/EventModal";
import { EventFormModal } from "~/components/calendar/EventFormModal";
import { CountdownTimers } from "~/components/calendar/CountdownTimers";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getWeekLabel(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const fmt = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (weekStart.getMonth() !== weekEnd.getMonth()) {
    return `${fmt(weekStart)} – ${fmt(weekEnd)}, ${weekEnd.getFullYear()}`;
  }
  return `${fmt(weekStart)} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
}

function getDayLabel(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<CalendarView>("month");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());

  const [activeLayers, setActiveLayersState] = useState<CalendarLayer[]>(() =>
    getActiveLayers(),
  );

  // Event modal state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>();

  // Countdown modal state
  const [showCountdownForm, setShowCountdownForm] = useState(false);

  // Events
  const [eventsKey, setEventsKey] = useState(0); // force re-fetch
  const events = useMemo(() => {
    const start = new Date(year, month - 1, 20); // pad for context
    const end = new Date(year, month + 2, 10);
    return getEventsForRange(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, eventsKey]);

  const countdowns = useMemo(() => getCountdowns(), [eventsKey]);

  // Navigation
  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (view === "month") {
        const newMonth = month + dir;
        if (newMonth < 0) {
          setYear((y) => y - 1);
          setMonth(11);
        } else if (newMonth > 11) {
          setYear((y) => y + 1);
          setMonth(0);
        } else {
          setMonth(newMonth);
        }
      } else if (view === "week") {
        const d = new Date(year, month, day);
        d.setDate(d.getDate() + dir * 7);
        setYear(d.getFullYear());
        setMonth(d.getMonth());
        setDay(d.getDate());
      } else {
        const d = new Date(year, month, day);
        d.setDate(d.getDate() + dir);
        setYear(d.getFullYear());
        setMonth(d.getMonth());
        setDay(d.getDate());
      }
    },
    [view, year, month, day],
  );

  const goToday = useCallback(() => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    setDay(t.getDate());
  }, []);

  // View label
  const viewLabel = useMemo(() => {
    if (view === "month") return getMonthLabel(year, month);
    if (view === "week") return getWeekLabel(year, month, day);
    return getDayLabel(year, month, day);
  }, [view, year, month, day]);

  // Handlers
  const handleViewChange = useCallback((v: CalendarView) => setView(v), []);

  const handleLayerToggle = useCallback(
    (layer: CalendarLayer) => {
      const next = toggleLayer(layer);
      setActiveLayersState(next);
    },
    [],
  );

  const handleDateClick = useCallback(
    (date: Date) => {
      setYear(date.getFullYear());
      setMonth(date.getMonth());
      setDay(date.getDate());
      if (view === "month") setView("day");
    },
    [view],
  );

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleAddEvent = useCallback((date: Date) => {
    setEditingEvent(null);
    setFormDefaultDate(date.toISOString().split("T")[0]);
    setShowForm(true);
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setShowForm(true);
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    deleteEvent(id);
    setSelectedEvent(null);
    setEventsKey((k) => k + 1);
  }, []);

  const handleSaveEvent = useCallback(
    (data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) => {
      if (editingEvent) {
        updateEvent(editingEvent.id, data);
      } else {
        addEvent(data);
      }
      setShowForm(false);
      setEditingEvent(null);
      setEventsKey((k) => k + 1);
    },
    [editingEvent],
  );

  const handleAddCountdown = useCallback(() => {
    const title = window.prompt("Countdown title:");
    if (!title?.trim()) return;
    const daysFromNow = window.prompt("Days from now (number):", "30");
    const days = parseInt(daysFromNow || "30", 10);
    if (isNaN(days) || days < 0) return;

    const d = new Date();
    d.setDate(d.getDate() + days);
    const type = window.prompt("Type (birthday, trip, deadline, holiday, custom):", "custom");

    addCountdown({
      title: title.trim(),
      date: d.toISOString().split("T")[0],
      type: (type?.trim() || "custom") as CountdownItem["type"],
    });
    setEventsKey((k) => k + 1);
  }, []);

  const handleDeleteCountdown = useCallback((id: string) => {
    deleteCountdown(id);
    setEventsKey((k) => k + 1);
  }, []);

  const handleFabClick = useCallback(() => {
    setEditingEvent(null);
    setFormDefaultDate(undefined);
    setShowForm(true);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            Calendar
          </h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Your schedule, beautifully organized.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={handleViewChange} />
        </div>
      </div>

      {/* Controls bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NavArrows
          label={viewLabel}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
          onToday={goToday}
        />
        <CalendarLayerToggle
          activeLayers={activeLayers}
          onToggle={handleLayerToggle}
        />
      </div>

      {/* Main content — calendar + countdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Calendar view */}
        <div className="min-w-0">
          {view === "month" && (
            <MonthView
              year={year}
              month={month}
              events={events}
              activeLayers={activeLayers}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
            />
          )}
          {view === "week" && (
            <WeekView
              year={year}
              month={month}
              day={day}
              events={events}
              activeLayers={activeLayers}
              onEventClick={handleEventClick}
            />
          )}
          {view === "day" && (
            <DayView
              year={year}
              month={month}
              day={day}
              events={events}
              activeLayers={activeLayers}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <CountdownTimers
            countdowns={countdowns}
            onAdd={handleAddCountdown}
            onDelete={handleDeleteCountdown}
          />

          {/* Quick event legend */}
          <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
            <h3 className="mb-3 text-sm font-semibold text-surface-900 dark:text-surface-100">
              Categories
            </h3>
            <div className="space-y-2">
              {(Object.entries(CATEGORY_COLORS) as [string, typeof CATEGORY_COLORS["work"]][]).map(([key, colors]) => (
                <div key={key} className="flex items-center gap-2.5">
                  <div className={`size-3 rounded ${colors.dot}`} />
                  <span className="text-xs capitalize text-surface-600 dark:text-surface-400">
                    {key}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 pt-1 border-t border-surface-100 dark:border-surface-800">
                <div className="size-3 rounded border border-dashed border-surface-300 dark:border-surface-600" />
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  Time Block
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB — Add event */}
      <button
        onClick={handleFabClick}
        className="fixed bottom-20 right-4 z-40 flex size-14 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-lg shadow-accent-600/30 transition-all hover:bg-accent-700 hover:shadow-xl hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
      >
        <Plus className="size-6" />
      </button>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Event form modal */}
      {showForm && (
        <EventFormModal
          onSave={handleSaveEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          initial={editingEvent ?? undefined}
          defaultDate={formDefaultDate}
        />
      )}
    </div>
  );
}
