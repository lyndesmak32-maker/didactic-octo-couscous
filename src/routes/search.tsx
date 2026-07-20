import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  Search,
  X,
  FileText,
  Calendar,
  Wallet,
  Heart,
  Target,
  ShoppingCart,
  Plane,
  Users,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { getDocuments } from "~/data/documents";
import { getAllEvents } from "~/data/calendar";
import { getExpenses, getIncomes, getRecurringBills, getSavingsGoals } from "~/data/finances";
import { getMedications, getExerciseEntries, getDoctorAppointments } from "~/data/health";
import { getGoals } from "~/data/goals";
import { getGroceryLists, getWishlist, getPantry } from "~/data/shopping";
import { getTrips, getFlights, getHotels, getPlaces } from "~/data/travel";
import { getMembers, getChores, getContacts, getPets } from "~/data/family";

export const Route = createFileRoute("/search")({ component: SearchPage });

// ── Types ──────────────────────────────────────────────
interface SearchResult {
  id: string;
  module: ModuleId;
  title: string;
  subtitle: string;
  url: string;
}

type ModuleId =
  | "documents"
  | "calendar"
  | "finances"
  | "health"
  | "goals"
  | "shopping"
  | "travel"
  | "family";

interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MODULES: ModuleConfig[] = [
  { id: "documents", label: "Documents", icon: FileText, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40" },
  { id: "calendar", label: "Calendar", icon: Calendar, color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40" },
  { id: "finances", label: "Finances", icon: Wallet, color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40" },
  { id: "health", label: "Health", icon: Heart, color: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/40" },
  { id: "goals", label: "Goals", icon: Target, color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/40" },
  { id: "shopping", label: "Shopping", icon: ShoppingCart, color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/40" },
  { id: "travel", label: "Travel", icon: Plane, color: "text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/40" },
  { id: "family", label: "Family", icon: Users, color: "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/40" },
];

const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleConfig>;

const RECENT_SEARCHES_KEY = "lifeos-recent-searches";
const MAX_RECENT = 5;

const SUGGESTIONS = [
  "Where is my passport?",
  "What did I spend on gas?",
  "When is grandma's birthday?",
  "How much did I save this month?",
  "What medications do I take?",
];

// ── Search Logic ────────────────────────────────────────
function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // Documents
  try {
    const docs = getDocuments();
    for (const d of docs) {
      results.push({
        id: d.id,
        module: "documents",
        title: d.title,
        subtitle: `${d.category} · ${d.tags?.join(", ") ?? ""}`,
        url: "/documents",
      });
    }
  } catch {}

  // Calendar
  try {
    const events = getAllEvents();
    for (const e of events) {
      results.push({
        id: e.id,
        module: "calendar",
        title: e.title,
        subtitle: e.location ? `${e.location} · ${e.category ?? ""}` : e.category ?? "",
        url: "/calendar",
      });
    }
  } catch {}

  // Finances
  try {
    for (const exp of getExpenses()) {
      results.push({
        id: exp.id,
        module: "finances",
        title: exp.description,
        subtitle: `${exp.category} · $${exp.amount.toFixed(2)}`,
        url: "/finances",
      });
    }
    for (const inc of getIncomes()) {
      results.push({
        id: inc.id,
        module: "finances",
        title: inc.name,
        subtitle: `${inc.category} · $${inc.amount.toLocaleString()}/mo`,
        url: "/finances",
      });
    }
    for (const bill of getRecurringBills()) {
      results.push({
        id: bill.id,
        module: "finances",
        title: bill.name,
        subtitle: `Bill · $${bill.amount.toFixed(2)} · ${bill.status}`,
        url: "/finances",
      });
    }
    for (const goal of getSavingsGoals()) {
      results.push({
        id: goal.id,
        module: "finances",
        title: goal.name,
        subtitle: `Savings · $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`,
        url: "/finances",
      });
    }
  } catch {}

  // Health
  try {
    for (const med of getMedications()) {
      results.push({
        id: med.id,
        module: "health",
        title: med.name,
        subtitle: `${med.dosage} · ${med.time}`,
        url: "/health",
      });
    }
    for (const ex of getExerciseEntries()) {
      results.push({
        id: ex.id,
        module: "health",
        title: ex.activityType,
        subtitle: `${ex.durationMinutes}min · ${ex.calories}cal`,
        url: "/health",
      });
    }
    for (const apt of getDoctorAppointments()) {
      results.push({
        id: apt.id,
        module: "health",
        title: apt.doctorName,
        subtitle: `${apt.specialty} · ${apt.date}`,
        url: "/health",
      });
    }
  } catch {}

  // Goals
  try {
    const goals = getGoals();
    for (const g of goals) {
      results.push({
        id: g.id,
        module: "goals",
        title: g.title,
        subtitle: g.description ?? `${g.category} goal`,
        url: "/goals",
      });
    }
  } catch {}

  // Shopping
  try {
    for (const list of getGroceryLists()) {
      for (const item of list.items) {
        results.push({
          id: item.id,
          module: "shopping",
          title: item.name,
          subtitle: `Grocery · ${list.name} · ${item.category}`,
          url: "/shopping",
        });
      }
    }
    for (const item of getWishlist()) {
      results.push({
        id: item.id,
        module: "shopping",
        title: item.name,
        subtitle: `Wishlist · $${item.price?.toFixed(2) ?? "—"} · ${item.priority}`,
        url: "/shopping",
      });
    }
    for (const item of getPantry()) {
      results.push({
        id: item.id,
        module: "shopping",
        title: item.name,
        subtitle: `Pantry · ${item.quantity} ${item.unit ?? ""} · ${item.category}`,
        url: "/shopping",
      });
    }
  } catch {}

  // Travel
  try {
    const trips = getTrips();
    for (const trip of trips) {
      results.push({
        id: trip.id,
        module: "travel",
        title: trip.destination,
        subtitle: `${trip.startDate} → ${trip.endDate} · ${trip.status}`,
        url: "/travel",
      });
    }
    const flights = getFlights();
    for (const f of flights) {
      results.push({
        id: f.id,
        module: "travel",
        title: `${f.airline} ${f.flightNumber}`,
        subtitle: `${f.departureAirport} → ${f.arrivalAirport} · ${f.departureDate}`,
        url: "/travel",
      });
    }
    const hotels = getHotels();
    for (const h of hotels) {
      results.push({
        id: h.id,
        module: "travel",
        title: h.hotelName,
        subtitle: `${h.address ?? ""} · ${h.checkIn} → ${h.checkOut}`,
        url: "/travel",
      });
    }
    const places = getPlaces();
    for (const p of places) {
      results.push({
        id: p.id,
        module: "travel",
        title: p.name,
        subtitle: `${p.type}${p.notes ? ` · ${p.notes}` : ""}`,
        url: "/travel",
      });
    }
  } catch {}

  // Family
  try {
    for (const m of getMembers()) {
      results.push({
        id: m.id,
        module: "family",
        title: m.name,
        subtitle: `${m.role} · ${m.email ?? m.phone ?? ""}`,
        url: "/family",
      });
    }
    for (const c of getChores()) {
      results.push({
        id: c.id,
        module: "family",
        title: c.name,
        subtitle: `Chore · Due ${c.dueDate} · ${c.priority}`,
        url: "/family",
      });
    }
    for (const ec of getContacts()) {
      results.push({
        id: ec.id,
        module: "family",
        title: ec.name,
        subtitle: `${ec.relationship} · ${ec.phone}`,
        url: "/family",
      });
    }
    for (const pet of getPets()) {
      results.push({
        id: pet.id,
        module: "family",
        title: pet.name,
        subtitle: `${pet.type} · ${pet.breed}${pet.age ? ` · ${pet.age} yrs` : ""}`,
        url: "/family",
      });
    }
  } catch {}

  return results;
}

function searchIndex(results: SearchResult[], query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return results.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q)
  );
}

function groupResults(results: SearchResult[]): Map<ModuleId, SearchResult[]> {
  const groups = new Map<ModuleId, SearchResult[]>();
  for (const r of results) {
    const list = groups.get(r.module) ?? [];
    list.push(r);
    groups.set(r.module, list);
  }
  return groups;
}

// ── Recent Searches ─────────────────────────────────────
function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

function addRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return loadRecentSearches();
  const existing = loadRecentSearches().filter((s) => s !== trimmed);
  const next = [trimmed, ...existing].slice(0, MAX_RECENT);
  saveRecentSearches(next);
  return next;
}

function clearRecentSearches(): void {
  saveRecentSearches([]);
}

// ── Component ────────────────────────────────────────────
function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Build index once (lazily)
  const index = useMemo(() => {
    if (typeof window === "undefined") return [] as SearchResult[];
    return buildSearchIndex();
  }, []);

  // Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Search
  const allResults = useMemo(() => searchIndex(index, debouncedQuery), [index, debouncedQuery]);
  const grouped = useMemo(() => groupResults(allResults), [allResults]);
  const totalResults = allResults.length;
  const hasQuery = debouncedQuery.trim().length > 0;

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      const next = addRecentSearch(q);
      setRecentSearches(next);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      const next = addRecentSearch(query);
      setRecentSearches(next);
    }
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
          Smart Search
        </h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Search across your entire life — documents, calendar, finances, and more.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center rounded-2xl border-2 bg-white shadow-lg transition-all duration-200 focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/20 dark:bg-surface-900 border-surface-200 dark:border-surface-700">
          <div className="flex size-12 items-center justify-center pl-3">
            <Sparkles className="size-5 text-accent-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search LifeOS... (⌘K)"
            className="flex-1 bg-transparent py-4 pr-4 text-base text-surface-900 placeholder-surface-400 outline-none dark:text-surface-100"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={handleClear}
              className="mr-3 flex size-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <X className="size-4" />
            </button>
          )}
          <div className="mr-4 hidden rounded-md border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-400 dark:border-surface-700 dark:bg-surface-800 sm:block">
            ⌘K
          </div>
        </div>
      </div>

      {/* Suggested Searches (before typing) */}
      {!hasQuery && recentSearches.length === 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Try searching
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="rounded-full border border-surface-200 bg-white px-4 py-2 text-sm text-surface-600 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-accent-700 dark:hover:bg-accent-900/30 dark:hover:text-accent-400"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!hasQuery && recentSearches.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
              Recent searches
            </p>
            <button
              onClick={() => {
                clearRecentSearches();
                setRecentSearches([]);
              }}
              className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-600 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-accent-700 dark:hover:bg-accent-900/30 dark:hover:text-accent-400"
              >
                <Clock className="size-3" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Searches with Recents */}
      {!hasQuery && recentSearches.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Suggested
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.filter((s) => !recentSearches.includes(s)).map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="rounded-full border border-surface-200 bg-white px-4 py-2 text-sm text-surface-600 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-accent-700 dark:hover:bg-accent-900/30 dark:hover:text-accent-400"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasQuery && (
        <>
          {/* Summary */}
          <p className="mb-4 text-sm text-surface-400">
            {totalResults > 0
              ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${debouncedQuery}"`
              : `No results for "${debouncedQuery}"`}
          </p>

          {/* Result Groups */}
          {[...grouped.entries()].map(([moduleId, items]) => {
            const cfg = MODULE_MAP[moduleId];
            const Icon = cfg.icon;
            return (
              <div key={moduleId} className="mb-6">
                {/* Section Header */}
                <div className="mb-3 flex items-center gap-2">
                  <div className={`flex size-7 items-center justify-center rounded-lg ${cfg.color.split(" ").slice(1).join(" ")}`}>
                    <Icon className="size-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    {cfg.label}
                  </h3>
                  <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-400 dark:bg-surface-800">
                    {items.length}
                  </span>
                </div>

                {/* Results */}
                <div className="space-y-1">
                  {items.slice(0, 10).map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-surface-400">
                          {item.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-surface-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-surface-600" />
                    </a>
                  ))}
                  {items.length > 10 && (
                    <div className="px-3 py-1">
                      <a
                        href={items[0]?.url ?? "#"}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
                      >
                        Show all {items.length} results <ArrowRight className="size-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* No Results */}
          {totalResults === 0 && (
            <div className="rounded-2xl border border-surface-200 bg-white p-10 text-center dark:border-surface-800 dark:bg-surface-900">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-500 dark:bg-accent-900/30 dark:text-accent-400">
                <Search className="size-7" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                No results found
              </h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                Try a different search term, or ask your AI assistant.
              </p>
              <a
                href="/ai"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600"
              >
                <Sparkles className="size-4" />
                Ask your AI assistant about "{debouncedQuery}"
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
