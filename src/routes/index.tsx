import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useCallback } from "react";
import { getDb } from "../db";
import { generateLeads } from "../lead-generator";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lead {
  id: number;
  company_name: string;
  industry: string;
  contact_name: string;
  email: string;
  phone: string;
  source: string;
  score: number;
  business_type: string;
  status: string;
  created_at: string;
}

type LeadStatus = "new" | "contacted" | "qualified" | "archived";

// ─── Server Functions ────────────────────────────────────────────────────────

const fetchLeadsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Lead[]> => {
    const db = getDb();
    return db
      .prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 100")
      .all() as Lead[];
  },
);

const generateLeadsFn = createServerFn().handler(
  async (businessType: string): Promise<{ leads: Lead[]; count: number }> => {
    const leads = generateLeads(businessType, 10);
    const db = getDb();

    const insert = db.prepare(`
      INSERT INTO leads (company_name, industry, contact_name, email, phone, source, score, business_type, status, created_at)
      VALUES ($company_name, $industry, $contact_name, $email, $phone, $source, $score, $business_type, $status, $created_at)
    `);

    const insertMany = db.transaction((items: typeof leads) => {
      for (const lead of items) {
        insert.run({
          $company_name: lead.company_name,
          $industry: lead.industry,
          $contact_name: lead.contact_name,
          $email: lead.email,
          $phone: lead.phone,
          $source: lead.source,
          $score: lead.score,
          $business_type: lead.business_type,
          $status: lead.status,
          $created_at: lead.created_at,
        });
      }
    });

    insertMany(leads);

    const insertedLeads = db
      .prepare(
        "SELECT * FROM leads WHERE business_type = ? ORDER BY id DESC LIMIT ?",
      )
      .all(businessType, 10) as Lead[];

    return { leads: insertedLeads, count: insertedLeads.length };
  },
);

const updateLeadStatusFn = createServerFn().handler(
  async ({
    id,
    status,
  }: {
    id: number;
    status: string;
  }): Promise<Lead> => {
    const db = getDb();
    db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
    return db
      .prepare("SELECT * FROM leads WHERE id = ?")
      .get(id) as Lead;
  },
);

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  loader: () => fetchLeadsFn(),
  component: Dashboard,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getScoreBadge(score: number) {
  if (score >= 70) {
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "ring-emerald-200",
      label: "High",
    };
  }
  if (score >= 50) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "ring-amber-200",
      label: "Medium",
    };
  }
  return {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-200",
    label: "Low",
  };
}

function getSourceIcon(source: string): string {
  const map: Record<string, string> = {
    LinkedIn: "🔗",
    "Google Maps": "📍",
    Yelp: "⭐",
    "Industry Directory": "📋",
    "Trade Show": "🏢",
  };
  return map[source] ?? "🌐";
}

// ─── Components ──────────────────────────────────────────────────────────────

function DashboardHeader() {
  return (
    <header className="mb-10 text-center">
      <div className="inline-flex items-center gap-2.5 mb-3">
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          LeadFlow
        </h1>
      </div>
      <p className="text-lg font-medium text-indigo-600">Automated Lead Generation</p>
      <p className="mt-1.5 text-sm text-gray-500">
        Enter your business type and get qualified leads instantly
      </p>
    </header>
  );
}

function StatsBar({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = leads.filter(
    (l) => new Date(l.created_at) >= oneWeekAgo,
  ).length;

  const avgScore =
    totalLeads > 0
      ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / totalLeads)
      : 0;

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads.toLocaleString(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "New This Week",
      value: newThisWeek.toLocaleString(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Avg Score",
      value: avgScore.toString(),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-gray-900">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50">
        <svg
          className="h-12 w-12 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">No leads yet</h3>
      <p className="max-w-sm text-sm text-gray-500">
        Enter a business type above and click "Generate Leads" to find qualified
        potential customers for your business.
      </p>
    </div>
  );
}

function LeadCard({
  lead,
  onStatusChange,
  isUpdating,
}: {
  lead: Lead;
  onStatusChange: (id: number, status: LeadStatus) => void;
  isUpdating: boolean;
}) {
  const scoreBadge = getScoreBadge(lead.score);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300">
      {/* Top row: company + score */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-gray-900">
            {lead.company_name}
          </h3>
          <span className="inline-block mt-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {lead.industry}
          </span>
        </div>
        <div
          className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${scoreBadge.bg} ${scoreBadge.text} ${scoreBadge.ring}`}
        >
          <span>{lead.score}</span>
          <span className="opacity-60">·</span>
          <span>{scoreBadge.label}</span>
        </div>
      </div>

      {/* Contact details */}
      <div className="mb-4 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="font-medium">{lead.contact_name}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <a
            href={`mailto:${lead.email}`}
            className="truncate text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            {lead.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          <span>{lead.phone}</span>
        </div>
      </div>

      {/* Bottom row: source, time, status */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <span>{getSourceIcon(lead.source)}</span>
            <span>{lead.source}</span>
          </span>
          <span className="text-xs text-gray-400">
            {getRelativeTime(lead.created_at)}
          </span>
        </div>
        <div className="relative">
          <select
            value={lead.status}
            disabled={isUpdating}
            onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
            className={`appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-8 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 ${
              lead.status === "new"
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : lead.status === "contacted"
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : lead.status === "qualified"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-gray-500 bg-gray-50 border-gray-200"
            }`}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="archived">Archived</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadGrid({
  leads,
  onStatusChange,
  updatingIds,
}: {
  leads: Lead[];
  onStatusChange: (id: number, status: LeadStatus) => void;
  updatingIds: Set<number>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onStatusChange={onStatusChange}
          isUpdating={updatingIds.has(lead.id)}
        />
      ))}
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

function Dashboard() {
  const initialLeads = Route.useLoaderData() as Lead[];
  const [leads, setLeads] = useState<Lead[]>(initialLeads ?? []);
  const [businessType, setBusinessType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const trimmed = businessType.trim();
    if (!trimmed) return;

    setIsGenerating(true);
    setError(null);
    try {
      await generateLeadsFn(trimmed);
      const allLeads = await fetchLeadsFn();
      setLeads(allLeads);
      setBusinessType("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate leads");
    } finally {
      setIsGenerating(false);
    }
  }, [businessType]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isGenerating) {
        handleGenerate();
      }
    },
    [handleGenerate, isGenerating],
  );

  const handleStatusChange = useCallback(
    async (id: number, status: LeadStatus) => {
      setUpdatingIds((prev) => new Set(prev).add(id));
      try {
        const updated = await updateLeadStatusFn({ id, status });
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...updated } : l)),
        );
      } catch (err) {
        console.error("Failed to update status:", err);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [],
  );

  const hasLeads = leads.length > 0;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <DashboardHeader />

        {/* Business Type Input */}
        <div className="mb-8">
          <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., plumbing, marketing agency, dentist..."
                disabled={isGenerating}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-3 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !businessType.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md disabled:active:scale-100"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Generating...
                </>
              ) : (
                <>
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
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                    />
                  </svg>
                  Generate Leads
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Stats + Leads or Empty State */}
        {hasLeads ? (
          <>
            <StatsBar leads={leads} />
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Showing <span className="text-gray-900">{leads.length}</span>{" "}
                {leads.length === 1 ? "lead" : "leads"}
              </p>
            </div>
            <LeadGrid
              leads={leads}
              onStatusChange={handleStatusChange}
              updatingIds={updatingIds}
            />
          </>
        ) : (
          <EmptyState />
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          LeadFlow &mdash; Automated Lead Generation
        </footer>
      </div>
    </div>
  );
}
