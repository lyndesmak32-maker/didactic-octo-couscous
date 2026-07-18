export type EventCategory = "work" | "personal" | "health" | "family" | "finance";

export type CalendarLayer = "personal" | "work" | "family" | "holidays";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  location?: string;
  description?: string;
  category: EventCategory;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  isTimeBlock: boolean;
  calendarLayer: CalendarLayer;
  isBirthday: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number; // e.g., every 2 weeks
  endDate?: string; // ISO 8601 date
  count?: number; // max occurrences
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, etc. (for weekly)
  dayOfMonth?: number; // (for monthly)
}

export interface CountdownItem {
  id: string;
  title: string;
  date: string; // ISO 8601 date
  type: "birthday" | "trip" | "deadline" | "holiday" | "custom";
  icon?: string;
}

export const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; dot: string; hex: string }> = {
  work: { bg: "bg-indigo-100 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500", hex: "#6366f1" },
  personal: { bg: "bg-pink-100 dark:bg-pink-950/40", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-500", hex: "#ec4899" },
  health: { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500", hex: "#f43f5e" },
  family: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500", hex: "#f59e0b" },
  finance: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", hex: "#10b981" },
};

export const LAYER_COLORS: Record<CalendarLayer, string> = {
  personal: "rgba(236, 72, 153, 0.15)",  // pink tint
  work: "rgba(99, 102, 241, 0.15)",      // indigo tint
  family: "rgba(245, 158, 11, 0.15)",    // amber tint
  holidays: "rgba(16, 185, 129, 0.15)",   // emerald tint
};

export const LAYER_LABELS: Record<CalendarLayer, string> = {
  personal: "Personal",
  work: "Work",
  family: "Family",
  holidays: "Holidays",
};
