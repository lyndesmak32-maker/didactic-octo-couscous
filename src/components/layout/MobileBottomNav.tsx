import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, Sparkles, Wallet, Menu } from "lucide-react";

interface MobileBottomNavProps {
  onMenuClick: () => void;
  onAIClick: () => void;
}

export function MobileBottomNav({
  onMenuClick,
  onAIClick,
}: MobileBottomNavProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
    { id: "ai", label: "AI", icon: Sparkles, path: "", onClick: onAIClick },
    {
      id: "finances",
      label: "Money",
      icon: Wallet,
      path: "/finances",
    },
    { id: "more", label: "More", icon: Menu, path: "", onClick: onMenuClick },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[var(--bottom-nav-height)] items-center justify-around border-t border-surface-200 bg-white/90 backdrop-blur-lg dark:border-surface-800 dark:bg-surface-950/90 lg:hidden">
      {tabs.map((tab) => {
        const isActive =
          tab.path === "/"
            ? currentPath === "/"
            : tab.path
              ? currentPath.startsWith(tab.path)
              : false;
        const Icon = tab.icon;

        if (tab.onClick) {
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                tab.id === "ai"
                  ? "text-accent-600 dark:text-accent-400"
                  : "text-surface-500 dark:text-surface-400"
              }`}
            >
              <div
                className={`rounded-lg p-1 ${
                  tab.id === "ai"
                    ? "bg-accent-100 dark:bg-accent-900/50"
                    : ""
                }`}
              >
                <Icon className="size-5" />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "text-accent-600 dark:text-accent-400"
                : "text-surface-500 dark:text-surface-400"
            }`}
          >
            <Icon className="size-5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
