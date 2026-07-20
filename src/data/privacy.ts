export type ModuleName =
  | "calendar"
  | "finances"
  | "health"
  | "documents"
  | "family"
  | "shopping"
  | "travel";

export interface PrivacyState {
  moduleVisibility: Record<ModuleName, boolean>;
  hideSensitiveData: boolean;
}

const STORAGE_KEY = "lifeos-privacy";

function getDefaultState(): PrivacyState {
  return {
    moduleVisibility: {
      calendar: true,
      finances: true,
      health: true,
      documents: true,
      family: true,
      shopping: true,
      travel: true,
    },
    hideSensitiveData: false,
  };
}

function loadState(): PrivacyState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultState(), ...parsed };
    }
  } catch {
    // corrupted
  }
  const def = getDefaultState();
  saveState(def);
  return def;
}

function saveState(state: PrivacyState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Public API ──────────────────────────────────────────────

export function getPrivacyState(): PrivacyState {
  return loadState();
}

export function setModuleVisibility(
  module: ModuleName,
  visible: boolean,
): void {
  const state = loadState();
  state.moduleVisibility[module] = visible;
  saveState(state);
}

export function setHideSensitiveData(hide: boolean): void {
  const state = loadState();
  state.hideSensitiveData = hide;
  saveState(state);
}

export function isModuleVisible(module: ModuleName): boolean {
  return loadState().moduleVisibility[module];
}

export function isSensitiveDataHidden(): boolean {
  return loadState().hideSensitiveData;
}

// ── Data export / delete ────────────────────────────────────

const ALL_LIFEOS_KEYS = [
  "lifeos-auth",
  "lifeos-privacy",
  "lifeos-calendar",
  "lifeos-finances",
  "lifeos-health",
  "lifeos-documents",
  "lifeos-family",
  "lifeos-shopping",
  "lifeos-travel",
  "lifeos-goals",
  "lifeos-reminders",
  "lifeos-ai-memory",
  "lifeos-ai-automation",
  "lifeos-theme",
];

export function exportAllData(): object {
  const exportData: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    for (const key of ALL_LIFEOS_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          exportData[key] = JSON.parse(raw);
        }
      } catch {
        // skip unparseable
      }
    }
  }
  return {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
    data: exportData,
  };
}

export function deleteAllData(): void {
  if (typeof window === "undefined") return;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith("lifeos-")) {
      localStorage.removeItem(key);
    }
  }
}
