import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AppShell } from "~/components/layout/AppShell";
import { PinLock } from "~/components/PinLock";
import {
  isPinSet,
  isSessionExpired,
  unlockSession,
  recordActivity,
  resetAuth,
} from "~/utils/auth";
import { deleteAllData } from "~/data/privacy";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#0a0a0a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      { name: "apple-mobile-web-app-title", content: "LifeOS" },
      { title: "LifeOS" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", type: "image/svg+xml", href: "/icons/icon.svg" },
      {
        rel: "apple-touch-icon",
        href: "/icons/icon-192.png",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100">
          404
        </h1>
        <p className="mt-2 text-surface-500">Page not found</p>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  const [locked, setLocked] = useState(false);

  // Check lock state on mount and periodically
  useEffect(() => {
    const checkLock = () => {
      if (isPinSet() && isSessionExpired()) {
        setLocked(true);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 3000);
    return () => clearInterval(interval);
  }, []);

  // Track user activity
  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
    let throttleTimer: ReturnType<typeof setTimeout>;

    const onActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = undefined as unknown as ReturnType<typeof setTimeout>;
        recordActivity();
      }, 2000);
    };

    for (const ev of events) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, onActivity);
      }
    };
  }, []);

  // Track visibility: lock when user returns after timeout
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (isPinSet() && isSessionExpired()) {
          setLocked(true);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const handleUnlock = useCallback(
    (pin: string) => {
      if (unlockSession(pin)) {
        setLocked(false);
      }
      // If unlock fails, PinLock component handles the visual feedback
      // unlockSession already verifies internally
    },
    [],
  );

  const handleForgotPin = useCallback(() => {
    // Delete all LifeOS data and reset
    deleteAllData();
    resetAuth();
    window.location.reload();
  }, []);

  if (locked) {
    return (
      <RootDocument>
        <PinLock
          mode="unlock"
          onSuccess={handleUnlock}
          onForgotPin={handleForgotPin}
        />
      </RootDocument>
    );
  }

  return (
    <RootDocument>
      <AppShell />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('lifeos-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
