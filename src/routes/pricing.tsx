import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, type FormEvent } from "react";
import { useAuth } from "../auth-context";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

// ─── Plan data ─────────────────────────────────────────────────────────────

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  key: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  stripeLink: string;
  highlighted: boolean;
  limit: number | typeof Infinity;
}

const plans: Plan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic lead generation.",
    features: [
      { text: "10 leads lifetime", included: true },
      { text: "Single business type", included: true },
      { text: "Email support", included: true },
      { text: "Location-based search", included: false },
      { text: "Multiple business types", included: false },
      { text: "Enriched contact data", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    stripeLink: "",
    highlighted: false,
    limit: 10,
  },
  {
    key: "starter",
    name: "Starter",
    price: "$99",
    period: "/year",
    description: "For growing businesses that need a steady lead pipeline.",
    features: [
      { text: "50 leads/month", included: true },
      { text: "Multiple business types", included: true },
      { text: "Location-based search", included: true },
      { text: "Email support", included: true },
      { text: "Enriched contact data", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Upgrade to Starter",
    stripeLink: "https://buy.stripe.com/bJe00jeXa45H0BRdXJ18c0B",
    highlighted: false,
    limit: 50,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$199",
    period: "/year",
    description: "For power users who want unlimited leads and premium features.",
    features: [
      { text: "Unlimited leads", included: true },
      { text: "Everything in Starter", included: true },
      { text: "Enriched contact data", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade to Pro",
    stripeLink: "https://buy.stripe.com/cNi4gzbKYau5fwL3j518c0C",
    highlighted: true,
    limit: Infinity,
  },
];

// ─── Icons ─────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-emerald-500"
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
  );
}

function CrossIcon() {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-gray-300"
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
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isCurrentPlan,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
}) {
  const { user } = useAuth();

  // Build Stripe link with prefilled_email when user is logged in
  const getStripeLinkWithEmail = () => {
    if (!user?.email || !plan.stripeLink) return plan.stripeLink;
    const url = new URL(plan.stripeLink);
    url.searchParams.set("prefilled_email", user.email);
    return url.toString();
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg ${
        plan.highlighted
          ? "border-indigo-500 shadow-indigo-100"
          : "border-gray-200"
      }`}
    >
      {/* Recommended badge */}
      {plan.highlighted && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
          <span className="inline-block rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
            Recommended
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

      {/* Price */}
      <div className="mt-6">
        <span className="text-4xl font-extrabold tracking-tight text-gray-900">
          {plan.price}
        </span>
        {plan.period && (
          <span className="text-sm font-medium text-gray-500">
            {plan.period}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="mt-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            {feature.included ? <CheckIcon /> : <CrossIcon />}
            <span
              className={`text-sm ${
                feature.included ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8">
        {isCurrentPlan && user ? (
          <button
            disabled
            className="w-full rounded-xl border-2 border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700"
          >
            Current Plan
          </button>
        ) : plan.key === "free" && !user ? (
          <a
            href="/register"
            className="block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98]"
          >
            Get Started Free
          </a>
        ) : plan.key === "free" && user ? (
          <button
            disabled
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-400"
          >
            Current Plan
          </button>
        ) : user ? (
          <a
            href={getStripeLinkWithEmail()}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold shadow-md transition-all active:scale-[0.98] ${
              plan.highlighted
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg"
                : "border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {plan.cta}
          </a>
        ) : (
          <a
            href={plan.stripeLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold shadow-md transition-all active:scale-[0.98] ${
              plan.highlighted
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg"
                : "border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {plan.cta}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Already Purchased Section ─────────────────────────────────────────────

function AlreadyPurchasedSection() {
  const { user } = useAuth();

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">
        Already purchased?
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        After completing your Stripe payment, click a plan below to activate it
        instantly.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={`/payment-success?plan=starter${
            user ? "" : ""
          }`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300 active:scale-[0.98]"
        >
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
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Activate Starter
        </a>
        <a
          href="/payment-success?plan=pro"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300 active:scale-[0.98]"
        >
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
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Activate Pro
        </a>
      </div>
    </div>
  );
}

// ─── Upgrade Activation Form (less prominent, manual fallback) ─────────────

function UpgradeActivation() {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">(
    "starter",
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleActivate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setMessage(null);
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ plan: selectedPlan }),
        });
        const data = await res.json();

        if (!res.ok) {
          setMessage({
            type: "error",
            text: data.error ?? "Failed to activate plan",
          });
          return;
        }

        setMessage({
          type: "success",
          text: `${
            selectedPlan === "starter" ? "Starter" : "Pro"
          } plan activated! Redirecting to dashboard...`,
        });

        setTimeout(() => {
          navigate({ to: "/dashboard", replace: true });
        }, 1500);
      } catch {
        setMessage({
          type: "error",
          text: "Network error. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedPlan, navigate],
  );

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs font-medium text-gray-400 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-600 hover:decoration-gray-400"
        >
          Manual activation (dropdown)
        </button>
      ) : (
        <div>
          <button
            onClick={() => setShowForm(false)}
            className="mb-3 text-xs font-medium text-gray-400 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-600 hover:decoration-gray-400"
          >
            Hide manual activation
          </button>
          <form onSubmit={handleActivate} className="space-y-3">
            <div>
              <label
                htmlFor="plan-select"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Select plan
              </label>
              <select
                id="plan-select"
                value={selectedPlan}
                onChange={(e) =>
                  setSelectedPlan(e.target.value as "starter" | "pro")
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              >
                <option value="starter">Starter — $99/year</option>
                <option value="pro">Pro — $199/year</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Activating...
                </>
              ) : (
                "Activate"
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-3 rounded-lg p-3 text-xs font-medium ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pricing Page Component ───────────────────────────────────────────────

function PricingPage() {
  const { user } = useAuth();
  const currentPlan = user?.plan ?? "free";

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back to home */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="inline-flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-200">
              <svg
                className="h-5 w-5 text-white"
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              LeadFlow
            </h1>
          </a>

          {/* Nav */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <a
                  href="/dashboard"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Dashboard
                </a>
                <span className="text-sm text-gray-400">{user.email}</span>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Choose the plan that fits your business. Upgrade anytime as your
            lead generation needs grow.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              isCurrentPlan={currentPlan === plan.key}
            />
          ))}
        </div>

        {/* After-purchase instructions */}
        {!user && (
          <AlreadyPurchasedSection />
        )}

        {/* For logged-in users: already purchased + manual activation */}
        {user && (
          <div className="mt-8 text-center">
            <AlreadyPurchasedSection />
            <UpgradeActivation />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          LeadFlow &mdash; Automated Lead Generation
        </footer>
      </div>
    </div>
  );
}
