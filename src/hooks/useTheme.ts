import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  getAccent,
  setAccent as persistAccent,
  getTheme,
  setTheme as persistTheme,
  initAccentAttribute,
} from "~/data/preferences";

export type Theme = "light" | "dark";
export type AccentColor = "amber" | "blue" | "emerald" | "rose" | "violet" | "cyan";

export const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: "amber", label: "Amber", hex: "#f59e0b" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "emerald", label: "Emerald", hex: "#10b981" },
  { id: "rose", label: "Rose", hex: "#f43f5e" },
  { id: "violet", label: "Violet", hex: "#8b5cf6" },
  { id: "cyan", label: "Cyan", hex: "#06b6d4" },
];

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // On mount: apply stored theme and accent to DOM
  useEffect(() => {
    const stored = localStorage.getItem("lifeos-theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (stored) {
      applyTheme(stored);
    } else if (prefersDark) {
      applyTheme("dark");
    }

    // Apply accent from preferences
    initAccentAttribute();
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("lifeos-theme", t);
    persistTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

  const accent = useCallback((): AccentColor => {
    if (typeof window === "undefined") return "amber";
    return getAccent();
  }, []);

  const setAccent = useCallback((a: AccentColor) => {
    persistAccent(a);
    notify();
  }, []);

  return { theme, setTheme, toggleTheme, accent, setAccent };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  notify();
}
