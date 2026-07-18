import { useNavigate } from "@tanstack/react-router";
import { Menu, Moon, Sun, User } from "lucide-react";

interface TopBarProps {
  pageTitle: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleAIPanel: () => void;
  onMenuClick: () => void;
  aiPanelOpen: boolean;
}

export function TopBar({
  pageTitle,
  theme,
  onToggleTheme,
  onToggleAIPanel,
  onMenuClick,
  aiPanelOpen,
}: TopBarProps) {
  const navigate = useNavigate();
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center gap-3 border-b border-surface-200 bg-white/80 px-4 backdrop-blur-lg dark:border-surface-800 dark:bg-surface-950/80 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-surface-900 dark:text-surface-100">
          {pageTitle}
        </h1>
        <p className="hidden text-xs text-surface-500 dark:text-surface-400 sm:block">
          {dateStr}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </button>

        {/* AI toggle */}
        <button
          onClick={onToggleAIPanel}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            aiPanelOpen
              ? "bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300"
              : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          }`}
        >
          AI
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate({ to: "/settings" })}
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-surface-200 text-surface-500 transition-colors hover:bg-surface-300 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
          aria-label="Profile"
        >
          <User className="size-4" />
        </button>
      </div>
    </header>
  );
}
