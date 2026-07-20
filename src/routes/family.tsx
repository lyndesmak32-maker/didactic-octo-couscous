import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  Users,
  Calendar,
  ShoppingCart,
  CheckSquare,
  DollarSign,
  Phone,
  PawPrint,
  Plane,
  Plus,
  X,
  Check,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  Star,
  MapPin,
} from "lucide-react";
import type {
  FamilyMember,
  FamilyRole,
  Chore,
  ChorePriority,
  EmergencyContact,
  Pet,
  VaccinationRecord,
  FamilyExpense,
  FamilyExpenseCategory,
} from "~/types/family";
import {
  FAMILY_ROLES,
  FAMILY_EXPENSE_CATEGORIES,
  CHORE_PRIORITY_LABELS,
  MEMBER_COLORS,
} from "~/types/family";
import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
  getChores,
  getChoresForWeek,
  addChore,
  updateChore,
  toggleChore,
  deleteChore,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getPets,
  addPet,
  updatePet,
  deletePet,
  addVaccination,
  deleteVaccination,
  getExpenses,
  addExpense,
  deleteExpense,
  getBalances,
} from "~/data/family";
import { getTrips } from "~/data/travel";
import { getGroceryLists } from "~/data/shopping";

export const Route = createFileRoute("/family")({ component: FamilyPage });

type SectionId = "members" | "calendar" | "grocery" | "chores" | "spending" | "contacts" | "pets" | "vacation";

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "members", label: "Profiles", icon: <Users className="size-3.5" /> },
  { id: "calendar", label: "Calendar", icon: <Calendar className="size-3.5" /> },
  { id: "grocery", label: "Groceries", icon: <ShoppingCart className="size-3.5" /> },
  { id: "chores", label: "Chores", icon: <CheckSquare className="size-3.5" /> },
  { id: "spending", label: "Spending", icon: <DollarSign className="size-3.5" /> },
  { id: "contacts", label: "Contacts", icon: <Phone className="size-3.5" /> },
  { id: "pets", label: "Pets", icon: <PawPrint className="size-3.5" /> },
  { id: "vacation", label: "Vacation", icon: <Plane className="size-3.5" /> },
];

// ── Helpers ────────────────────────────────────────────────
const AVATAR_OPTIONS = ["👨‍💼", "👩‍💼", "👨", "👩", "🧒", "👧", "👶", "👵", "👴", "🧑", "👩‍🦰", "👨‍🦰", "👩‍🦳", "👨‍🦳", "🧔", "👱‍♀️", "👱‍♂️"];

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0 && diff > -7) return `${Math.abs(diff)}d ago`;
  if (diff > 0 && diff < 7) return `in ${diff}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Modal Wrapper ──────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-xl dark:border-surface-700 dark:bg-surface-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Section Wrapper ────────────────────────────────────────
function Section({ id, title, accent, action, children }: { id: SectionId; title: string; accent: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-8 items-center justify-center rounded-lg ${accent}`}>
            {SECTIONS.find((s) => s.id === id)?.icon}
          </div>
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// ── Badge ──────────────────────────────────────────────────
function Badge({ children, color = "neutral" }: { children: React.ReactNode; color?: "amber" | "green" | "red" | "neutral" | "blue" | "violet" }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    neutral: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────
function FamilyPage() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const members = useMemo(() => getMembers(), [tick]);
  const chores = useMemo(() => getChores(), [tick]);
  const weekChores = useMemo(() => getChoresForWeek(), [tick]);
  const contacts = useMemo(() => getContacts(), [tick]);
  const pets = useMemo(() => getPets(), [tick]);
  const expenses = useMemo(() => getExpenses(), [tick]);
  const balances = useMemo(() => getBalances(), [tick]);
  const trips = useMemo(() => {
    try { return getTrips().filter((t: any) => t.status === "upcoming" || t.status === "active"); } catch { return []; }
  }, [tick]);
  const groceryLists = useMemo(() => {
    try { return getGroceryLists().filter((l: any) => l.shared); } catch { return []; }
  }, [tick]);

  // ── Modal state ──────────────────────────────────────────
  const [modal, setModal] = useState<{
    type: "member" | "chore" | "contact" | "pet" | "vax" | "expense";
    editing?: string;
    petId?: string;
  } | null>(null);

  const closeModal = useCallback(() => setModal(null), []);

  // ── Computed totals ──────────────────────────────────────
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const completedChores = useMemo(() => weekChores.filter((c) => c.completed).length, [weekChores]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <Users className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">
              Family Hub
            </h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              Shared calendars, lists, chores, and family coordination.
            </p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <p className="text-xs text-surface-500 dark:text-surface-400">Family</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{members.length}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <p className="text-xs text-surface-500 dark:text-surface-400">Week Chores</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{completedChores}/{weekChores.length}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <p className="text-xs text-surface-500 dark:text-surface-400">Month Spend</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-100">${totalSpent.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <p className="text-xs text-surface-500 dark:text-surface-400">Pets</p>
          <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{pets.length}</p>
        </div>
      </div>

      {/* Section navigation pills */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors"
          >
            {s.icon}
            {s.label}
          </a>
        ))}
      </div>

      {/* ── Sections ───────────────────────────────────────── */}
      <div className="space-y-5">
        {/* 1. Family Profiles */}
        <Section
          id="members"
          title="Family Members"
          accent="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
          action={
            <button onClick={() => setModal({ type: "member" })} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              <Plus className="size-3.5" /> Add
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-surface-100 bg-surface-50 p-3 dark:border-surface-800 dark:bg-surface-800/50">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: m.color + "20" }}>
                  {m.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-surface-900 dark:text-surface-100">{m.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{m.role}</p>
                  {m.birthday && <p className="text-xs text-surface-400 dark:text-surface-500">🎂 {formatDate(m.birthday)}</p>}
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => setModal({ type: "member", editing: m.id })} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-surface-300">
                    <Edit3 className="size-3.5" />
                  </button>
                  <button onClick={() => { if (confirm(`Remove ${m.name}?`)) { deleteMember(m.id); refresh(); } }} className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Shared Calendar */}
        <Section id="calendar" title="Shared Calendar" accent="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
          <p className="mb-3 text-sm text-surface-500 dark:text-surface-400">Toggle to show/hide family member calendars. Upcoming events are shown below.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {members.map((m) => (
              <label key={m.id} className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 cursor-pointer dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800">
                <span className="size-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.name}</span>
                <input type="checkbox" defaultChecked className="sr-only" />
              </label>
            ))}
          </div>
          <div className="rounded-xl border border-surface-100 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">This Week</p>
              <Link to="/calendar" className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">Open Calendar →</Link>
            </div>
            <div className="space-y-2">
              {[
                { day: "Mon", event: "Taylor's soccer practice", time: "4:00 PM" },
                { day: "Wed", event: "Family dinner", time: "6:30 PM" },
                { day: "Fri", event: "Casey's piano recital", time: "5:00 PM" },
                { day: "Sat", event: "Park cleanup (volunteer)", time: "9:00 AM" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 dark:bg-surface-900">
                  <span className="shrink-0 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">{e.day}</span>
                  <span className="flex-1 truncate text-sm text-surface-700 dark:text-surface-300">{e.event}</span>
                  <span className="shrink-0 text-xs text-surface-400">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 3. Shared Grocery Lists */}
        <Section id="grocery" title="Shared Grocery Lists" accent="bg-lime-100 text-lime-600 dark:bg-lime-900/40 dark:text-lime-400">
          {groceryLists.length > 0 ? (
            <div className="space-y-3">
              {groceryLists.map((list: any) => (
                <div key={list.id} className="rounded-xl border border-surface-100 bg-surface-50 p-3 dark:border-surface-800 dark:bg-surface-800/50">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{list.name}</p>
                    <span className="text-xs text-surface-400">{list.items.filter((i: any) => !i.checked).length} items left</span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {list.items.filter((i: any) => !i.checked).slice(0, 5).map((item: any) => (
                      <span key={item.id} className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs text-surface-600 dark:bg-surface-900 dark:text-surface-400">{item.name}</span>
                    ))}
                    {list.items.filter((i: any) => !i.checked).length > 5 && (
                      <span className="text-xs text-surface-400">+{list.items.filter((i: any) => !i.checked).length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 dark:text-surface-500">No shared grocery lists yet.</p>
          )}
          <Link to="/shopping" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">
            View all shopping lists →
          </Link>
        </Section>

        {/* 4. Chore Tracking */}
        <Section
          id="chores"
          title="Chore Tracking"
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
          action={
            <button onClick={() => setModal({ type: "chore" })} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              <Plus className="size-3.5" /> Add
            </button>
          }
        >
          <p className="mb-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            This Week ({completedChores}/{weekChores.length} done)
          </p>
          {weekChores.length === 0 ? (
            <p className="text-sm text-surface-400 dark:text-surface-500">No chores this week.</p>
          ) : (
            <div className="space-y-1.5">
              {weekChores.map((c) => {
                const assignee = members.find((m) => m.id === c.assignedTo);
                const isOverdue = c.dueDate < todayStr() && !c.completed;
                return (
                  <div key={c.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    c.completed
                      ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                      : isOverdue
                        ? "border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
                        : "border-surface-100 bg-white dark:border-surface-800 dark:bg-surface-900"
                  }`}>
                    <button onClick={() => { toggleChore(c.id); refresh(); }} className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      c.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-surface-300 hover:border-amber-400 dark:border-surface-600"
                    }`}>
                      {c.completed && <Check className="size-3" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${c.completed ? "text-surface-400 line-through dark:text-surface-500" : "text-surface-900 dark:text-surface-100"}`}>
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {assignee && <span className="text-xs text-surface-400">{assignee.avatar} {assignee.name}</span>}
                        <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-surface-400"}`}>
                          {isOverdue ? <AlertCircle className="inline size-3 mr-0.5" /> : <Clock className="inline size-3 mr-0.5" />}
                          {formatDate(c.dueDate)}
                        </span>
                        {c.recurring && <Badge color="violet">{c.recurring}</Badge>}
                        <Badge color={c.priority === "high" ? "red" : c.priority === "medium" ? "amber" : "neutral"}>{CHORE_PRIORITY_LABELS[c.priority]}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <button onClick={() => setModal({ type: "chore", editing: c.id })} className="rounded-lg p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                        <Edit3 className="size-3" />
                      </button>
                      <button onClick={() => { deleteChore(c.id); refresh(); }} className="rounded-lg p-1 text-surface-400 hover:text-red-500">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* 5. Family Spending */}
        <Section
          id="spending"
          title="Family Spending"
          accent="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400"
          action={
            <button onClick={() => setModal({ type: "expense" })} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              <Plus className="size-3.5" /> Add
            </button>
          }
        >
          {/* Balance overview */}
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {members.map((m) => {
              const bal = balances[m.id] || 0;
              return (
                <div key={m.id} className="rounded-lg border border-surface-100 bg-surface-50 p-2 text-center dark:border-surface-800 dark:bg-surface-800/50">
                  <span className="text-lg">{m.avatar}</span>
                  <p className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">{m.name}</p>
                  <p className={`text-xs font-semibold ${bal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {bal >= 0 ? "+" : ""}{bal.toFixed(0)}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mb-2 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            Recent Transactions (${totalSpent.toFixed(2)} total)
          </p>
          {expenses.length === 0 ? (
            <p className="text-sm text-surface-400">No expenses yet.</p>
          ) : (
            <div className="space-y-1.5">
              {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((e) => {
                const payer = members.find((m) => m.id === e.paidBy);
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-lg border border-surface-100 bg-white px-3 py-2 dark:border-surface-800 dark:bg-surface-900">
                    <span className="shrink-0 text-lg">{payer?.avatar || "💳"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">{e.description}</p>
                      <p className="text-xs text-surface-400">{formatDate(e.date)} · {e.category} · {payer?.name}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-red-500">-${e.amount.toFixed(2)}</span>
                    <button onClick={() => { deleteExpense(e.id); refresh(); }} className="rounded p-1 text-surface-400 hover:text-red-500">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* 6. Emergency Contacts */}
        <Section
          id="contacts"
          title="Emergency Contacts"
          accent="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
          action={
            <button onClick={() => setModal({ type: "contact" })} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              <Plus className="size-3.5" /> Add
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-xl border border-surface-100 bg-surface-50 p-3 dark:border-surface-800 dark:bg-surface-800/50">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 text-sm font-bold">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{c.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{c.relationship}</p>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{c.phone}</p>
                  {c.email && <p className="text-xs text-surface-400">{c.email}</p>}
                  {c.notes && <p className="mt-1 text-xs text-surface-400">{c.notes}</p>}
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => setModal({ type: "contact", editing: c.id })} className="rounded-lg p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                    <Edit3 className="size-3" />
                  </button>
                  <button onClick={() => { if (confirm(`Remove ${c.name}?`)) { deleteContact(c.id); refresh(); } }} className="rounded-lg p-1 text-surface-400 hover:text-red-500">
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 7. Pet Information */}
        <Section
          id="pets"
          title="Pet Information"
          accent="bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
          action={
            <button onClick={() => setModal({ type: "pet" })} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
              <Plus className="size-3.5" /> Add
            </button>
          }
        >
          <div className="space-y-4">
            {pets.map((p) => (
              <div key={p.id} className="rounded-xl border border-surface-100 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.type === "Dog" ? "🐕" : p.type === "Cat" ? "🐱" : p.type === "Fish" ? "🐠" : "🐾"}</span>
                    <div>
                      <p className="text-base font-semibold text-surface-900 dark:text-surface-100">{p.name}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{p.breed} · {p.age ? `${p.age} yrs` : "Age unknown"}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => setModal({ type: "pet", editing: p.id })} className="rounded-lg p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                      <Edit3 className="size-3.5" />
                    </button>
                    <button onClick={() => { if (confirm(`Remove ${p.name}?`)) { deletePet(p.id); refresh(); } }} className="rounded-lg p-1 text-surface-400 hover:text-red-500">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {(p.vetName || p.notes) && (
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    {p.vetName && (
                      <div className="rounded-lg bg-white px-3 py-2 dark:bg-surface-900">
                        <p className="text-xs text-surface-400">Veterinarian</p>
                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{p.vetName}</p>
                        {p.vetPhone && <p className="text-xs text-amber-600 dark:text-amber-400">{p.vetPhone}</p>}
                      </div>
                    )}
                    {p.notes && (
                      <div className="rounded-lg bg-white px-3 py-2 dark:bg-surface-900">
                        <p className="text-xs text-surface-400">Notes</p>
                        <p className="text-sm text-surface-700 dark:text-surface-300">{p.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vaccinations */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Vaccinations</p>
                  <button onClick={() => setModal({ type: "vax", petId: p.id })} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20">
                    <Plus className="size-3" /> Add
                  </button>
                </div>
                {p.vaccinations.length === 0 ? (
                  <p className="text-xs text-surface-400 italic">No vaccination records.</p>
                ) : (
                  <div className="space-y-1">
                    {p.vaccinations.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-md bg-white px-3 py-1.5 dark:bg-surface-900">
                        <div>
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{v.type}</span>
                          <span className="ml-2 text-xs text-surface-400">{formatDate(v.date)}</span>
                        </div>
                        <button onClick={() => { deleteVaccination(p.id, v.id); refresh(); }} className="rounded p-0.5 text-surface-400 hover:text-red-500">
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 8. Vacation Coordination */}
        <Section id="vacation" title="Vacation Coordination" accent="bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
          {trips.length > 0 ? (
            <div className="space-y-3">
              {trips.map((trip: any) => (
                <div key={trip.id} className="flex items-center gap-4 rounded-xl border border-surface-100 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800/50">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400 text-xl">
                    {trip.image || "✈️"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{trip.destination}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge color={trip.status === "active" ? "green" : "amber"}>{trip.status}</Badge>
                      <span className="text-xs text-surface-400">Budget: ${trip.budget} · Spent: ${trip.spent}</span>
                    </div>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, (trip.spent / trip.budget) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 dark:text-surface-500">No upcoming trips. Start planning your next family adventure!</p>
          )}
          <Link to="/travel" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">
            Open Travel module →
          </Link>
        </Section>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {modal?.type === "member" && (
        <MemberModal
          open={true}
          onClose={closeModal}
          editingId={modal.editing}
          members={members}
          refresh={refresh}
        />
      )}
      {modal?.type === "chore" && (
        <ChoreModal
          open={true}
          onClose={closeModal}
          editingId={modal.editing}
          members={members}
          chores={chores}
          refresh={refresh}
        />
      )}
      {modal?.type === "contact" && (
        <ContactModal
          open={true}
          onClose={closeModal}
          editingId={modal.editing}
          contacts={contacts}
          refresh={refresh}
        />
      )}
      {modal?.type === "pet" && (
        <PetModal
          open={true}
          onClose={closeModal}
          editingId={modal.editing}
          pets={pets}
          refresh={refresh}
        />
      )}
      {modal?.type === "vax" && modal.petId && (
        <VaxModal
          open={true}
          onClose={closeModal}
          petId={modal.petId}
          refresh={refresh}
        />
      )}
      {modal?.type === "expense" && (
        <ExpenseModal
          open={true}
          onClose={closeModal}
          members={members}
          refresh={refresh}
        />
      )}
    </div>
  );
}

// ── Member Modal ─────────────────────────────────────────
function MemberModal({ open, onClose, editingId, members, refresh }: {
  open: boolean; onClose: () => void; editingId?: string; members: FamilyMember[]; refresh: () => void;
}) {
  const existing = editingId ? members.find((m) => m.id === editingId) : null;
  const [name, setName] = useState(existing?.name || "");
  const [role, setRole] = useState<FamilyRole>(existing?.role || "Parent");
  const [avatar, setAvatar] = useState(existing?.avatar || "👨‍💼");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [birthday, setBirthday] = useState(existing?.birthday || "");
  const [color, setColor] = useState(existing?.color || MEMBER_COLORS[members.length % MEMBER_COLORS.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      updateMember(editingId, { name, role, avatar, email: email || undefined, phone: phone || undefined, birthday: birthday || undefined, color });
    } else {
      addMember({ name, role, avatar, email: email || undefined, phone: phone || undefined, birthday: birthday || undefined, color });
    }
    refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Member" : "Add Family Member"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Avatar</label>
          <div className="flex flex-wrap gap-1.5">
            {AVATAR_OPTIONS.map((a) => (
              <button key={a} type="button" onClick={() => setAvatar(a)} className={`size-9 rounded-lg text-lg flex items-center justify-center transition-colors ${avatar === a ? "bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-900/40" : "bg-surface-50 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700"}`}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 dark:placeholder-surface-500" placeholder="Member name" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as FamilyRole)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
            {FAMILY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="email@family.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="555-0100" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Birthday</label>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Color</label>
            <div className="flex gap-1.5 pt-1">
              {MEMBER_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`size-7 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-1 ring-amber-400 scale-110" : "hover:scale-105"}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
            {editingId ? "Save Changes" : "Add Member"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Chore Modal ──────────────────────────────────────────
function ChoreModal({ open, onClose, editingId, members, chores, refresh }: {
  open: boolean; onClose: () => void; editingId?: string; members: FamilyMember[]; chores: Chore[]; refresh: () => void;
}) {
  const existing = editingId ? chores.find((c) => c.id === editingId) : null;
  const [name, setName] = useState(existing?.name || "");
  const [assignedTo, setAssignedTo] = useState(existing?.assignedTo || members[0]?.id || "");
  const [dueDate, setDueDate] = useState(existing?.dueDate || todayStr());
  const [priority, setPriority] = useState<ChorePriority>(existing?.priority || "medium");
  const [recurring, setRecurring] = useState<string>(existing?.recurring || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      updateChore(editingId, { name, assignedTo, dueDate, priority, recurring: (recurring as any) || undefined });
    } else {
      addChore({ name, assignedTo, dueDate, completed: false, priority, recurring: (recurring as any) || undefined });
    }
    refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Chore" : "Add Chore"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Task Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. Take out trash" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Assign To</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              {members.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as ChorePriority)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Recurring</label>
            <select value={recurring} onChange={(e) => setRecurring(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
            {editingId ? "Save Changes" : "Add Chore"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Contact Modal ────────────────────────────────────────
function ContactModal({ open, onClose, editingId, contacts, refresh }: {
  open: boolean; onClose: () => void; editingId?: string; contacts: EmergencyContact[]; refresh: () => void;
}) {
  const existing = editingId ? contacts.find((c) => c.id === editingId) : null;
  const [name, setName] = useState(existing?.name || "");
  const [relationship, setRelationship] = useState(existing?.relationship || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [notes, setNotes] = useState(existing?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (editingId) {
      updateContact(editingId, { name, relationship, phone, email: email || undefined, notes: notes || undefined });
    } else {
      addContact({ name, relationship, phone, email: email || undefined, notes: notes || undefined });
    }
    refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Contact" : "Add Emergency Contact"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="Contact name" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Relationship</label>
          <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. Family Doctor, Neighbor" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="555-0200" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="contact@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 resize-none" placeholder="Additional notes..." />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
            {editingId ? "Save Changes" : "Add Contact"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Pet Modal ────────────────────────────────────────────
function PetModal({ open, onClose, editingId, pets, refresh }: {
  open: boolean; onClose: () => void; editingId?: string; pets: Pet[]; refresh: () => void;
}) {
  const existing = editingId ? pets.find((p) => p.id === editingId) : null;
  const [name, setName] = useState(existing?.name || "");
  const [type, setType] = useState(existing?.type || "Dog");
  const [breed, setBreed] = useState(existing?.breed || "");
  const [age, setAge] = useState(existing?.age?.toString() || "");
  const [vetName, setVetName] = useState(existing?.vetName || "");
  const [vetPhone, setVetPhone] = useState(existing?.vetPhone || "");
  const [notes, setNotes] = useState(existing?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type.trim()) return;
    if (editingId) {
      updatePet(editingId, { name, type, breed, age: age ? parseInt(age) : undefined, vetName: vetName || undefined, vetPhone: vetPhone || undefined, notes: notes || undefined });
    } else {
      addPet({ name, type, breed, age: age ? parseInt(age) : undefined, vetName: vetName || undefined, vetPhone: vetPhone || undefined, notes: notes || undefined, vaccinations: [] });
    }
    refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Pet" : "Add Pet"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="Pet name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              {["Dog", "Cat", "Bird", "Fish", "Hamster", "Rabbit", "Reptile", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Breed</label>
            <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. Golden Retriever" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Age (years)</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. 3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vet Name</label>
            <input type="text" value={vetName} onChange={(e) => setVetName(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="Dr. ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vet Phone</label>
            <input type="text" value={vetPhone} onChange={(e) => setVetPhone(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="555-..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 resize-none" placeholder="e.g. Allergic to chicken, indoor only..." />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
            {editingId ? "Save Changes" : "Add Pet"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Vaccination Modal ─────────────────────────────────────
function VaxModal({ open, onClose, petId, refresh }: {
  open: boolean; onClose: () => void; petId: string; refresh: () => void;
}) {
  const [type, setType] = useState("");
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type.trim()) return;
    addVaccination(petId, { type, date, notes: notes || undefined });
    refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Vaccination Record">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vaccine Type</label>
          <input type="text" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. Rabies, DHPP" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. 3-year vaccine" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
            Add Vaccination
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Expense Modal ─────────────────────────────────────────
function ExpenseModal({ open, onClose, members, refresh }: {
  open: boolean; onClose: () => void; members: FamilyMember[]; refresh: () => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.id || "");
  const [category, setCategory] = useState<FamilyExpenseCategory>("Groceries");
  const [date, setDate] = useState(todayStr());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    addExpense({ description, amount: parseFloat(amount), paidBy, category, date });
    refresh();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Family Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="e.g. Weekly groceries" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Amount ($)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" placeholder="0.00" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Paid By</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              {members.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as FamilyExpenseCategory)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100">
              {FAMILY_EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-amber-400 focus:outline-none dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" required />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
            Add Expense
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
