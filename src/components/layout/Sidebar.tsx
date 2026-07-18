import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { navItems } from "./navItems";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const sidebarContent = (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-surface-200 bg-surface-50 transition-all duration-300 dark:border-surface-800 dark:bg-surface-900 ${
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-[var(--topbar-height)] items-center border-b border-surface-200 px-4 dark:border-surface-800 ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-lg shadow-accent-600/25">
          <Sparkles className="size-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100">
            LifeOS
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? currentPath === "/"
                : currentPath.startsWith(item.path);
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={onMobileClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    collapsed ? "justify-center px-2" : ""
                  } ${
                    isActive
                      ? "bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
                  }`}
                >
                  <Icon
                    className={`size-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? "text-accent-600 dark:text-accent-400" : ""
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto size-1.5 rounded-full bg-accent-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-surface-200 p-2 dark:border-surface-800">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-40 w-[var(--sidebar-width)] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
