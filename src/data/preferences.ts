// LifeOS Preferences — centralized localStorage-backed settings store
// All preferences persist across sessions.

import type { AccentColor, Theme } from "~/hooks/useTheme";

// ── Types ──────────────────────────────────────────────────────

export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY";
export type WeekStart = "sunday" | "monday";
export type CalendarView = "month" | "week" | "day";
export type FinanceView = "overview" | "transactions" | "budget";
export type AIVerbosity = "concise" | "balanced" | "detailed";

export interface AIPreferences {
  nickname: string;
  verbosity: AIVerbosity;
  proactiveAlerts: {
    schedule: boolean;   // upcoming events, conflicts
    finance: boolean;    // bill reminders, budget alerts
    health: boolean;     // activity reminders, sleep
    goals: boolean;      // goal progress nudges
  };
}

export interface WidgetConfig {
  id: string;
  visible: boolean;
}

export interface GeneralPreferences {
  defaultCalendarView: CalendarView;
  defaultFinanceView: FinanceView;
  dateFormat: DateFormat;
  weekStart: WeekStart;
}

export interface AllPreferences {
  accent: AccentColor;
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarFavorites: string[]; // nav item IDs that appear first
  widgets: WidgetConfig[];
  widgetOrder: string[]; // ordered widget IDs
  ai: AIPreferences;
  general: GeneralPreferences;
}

// ── Defaults ───────────────────────────────────────────────────

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "ai-briefing", visible: true },
  { id: "weather", visible: true },
  { id: "traffic", visible: true },
  { id: "upcoming-events", visible: true },
  { id: "daily-goals", visible: true },
  { id: "health-snapshot", visible: true },
  { id: "budget-snapshot", visible: true },
  { id: "bills", visible: true },
  { id: "sleep-recommendation", visible: true },
];

export const DEFAULT_WIDGET_ORDER = [
  "ai-briefing",
  "weather",
  "traffic",
  "upcoming-events",
  "daily-goals",
  "health-snapshot",
  "budget-snapshot",
  "bills",
  "sleep-recommendation",
];

export const DEFAULT_AI_PREFS: AIPreferences = {
  nickname: "LifeOS",
  verbosity: "balanced",
  proactiveAlerts: {
    schedule: true,
    finance: true,
    health: false,
    goals: true,
  },
};

export const DEFAULT_GENERAL: GeneralPreferences = {
  defaultCalendarView: "month",
  defaultFinanceView: "overview",
  dateFormat: "MM/DD/YYYY",
  weekStart: "sunday",
};

function defaults(): AllPreferences {
  return {
    accent: "amber",
    theme: "light",
    sidebarCollapsed: false,
    sidebarFavorites: [],
    widgets: DEFAULT_WIDGETS.map((w) => ({ ...w })),
    widgetOrder: [...DEFAULT_WIDGET_ORDER],
    ai: { ...DEFAULT_AI_PREFS, proactiveAlerts: { ...DEFAULT_AI_PREFS.proactiveAlerts } },
    general: { ...DEFAULT_GENERAL },
  };
}

// ── Store ──────────────────────────────────────────────────────

const STORAGE_KEY = "lifeos-preferences";

function load(): AllPreferences {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle missing keys from older versions
    return deepMerge(defaults(), parsed);
  } catch {
    return defaults();
  }
}

function save(prefs: AllPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const ov = override[key];
    const bv = base[key];
    if (ov !== undefined && ov !== null) {
      if (typeof ov === "object" && !Array.isArray(ov) && typeof bv === "object" && !Array.isArray(bv) && bv !== null) {
        result[key] = deepMerge(bv as Record<string, unknown>, ov as Record<string, unknown>) as T[keyof T];
      } else {
        result[key] = ov as T[keyof T];
      }
    }
  }
  return result;
}

let cached: AllPreferences | null = null;

function getPrefs(): AllPreferences {
  if (!cached) cached = load();
  return cached;
}

function persist(): void {
  save(getPrefs());
}

// ── Public API ─────────────────────────────────────────────────

/** Get all preferences (live reference — mutations are persisted on set). */
export function getAllPreferences(): AllPreferences {
  return getPrefs();
}

/** Reload preferences from localStorage (e.g., if another tab changed them). */
export function reloadPreferences(): void {
  cached = null;
}

// -- Accent & Theme --

export function getAccent(): AccentColor {
  return getPrefs().accent;
}

export function setAccent(accent: AccentColor): void {
  getPrefs().accent = accent;
  persist();
  applyAccentAttribute(accent);
}

export function getTheme(): Theme {
  return getPrefs().theme;
}

export function setTheme(theme: Theme): void {
  getPrefs().theme = theme;
  persist();
}

// -- Sidebar --

export function getSidebarCollapsed(): boolean {
  return getPrefs().sidebarCollapsed;
}

export function setSidebarCollapsed(collapsed: boolean): void {
  getPrefs().sidebarCollapsed = collapsed;
  persist();
}

export function getSidebarFavorites(): string[] {
  return getPrefs().sidebarFavorites;
}

export function setSidebarFavorites(ids: string[]): void {
  getPrefs().sidebarFavorites = ids;
  persist();
}

// -- Widgets --

export function getWidgets(): WidgetConfig[] {
  return getPrefs().widgets;
}

export function getWidgetOrder(): string[] {
  return getPrefs().widgetOrder;
}

export function setWidgetVisibility(id: string, visible: boolean): void {
  const prefs = getPrefs();
  const w = prefs.widgets.find((x) => x.id === id);
  if (w) {
    w.visible = visible;
    persist();
  }
}

export function setWidgetOrder(order: string[]): void {
  getPrefs().widgetOrder = order;
  persist();
}

export function resetWidgets(): void {
  const prefs = getPrefs();
  prefs.widgets = DEFAULT_WIDGETS.map((w) => ({ ...w }));
  prefs.widgetOrder = [...DEFAULT_WIDGET_ORDER];
  persist();
}

// -- AI --

export function getAIPreferences(): AIPreferences {
  return getPrefs().ai;
}

export function setAIPreferences(ai: Partial<AIPreferences>): void {
  const prefs = getPrefs();
  if (ai.nickname !== undefined) prefs.ai.nickname = ai.nickname;
  if (ai.verbosity !== undefined) prefs.ai.verbosity = ai.verbosity;
  if (ai.proactiveAlerts) {
    Object.assign(prefs.ai.proactiveAlerts, ai.proactiveAlerts);
  }
  persist();
}

export function setAIAlert(category: keyof AIPreferences["proactiveAlerts"], enabled: boolean): void {
  getPrefs().ai.proactiveAlerts[category] = enabled;
  persist();
}

// -- General --

export function getGeneralPreferences(): GeneralPreferences {
  return getPrefs().general;
}

export function setGeneralPreferences(general: Partial<GeneralPreferences>): void {
  Object.assign(getPrefs().general, general);
  persist();
}

// ── DOM helpers ────────────────────────────────────────────────

function applyAccentAttribute(accent: AccentColor): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-accent", accent);
}

/** Call on app init to apply persisted accent to DOM. */
export function initAccentAttribute(): void {
  applyAccentAttribute(getAccent());
}
