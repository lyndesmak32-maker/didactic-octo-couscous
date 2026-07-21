import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth } from "../auth-context";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LeadFlow — Automated Lead Generation" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AuthProvider>
        <AuthGuard>
          <Outlet />
        </AuthGuard>
      </AuthProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// ─── Auth Guard ──────────────────────────────────────────────────────────────

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Determine if we're on an auth page (login or register)
  const currentPath = router.state.location.pathname;
  const isAuthPage =
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/pricing" ||
    currentPath === "/payment-success";

  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      router.navigate({ to: "/login", replace: true });
    }
  }, [user, isLoading, isAuthPage, router]);

  // Loading spinner while checking session
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // On auth pages, let them through even if not authenticated
  if (!user && isAuthPage) {
    return <>{children}</>;
  }

  // Not authenticated and not on an auth page — show nothing while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
