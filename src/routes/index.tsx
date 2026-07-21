import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../auth-context";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

// ─── Reusable Components ──────────────────────────────────────────────────

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  return (
    <div
      className={`flex ${sizeClasses[size]} items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-200`}
    >
      <svg
        className={size === "sm" ? "h-4 w-4 text-white" : size === "lg" ? "h-6 w-6 text-white" : "h-5 w-5 text-white"}
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
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-xl font-bold tracking-tight text-gray-900">
            LeadFlow
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98]"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98]"
              >
                Get Started Free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-white px-4 py-20 sm:px-6 lg:px-8">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Automated lead generation for any business
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
          Find Qualified Leads{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            on Autopilot
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          Tell LeadFlow what business you&apos;re in, and we continuously find and deliver
          qualified potential customers — sourced from real data like OpenStreetMap.
          No manual research required.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl active:scale-[0.98]"
            >
              Go to Dashboard
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl active:scale-[0.98]"
              >
                Get Started Free
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
              >
                View Pricing
              </Link>
            </>
          )}
        </div>

        {/* Social proof */}
        <p className="mt-6 text-sm text-gray-400">
          Free plan available · No credit card required
        </p>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Tell us your business type",
      description:
        "Describe what kind of business you run — plumbing, marketing agency, dentist, or anything else. LeadFlow adapts to your niche.",
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      number: "2",
      title: "We search real data sources",
      description:
        "LeadFlow taps into OpenStreetMap and other public datasets to find businesses matching your target profile — all with real contact information.",
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      number: "3",
      title: "Get qualified leads delivered",
      description:
        "Review your leads on a clean dashboard. Each lead includes company name, contact details, industry, and a quality score. Track status from new to qualified.",
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Three simple steps from setup to qualified leads
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Step number */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                {step.number}
              </div>
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                {step.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Real Data Sources",
      description:
        "Leads are sourced from OpenStreetMap and other public databases — not scraped or guessed. You get real businesses with verified contact info.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: "Location-Based Search",
      description:
        "Target businesses by city or region. Find leads where your customers actually are — not random contacts from a database.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      title: "Lead Scoring",
      description:
        "Every lead comes with a quality score. Focus your time on the highest-value prospects and skip the noise.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
    {
      title: "Status Tracking",
      description:
        "Mark leads as New, Contacted, Qualified, or Archived. Keep your pipeline organized and never lose track of a prospect.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "No Manual Research",
      description:
        "Stop spending hours Googling for leads. LeadFlow automates the entire discovery process so you can focus on closing deals.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      title: "Adapts to Any Business",
      description:
        "From plumbers to marketing agencies to dentists — just tell LeadFlow what you do, and it finds the right prospects for your niche.",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need to Generate Leads
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Purpose-built features that replace hours of manual research
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try out LeadFlow with basic lead generation.",
      features: ["10 leads lifetime", "Single business type", "Email support"],
      highlighted: false,
    },
    {
      name: "Starter",
      price: "$99",
      period: "/year",
      description: "For growing businesses that need a steady pipeline.",
      features: [
        "50 leads/month",
        "Multiple business types",
        "Location-based search",
        "Email support",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$199",
      period: "/year",
      description: "For power users who want unlimited leads.",
      features: [
        "Unlimited leads",
        "Everything in Starter",
        "Enriched contact data",
        "Priority support",
      ],
      highlighted: true,
    },
  ];

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Start free, upgrade when you&apos;re ready to grow
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border-2 bg-white p-8 shadow-sm ${
                plan.highlighted
                  ? "border-indigo-500 shadow-indigo-100"
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
                  <span className="inline-block rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                    Recommended
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {plan.period}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
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
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA to full pricing */}
        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-600 bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 active:scale-[0.98]"
          >
            View Full Pricing Details
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-br from-indigo-600 to-blue-700 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to Stop Hunting for Leads?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
          Join businesses that use LeadFlow to find qualified prospects every
          day. Start free — no credit card required.
        </p>
        <div className="mt-10">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-50 active:scale-[0.98]"
            >
              Go to Dashboard
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-50 active:scale-[0.98]"
            >
              Get Started Free
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & copyright */}
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} LeadFlow. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              Pricing
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingTeaser />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
