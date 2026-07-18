import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AIPanel } from "./AIPanel";
import { MobileBottomNav } from "./MobileBottomNav";
import { useTheme } from "~/hooks/useTheme";
import { useAIPanel } from "~/hooks/useAIPanel";
import { navItems } from "./navItems";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { open: aiPanelOpen, toggle: toggleAIPanel, close: closeAIPanel } = useAIPanel();

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const currentNav = navItems.find((item) =>
    item.path === "/"
      ? currentPath === "/"
      : currentPath.startsWith(item.path),
  );
  const pageTitle = currentNav?.label ?? "LifeOS";

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />

      {/* Main area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 lg:ml-[var(--sidebar-width)] ${
          sidebarCollapsed ? "lg:!ml-[var(--sidebar-collapsed-width)]" : ""
        } ${aiPanelOpen ? "lg:mr-[var(--ai-panel-width)]" : ""}`}
      >
        <TopBar
          pageTitle={pageTitle}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleAIPanel={toggleAIPanel}
          onMenuClick={handleMobileMenuOpen}
          aiPanelOpen={aiPanelOpen}
        />

        {/* Page content */}
        <main className="flex-1 pb-[var(--bottom-nav-height)] lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* AI Panel */}
      <AIPanel open={aiPanelOpen} onClose={closeAIPanel} />

      {/* Mobile bottom nav */}
      <MobileBottomNav
        onMenuClick={handleMobileMenuOpen}
        onAIClick={toggleAIPanel}
      />
    </div>
  );
}
