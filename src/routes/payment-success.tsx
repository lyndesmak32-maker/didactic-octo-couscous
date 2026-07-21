import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth-context";

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/payment-success")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { plan?: string } => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: PaymentSuccessPage,
});

// ─── Plan display helpers ────────────────────────────────────────────────────

const planNames: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
};

const planUrls: Record<string, string> = {
  starter: "https://buy.stripe.com/bJe00jeXa45H0BRdXJ18c0B",
  pro: "https://buy.stripe.com/cNi4gzbKYau5fwL3j518c0C",
};

// ─── Component ───────────────────────────────────────────────────────────────

function PaymentSuccessPage() {
  const { plan } = Route.useSearch();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activationState, setActivationState] = useState<
    "idle" | "activating" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect to pricing if no plan param
  useEffect(() => {
    if (!plan) {
      navigate({ to: "/pricing", replace: true });
    }
  }, [plan, navigate]);

  // Auto-activate plan for logged-in users
  const activatePlan = useCallback(async () => {
    if (!user || !plan) return;

    // Don't re-activate if already the same plan
    if (user.plan === plan) {
      setActivationState("success");
      return;
    }

    setActivationState("activating");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setActivationState("error");
        setErrorMessage(data.error ?? "Failed to activate plan");
        return;
      }

      // Update the local user state by reloading
      setActivationState("success");
    } catch {
      setActivationState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }, [user, plan]);

  // Trigger activation once user is loaded
  useEffect(() => {
    if (!isLoading && user && plan && activationState === "idle") {
      activatePlan();
    }
  }, [isLoading, user, plan, activationState, activatePlan]);

  // If loading auth state
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

  // No plan — redirecting (handled by useEffect above)
  if (!plan) {
    return null;
  }

  const displayName = planNames[plan] ?? plan;
  const isLoggedIn = !!user;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
          {/* Logo */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-200">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>

          {/* State: Logged-in, activating */}
          {isLoggedIn && activationState === "activating" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Activating your plan...
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Please wait while we set up your {displayName} plan.
              </p>
            </>
          )}

          {/* State: Logged-in, success (or already on plan) */}
          {isLoggedIn && activationState === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                ✅ Your {displayName} plan is now active!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                You now have access to all {displayName} features. Start
                generating leads now.
              </p>
              <div className="mt-8">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Go to Dashboard
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </>
          )}

          {/* State: Logged-in, error */}
          {isLoggedIn && activationState === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Activation failed
              </h2>
              <p className="mt-2 text-sm text-red-600">
                {errorMessage ?? "Something went wrong."}
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={activatePlan}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Try Again
                </button>
                <a
                  href="/dashboard"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  Go to Dashboard
                </a>
              </div>
            </>
          )}

          {/* State: Logged-in, idle (already on plan) */}
          {isLoggedIn && activationState === "idle" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                ✅ Your {displayName} plan is active!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Start generating leads →
              </p>
              <div className="mt-8">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Go to Dashboard
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </>
          )}

          {/* State: Not logged in */}
          {!isLoggedIn && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment received!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Create an account or log in to activate your {displayName} plan.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Create Account
                </a>
                <a
                  href="/login"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  Log In
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                After logging in, return to this page to activate your{" "}
                {displayName} plan.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-400">
          LeadFlow &mdash; Automated Lead Generation
        </footer>
      </div>
    </div>
  );
}
