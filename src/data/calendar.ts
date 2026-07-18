import type { CalendarEvent, CalendarLayer, CountdownItem, RecurringPattern } from "~/types/calendar";

const STORAGE_KEY = "lifeos-calendar-events";
const COUNTDOWN_KEY = "lifeos-calendar-countdowns";
const LAYERS_KEY = "lifeos-calendar-layers";

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ---- Helpers for recurring events ----

function matchesRecurringDay(event: CalendarEvent, date: Date): boolean {
  if (!event.isRecurring || !event.recurringPattern) return false;

  const pattern = event.recurringPattern;
  const eventStart = new Date(event.startTime);
  const eventStartDate = eventStart.toISOString().split("T")[0];

  // Don't expand before the event starts
  if (date.toISOString().split("T")[0] < eventStartDate) return false;

  // Don't expand after endDate if set
  if (pattern.endDate && date.toISOString().split("T")[0] > pattern.endDate) return false;

  const diffTime = date.getTime() - eventStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return false;

  switch (pattern.frequency) {
    case "daily":
      return diffDays % pattern.interval === 0;
    case "weekly": {
      if (diffDays % (pattern.interval * 7) === 0) {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          return pattern.daysOfWeek.includes(date.getDay());
        }
        return date.getDay() === eventStart.getDay();
      }
      return false;
    }
    case "monthly": {
      // Same day of month
      const dayOfMonth = pattern.dayOfMonth ?? eventStart.getDate();
      const monthsDiff =
        (date.getFullYear() - eventStart.getFullYear()) * 12 +
        (date.getMonth() - eventStart.getMonth());
      return monthsDiff % pattern.interval === 0 && date.getDate() === dayOfMonth;
    }
    case "yearly": {
      const yearDiff = date.getFullYear() - eventStart.getFullYear();
      return (
        yearDiff % pattern.interval === 0 &&
        date.getMonth() === eventStart.getMonth() &&
        date.getDate() === eventStart.getDate()
      );
    }
    default:
      return false;
  }
}

function expandRecurringEvent(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  if (!event.isRecurring || !event.recurringPattern) return [];

  const events: CalendarEvent[] = [];
  const eventStartDate = new Date(event.startTime);
  const eventEndDate = new Date(event.endTime);
  const durationMs = eventEndDate.getTime() - eventStartDate.getTime();

  // Look back a bit from rangeStart to catch recurring events that started before
  const searchStart = new Date(rangeStart);
  searchStart.setDate(searchStart.getDate() - 35);

  const pattern = event.recurringPattern;
  let count = 0;
  const maxCount = pattern.count ?? 365;

  for (
    let d = new Date(searchStart);
    d <= rangeEnd;
    d.setDate(d.getDate() + 1)
  ) {
    if (count >= maxCount) break;

    if (matchesRecurringDay(event, d)) {
      const instanceStart = new Date(d);
      instanceStart.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), 0, 0);
      const instanceEnd = new Date(instanceStart.getTime() + durationMs);

      if (instanceEnd >= rangeStart && instanceStart <= rangeEnd) {
        events.push({
          ...event,
          id: `${event.id}_r_${instanceStart.toISOString().split("T")[0]}`,
          startTime: instanceStart.toISOString(),
          endTime: instanceEnd.toISOString(),
        });
      }
      count++;
    }
  }

  return events;
}

// ---- Storage helpers ----

function loadEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return getDefaultEvents();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CalendarEvent[];
  } catch {}
  return getDefaultEvents();
}

function saveEvents(events: CalendarEvent[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function loadCountdowns(): CountdownItem[] {
  if (typeof window === "undefined") return getDefaultCountdowns();
  try {
    const raw = localStorage.getItem(COUNTDOWN_KEY);
    if (raw) return JSON.parse(raw) as CountdownItem[];
  } catch {}
  return getDefaultCountdowns();
}

function saveCountdowns(countdowns: CountdownItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(countdowns));
}

function loadLayers(): CalendarLayer[] {
  if (typeof window === "undefined") return ["personal", "work", "family", "holidays"];
  try {
    const raw = localStorage.getItem(LAYERS_KEY);
    if (raw) return JSON.parse(raw) as CalendarLayer[];
  } catch {}
  return ["personal", "work", "family", "holidays"];
}

function saveLayers(layers: CalendarLayer[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAYERS_KEY, JSON.stringify(layers));
}

// ---- Default data ----

function getDefaultEvents(): CalendarEvent[] {
  const today = todayDate();
  const now = nowISO();

  return [
    {
      id: "evt_1",
      title: "Morning standup",
      startTime: `${today}T09:00:00`,
      endTime: `${today}T09:30:00`,
      location: "Zoom",
      description: "Daily team sync — share updates and blockers.",
      category: "work",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [1, 2, 3, 4, 5] },
      isTimeBlock: false,
      calendarLayer: "work",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_2",
      title: "Deep work block",
      startTime: `${today}T10:00:00`,
      endTime: `${today}T12:00:00`,
      location: "",
      description: "Focused time for coding — no interruptions.",
      category: "work",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [1, 2, 3, 4, 5] },
      isTimeBlock: true,
      calendarLayer: "work",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_3",
      title: "Lunch break",
      startTime: `${today}T12:00:00`,
      endTime: `${today}T13:00:00`,
      location: "",
      description: "",
      category: "personal",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [1, 2, 3, 4, 5] },
      isTimeBlock: false,
      calendarLayer: "personal",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_4",
      title: "Gym session",
      startTime: `${today}T17:30:00`,
      endTime: `${today}T18:30:00`,
      location: "FitLife Gym",
      description: "Upper body day — don't skip!",
      category: "health",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [1, 3, 5] },
      isTimeBlock: false,
      calendarLayer: "personal",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_5",
      title: "Mom's birthday 🎂",
      startTime: `${today}T00:00:00`,
      endTime: `${today}T23:59:59`,
      location: "",
      description: "Don't forget to call and send flowers!",
      category: "family",
      isRecurring: true,
      recurringPattern: { frequency: "yearly", interval: 1 },
      isTimeBlock: false,
      calendarLayer: "family",
      isBirthday: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_6",
      title: "Budget review",
      startTime: `${today}T14:00:00`,
      endTime: `${today}T14:30:00`,
      location: "",
      description: "Review monthly spending and update budget tracker.",
      category: "finance",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 2, daysOfWeek: [5] },
      isTimeBlock: false,
      calendarLayer: "personal",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_7",
      title: "Family dinner",
      startTime: `${today}T19:00:00`,
      endTime: `${today}T21:00:00`,
      location: "Home",
      description: "Sunday family dinner — everyone's coming over.",
      category: "family",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [0] },
      isTimeBlock: false,
      calendarLayer: "family",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_8",
      title: "Design review",
      startTime: `${today}T15:00:00`,
      endTime: `${today}T16:00:00`,
      location: "Conference Room A",
      description: "Review new feature designs with the team.",
      category: "work",
      isRecurring: false,
      isTimeBlock: false,
      calendarLayer: "work",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_9",
      title: "Yoga class",
      startTime: `${today}T07:00:00`,
      endTime: `${today}T08:00:00`,
      location: "Zen Studio",
      description: "Morning flow yoga — bring your own mat.",
      category: "health",
      isRecurring: true,
      recurringPattern: { frequency: "weekly", interval: 1, daysOfWeek: [2, 4] },
      isTimeBlock: false,
      calendarLayer: "personal",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_10",
      title: "Pay credit card",
      startTime: `${today}T09:00:00`,
      endTime: `${today}T09:15:00`,
      location: "",
      description: "Monthly credit card payment due.",
      category: "finance",
      isRecurring: true,
      recurringPattern: { frequency: "monthly", interval: 1, dayOfMonth: 15 },
      isTimeBlock: false,
      calendarLayer: "personal",
      isBirthday: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function getDefaultCountdowns(): CountdownItem[] {
  const today = new Date();

  const makeDate = (daysFromNow: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  };

  return [
    { id: "cd_1", title: "Sarah's birthday 🎂", date: makeDate(5), type: "birthday" },
    { id: "cd_2", title: "Hawaii trip 🌴", date: makeDate(45), type: "trip" },
    { id: "cd_3", title: "Tax deadline", date: makeDate(12), type: "deadline" },
    { id: "cd_4", title: "Project launch 🚀", date: makeDate(21), type: "deadline" },
  ];
}

// ---- Public API ----

let eventsCache: CalendarEvent[] | null = null;
let countdownsCache: CountdownItem[] | null = null;
let layersCache: CalendarLayer[] | null = null;

export function getAllEvents(): CalendarEvent[] {
  if (eventsCache === null) eventsCache = loadEvents();
  return eventsCache;
}

export function getEventsForRange(start: Date, end: Date): CalendarEvent[] {
  const allEvents = getAllEvents();
  const result: CalendarEvent[] = [];

  for (const event of allEvents) {
    if (event.isRecurring) {
      result.push(...expandRecurringEvent(event, start, end));
    } else {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      if (eventEnd >= start && eventStart <= end) {
        result.push(event);
      }
    }
  }

  return result;
}

export function getUpcomingEvents(limit = 20): CalendarEvent[] {
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const events = getEventsForRange(now, end);
  return events
    .filter((e) => new Date(e.endTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit);
}

export function addEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): CalendarEvent {
  const newEvent: CalendarEvent = {
    ...event,
    id: generateId(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  const events = getAllEvents();
  events.push(newEvent);
  saveEvents(events);
  eventsCache = events;
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
  const events = getAllEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = { ...events[index], ...updates, updatedAt: nowISO() };
  saveEvents(events);
  eventsCache = events;
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = getAllEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;

  saveEvents(filtered);
  eventsCache = filtered;
  return true;
}

// ---- Countdowns ----

export function getCountdowns(): CountdownItem[] {
  if (countdownsCache === null) countdownsCache = loadCountdowns();
  return countdownsCache;
}

export function addCountdown(item: Omit<CountdownItem, "id">): CountdownItem {
  const newItem: CountdownItem = {
    ...item,
    id: `cd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  const items = getCountdowns();
  items.push(newItem);
  saveCountdowns(items);
  countdownsCache = items;
  return newItem;
}

export function deleteCountdown(id: string): boolean {
  const items = getCountdowns();
  const filtered = items.filter((c) => c.id !== id);
  if (filtered.length === items.length) return false;
  saveCountdowns(filtered);
  countdownsCache = filtered;
  return true;
}

// ---- Layers ----

export function getActiveLayers(): CalendarLayer[] {
  if (layersCache === null) layersCache = loadLayers();
  return layersCache;
}

export function setActiveLayers(layers: CalendarLayer[]): void {
  saveLayers(layers);
  layersCache = layers;
}

export function toggleLayer(layer: CalendarLayer): CalendarLayer[] {
  const current = getActiveLayers();
  const next = current.includes(layer)
    ? current.filter((l) => l !== layer)
    : [...current, layer];
  setActiveLayers(next);
  return next;
}
