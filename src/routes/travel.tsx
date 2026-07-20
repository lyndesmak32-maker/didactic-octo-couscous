import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Globe, Plus, Trash2, Edit3, Plane, Hotel, CheckCircle2, Circle,
  MapPin, Package, FileText, Wallet, ArrowRightLeft, Calendar,
  ChevronDown, ChevronRight, X, Clock, Search, UtensilsCrossed,
  ShoppingBag, Bus, Building2, Ticket, Shield, File, Timer
} from "lucide-react";
import type {
  Trip, TripStatus, Flight, FlightStatus, HotelReservation,
  PackingItem, PackingCategory, TravelDocument, DocumentType,
  ExpenseEntry, ExpenseCategory, Place, PlaceType,
} from "~/types/travel";
import {
  FLIGHT_STATUS_COLORS, PACKING_CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS, EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS,
  PLACE_TYPE_LABELS, SUPPORTED_CURRENCIES,
} from "~/types/travel";
import {
  getTrips, addTrip, updateTrip, deleteTrip, getDaysUntil,
  getFlights, addFlight, updateFlight, deleteFlight,
  getHotels, addHotel, updateHotel, deleteHotel,
  getPackingItems, addPackingItem, togglePackingItem, deletePackingItem,
  getDocuments, addDocument, updateDocument, deleteDocument,
  getExpenses, addExpense, updateExpense, deleteExpense, getExpensesByCategory,
  getPlaces, addPlace, togglePlace, updatePlace, deletePlace,
} from "~/data/travel";

export const Route = createFileRoute("/travel")({ component: TravelPage });

// ── Tab type ────────────────────────────────────────────
type Tab = "trips" | "flights" | "hotels" | "packing" | "budget" | "places" | "docs" | "currency";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "trips", label: "Trips", icon: <Globe className="size-4" /> },
  { id: "flights", label: "Flights", icon: <Plane className="size-4" /> },
  { id: "hotels", label: "Hotels", icon: <Hotel className="size-4" /> },
  { id: "packing", label: "Packing", icon: <Package className="size-4" /> },
  { id: "budget", label: "Budget", icon: <Wallet className="size-4" /> },
  { id: "places", label: "Places", icon: <MapPin className="size-4" /> },
  { id: "docs", label: "Docs", icon: <FileText className="size-4" /> },
  { id: "currency", label: "Currency", icon: <ArrowRightLeft className="size-4" /> },
];

// ── Status badge helper ─────────────────────────────────
function StatusBadge({ status }: { status: TripStatus }) {
  const colors: Record<TripStatus, string> = {
    upcoming: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    past: "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function FlightStatusBadge({ status }: { status: FlightStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${FLIGHT_STATUS_COLORS[status]}`}>
      {status === "on-time" ? "On Time" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Countdown ───────────────────────────────────────────
function Countdown({ date }: { date: string }) {
  const days = getDaysUntil(date);
  if (days < 0) return <span className="text-xs text-surface-400">Past</span>;
  if (days === 0) return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Today!</span>;
  return (
    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
      {days}d to go
    </span>
  );
}

// ── Modal ───────────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-900 dark:border dark:border-surface-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Form field helper ───────────────────────────────────
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function inputClasses() {
  return "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 transition-colors";
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
function TravelPage() {
  const [activeTab, setActiveTab] = useState<Tab>("trips");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Read from store
  const trips = useMemo(() => getTrips(), [tick]);
  const allFlights = useMemo(() => getFlights(), [tick]);
  const allHotels = useMemo(() => getHotels(), [tick]);
  const allDocs = useMemo(() => getDocuments(), [tick]);
  const allExpenses = useMemo(() => getExpenses(), [tick]);
  const allPlaces = useMemo(() => getPlaces(), [tick]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
            <Globe className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">Travel</h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">Trip planning, flights, packing, and travel management.</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
                : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "trips" && <TripsTab trips={trips} refresh={refresh} />}
      {activeTab === "flights" && <FlightsTab trips={trips} flights={allFlights} refresh={refresh} />}
      {activeTab === "hotels" && <HotelsTab trips={trips} hotels={allHotels} refresh={refresh} />}
      {activeTab === "packing" && <PackingTab trips={trips} refresh={refresh} />}
      {activeTab === "budget" && <BudgetTab trips={trips} expenses={allExpenses} refresh={refresh} />}
      {activeTab === "places" && <PlacesTab trips={trips} places={allPlaces} refresh={refresh} />}
      {activeTab === "docs" && <DocsTab trips={trips} documents={allDocs} refresh={refresh} />}
      {activeTab === "currency" && <CurrencyTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRIPS TAB
// ═══════════════════════════════════════════════════════════
function TripsTab({ trips, refresh }: { trips: Trip[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const upcomingTrips = trips.filter((t) => t.status !== "past");
  const pastTrips = trips.filter((t) => t.status === "past");

  return (
    <div className="space-y-6">
      {/* Add Trip Button */}
      <button
        onClick={() => setShowAdd(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
      >
        <Plus className="size-4" /> Add Trip
      </button>

      {/* Upcoming / Active Trips */}
      {upcomingTrips.length === 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-500 dark:bg-teal-950/40 dark:text-teal-400">
            <Globe className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">No trips yet</h3>
          <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">Add your first trip to start planning flights, hotels, packing lists, and more.</p>
        </div>
      )}

      {upcomingTrips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          expanded={expandedTrip === trip.id}
          onToggle={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
          onEdit={() => setEditingTrip(trip)}
          onDelete={() => { deleteTrip(trip.id); refresh(); }}
          refresh={refresh}
        />
      ))}

      {/* Past Trips */}
      {pastTrips.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mt-8">Past Trips</h3>
          {pastTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              expanded={expandedTrip === trip.id}
              onToggle={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
              onEdit={() => setEditingTrip(trip)}
              onDelete={() => { deleteTrip(trip.id); refresh(); }}
              refresh={refresh}
            />
          ))}
        </>
      )}

      {/* Add / Edit Trip Modal */}
      <TripFormModal
        open={showAdd || editingTrip !== null}
        onClose={() => { setShowAdd(false); setEditingTrip(null); }}
        trip={editingTrip}
        onSave={(data) => {
          if (editingTrip) {
            updateTrip(editingTrip.id, data);
          } else {
            addTrip(data);
          }
          setShowAdd(false);
          setEditingTrip(null);
          refresh();
        }}
      />
    </div>
  );
}

function TripCard({ trip, expanded, onToggle, onEdit, onDelete, refresh }: {
  trip: Trip; expanded: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void; refresh: () => void;
}) {
  const budgetPercent = trip.budget > 0 ? Math.min(100, Math.round((trip.spent / trip.budget) * 100)) : 0;
  const remaining = trip.budget - trip.spent;

  // Destination emoji mapping
  const emojiMap: Record<string, string> = {
    "Tokyo": "🗼", "Paris": "🗼", "New York": "🗽", "London": "💂", "Rome": "🏛️",
  };
  const emoji = Object.entries(emojiMap).find(([k]) => trip.destination.includes(k))?.[1] ?? "🌍";

  return (
    <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 overflow-hidden transition-all">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <button onClick={onToggle} className="flex items-start gap-4 text-left flex-1 min-w-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-2xl dark:bg-teal-950/40">
              {emoji}
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-semibold text-surface-900 dark:text-surface-100 truncate">{trip.destination}</h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-surface-500 dark:text-surface-400">
                  {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <StatusBadge status={trip.status} />
                {trip.status === "upcoming" && <Countdown date={trip.startDate} />}
              </div>
            </div>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
              <Edit3 className="size-4" />
            </button>
            <button onClick={onDelete} className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
              <Trash2 className="size-4" />
            </button>
            <button onClick={onToggle} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
              {expanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
            </button>
          </div>
        </div>

        {/* Budget bar */}
        {trip.budget > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-1.5">
              <span>Budget: ${trip.budget.toLocaleString()}</span>
              <span className={remaining < 0 ? "text-red-500 font-semibold" : ""}>
                {remaining < 0 ? `Over by $${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()} left`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetPercent > 90 ? "bg-red-500" : budgetPercent > 60 ? "bg-amber-500" : "bg-teal-500"}`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        )}

        {trip.notes && <p className="mt-3 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{trip.notes}</p>}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-surface-200 dark:border-surface-800 p-5 space-y-4 bg-surface-50/50 dark:bg-surface-950/30">
          <TripDetailSection
            tripId={trip.id}
            refresh={refresh}
          />
        </div>
      )}
    </div>
  );
}

function TripDetailSection({ tripId, refresh }: { tripId: string; refresh: () => void }) {
  const flights = useMemo(() => getFlights(tripId), [tripId, refresh]);
  const hotels = useMemo(() => getHotels(tripId), [tripId, refresh]);
  const items = useMemo(() => getPackingItems(tripId), [tripId, refresh]);
  const expenses = useMemo(() => getExpenses(tripId), [tripId, refresh]);
  const places = useMemo(() => getPlaces(tripId), [tripId, refresh]);

  const packedCount = items.filter((i) => i.packed).length;
  const placesVisited = places.filter((p) => p.visited).length;
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Flights summary */}
      <DetailCard icon={<Plane className="size-4" />} label="Flights" count={flights.length}>
        {flights.map((f) => (
          <div key={f.id} className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-2">
            <span className="font-medium text-surface-700 dark:text-surface-300">{f.airline} {f.flightNumber}</span>
            <span>{f.departureAirport} → {f.arrivalAirport}</span>
            <FlightStatusBadge status={f.status} />
          </div>
        ))}
      </DetailCard>

      {/* Hotels summary */}
      <DetailCard icon={<Hotel className="size-4" />} label="Hotels" count={hotels.length}>
        {hotels.map((h) => (
          <div key={h.id} className="text-xs text-surface-500 dark:text-surface-400">
            <span className="font-medium text-surface-700 dark:text-surface-300">{h.hotelName}</span>
            <span className="ml-2">{new Date(h.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(h.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        ))}
      </DetailCard>

      {/* Packing summary */}
      <DetailCard icon={<Package className="size-4" />} label="Packing" count={`${packedCount}/${items.length}`}>
        <div className="h-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${items.length > 0 ? (packedCount / items.length) * 100 : 0}%` }} />
        </div>
      </DetailCard>

      {/* Budget summary */}
      <DetailCard icon={<Wallet className="size-4" />} label="Spent" count={`$${totalSpent.toLocaleString()}`}>
        <div className="flex gap-1 flex-wrap">
          {(["transport", "food", "activities", "accommodation"] as ExpenseCategory[]).map((cat) => {
            const amt = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
            if (amt === 0) return null;
            return (
              <span key={cat} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${EXPENSE_CATEGORY_COLORS[cat]}`}>
                {EXPENSE_CATEGORY_LABELS[cat]} ${amt}
              </span>
            );
          })}
        </div>
      </DetailCard>

      {/* Places summary */}
      <DetailCard icon={<MapPin className="size-4" />} label="Places" count={`${placesVisited}/${places.length}`}>
        <div className="flex flex-wrap gap-1">
          {places.slice(0, 5).map((p) => (
            <span key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded ${p.visited ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"}`}>
              {p.name}
            </span>
          ))}
          {places.length > 5 && <span className="text-[10px] text-surface-400">+{places.length - 5} more</span>}
        </div>
      </DetailCard>
    </div>
  );
}

function DetailCard({ icon, label, count, children }: {
  icon: React.ReactNode; label: string; count: string | number; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400">
          {icon} {label}
        </div>
        <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">{count}</span>
      </div>
      {children}
    </div>
  );
}

// ── Trip Form Modal ────────────────────────────────────
function TripFormModal({ open, onClose, trip, onSave }: {
  open: boolean; onClose: () => void; trip: Trip | null; onSave: (data: Omit<Trip, "id" | "spent">) => void;
}) {
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [budget, setBudget] = useState(trip?.budget?.toString() ?? "");
  const [notes, setNotes] = useState(trip?.notes ?? "");

  // Reset form when trip changes
  useEffect(() => {
    setDestination(trip?.destination ?? "");
    setStartDate(trip?.startDate ?? "");
    setEndDate(trip?.endDate ?? "");
    setBudget(trip?.budget?.toString() ?? "");
    setNotes(trip?.notes ?? "");
  }, [trip]);

  const handleSave = () => {
    if (!destination || !startDate || !endDate) return;
    const today = new Date().toISOString().split("T")[0];
    const status: TripStatus = endDate < today ? "past" : startDate <= today ? "active" : "upcoming";
    onSave({
      destination,
      startDate,
      endDate,
      budget: parseFloat(budget) || 0,
      notes: notes || undefined,
      status,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={trip ? "Edit Trip" : "New Trip"}>
      <div className="space-y-4">
        <Field label="Destination" required>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Tokyo, Japan"
            className={inputClasses()}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" required>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses()} />
          </Field>
          <Field label="End Date" required>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClasses()} />
          </Field>
        </div>
        <Field label="Budget ($)">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 3000"
            className={inputClasses()}
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Trip notes, goals, reminders..."
            rows={3}
            className={inputClasses()}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">Save Trip</button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// FLIGHTS TAB
// ═══════════════════════════════════════════════════════════
function FlightsTab({ trips, flights, refresh }: { trips: Trip[]; flights: Flight[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [filterTripId, setFilterTripId] = useState<string>("");

  const filtered = filterTripId ? flights.filter((f) => f.tripId === filterTripId) : flights;

  const tripMap = useMemo(() => {
    const m: Record<string, Trip> = {};
    trips.forEach((t) => (m[t.id] = t));
    return m;
  }, [trips]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Plus className="size-4" /> Add Flight
        </button>
        <select
          value={filterTripId}
          onChange={(e) => setFilterTripId(e.target.value)}
          className={inputClasses() + " w-auto"}
        >
          <option value="">All Trips</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.destination}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 text-center">
          <Plane className="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500 dark:text-surface-400">No flights found. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 p-4 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                <Plane className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-surface-900 dark:text-surface-100">{f.airline} {f.flightNumber}</span>
                  <FlightStatusBadge status={f.status} />
                  {tripMap[f.tripId] && (
                    <span className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 rounded px-1.5 py-0.5">
                      {tripMap[f.tripId].destination}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                  <span className="font-medium">{f.departureAirport}</span>
                  <span>→</span>
                  <span className="font-medium">{f.arrivalAirport}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(f.departureTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span>{new Date(f.departureTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {f.notes && <p className="mt-1 text-xs text-surface-400">{f.notes}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditingFlight(f)} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <Edit3 className="size-4" />
                </button>
                <button onClick={() => { deleteFlight(f.id); refresh(); }} className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FlightFormModal
        open={showAdd || editingFlight !== null}
        onClose={() => { setShowAdd(false); setEditingFlight(null); }}
        flight={editingFlight}
        trips={trips}
        onSave={(data) => {
          if (editingFlight) {
            updateFlight(editingFlight.id, data as Partial<Omit<Flight, "id">>);
          } else {
            addFlight(data as Omit<Flight, "id">);
          }
          setShowAdd(false);
          setEditingFlight(null);
          refresh();
        }}
      />
    </div>
  );
}

function FlightFormModal({ open, onClose, flight, trips, onSave }: {
  open: boolean; onClose: () => void; flight: Flight | null; trips: Trip[];
  onSave: (data: Partial<Flight>) => void;
}) {
  const [tripId, setTripId] = useState(flight?.tripId ?? trips[0]?.id ?? "");
  const [airline, setAirline] = useState(flight?.airline ?? "");
  const [flightNumber, setFlightNumber] = useState(flight?.flightNumber ?? "");
  const [departureAirport, setDepartureAirport] = useState(flight?.departureAirport ?? "");
  const [arrivalAirport, setArrivalAirport] = useState(flight?.arrivalAirport ?? "");
  const [departureTime, setDepartureTime] = useState(flight?.departureTime?.slice(0, 16) ?? "");
  const [arrivalTime, setArrivalTime] = useState(flight?.arrivalTime?.slice(0, 16) ?? "");
  const [status, setStatus] = useState<FlightStatus>(flight?.status ?? "on-time");
  const [notes, setNotes] = useState(flight?.notes ?? "");

  const handleSave = () => {
    if (!tripId || !airline || !flightNumber || !departureAirport || !arrivalAirport || !departureTime || !arrivalTime) return;
    onSave({
      tripId, airline, flightNumber, departureAirport, arrivalAirport,
      departureTime: new Date(departureTime).toISOString(),
      arrivalTime: new Date(arrivalTime).toISOString(),
      status, notes: notes || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={flight ? "Edit Flight" : "Add Flight"}>
      <div className="space-y-4">
        <Field label="Trip" required>
          <select value={tripId} onChange={(e) => setTripId(e.target.value)} className={inputClasses()}>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Airline" required>
            <input type="text" value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="e.g. Delta" className={inputClasses()} />
          </Field>
          <Field label="Flight Number" required>
            <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="e.g. DL402" className={inputClasses()} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From (Airport)" required>
            <input type="text" value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value)} placeholder="e.g. LAX" className={inputClasses()} />
          </Field>
          <Field label="To (Airport)" required>
            <input type="text" value={arrivalAirport} onChange={(e) => setArrivalAirport(e.target.value)} placeholder="e.g. JFK" className={inputClasses()} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Departure" required>
            <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className={inputClasses()} />
          </Field>
          <Field label="Arrival" required>
            <input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className={inputClasses()} />
          </Field>
        </div>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as FlightStatus)} className={inputClasses()}>
            <option value="on-time">On Time</option>
            <option value="delayed">Delayed</option>
            <option value="departed">Departed</option>
            <option value="landed">Landed</option>
          </select>
        </Field>
        <Field label="Notes">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClasses()} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">Save Flight</button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// HOTELS TAB
// ═══════════════════════════════════════════════════════════
function HotelsTab({ trips, hotels, refresh }: { trips: Trip[]; hotels: HotelReservation[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelReservation | null>(null);
  const [filterTripId, setFilterTripId] = useState<string>("");

  const filtered = filterTripId ? hotels.filter((h) => h.tripId === filterTripId) : hotels;
  const tripMap = useMemo(() => {
    const m: Record<string, Trip> = {};
    trips.forEach((t) => (m[t.id] = t));
    return m;
  }, [trips]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors">
          <Plus className="size-4" /> Add Hotel
        </button>
        <select value={filterTripId} onChange={(e) => setFilterTripId(e.target.value)} className={inputClasses() + " w-auto"}>
          <option value="">All Trips</option>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 text-center">
          <Hotel className="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500 dark:text-surface-400">No hotel reservations. Add one to keep track.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((h) => {
            const nights = Math.max(1, Math.round((new Date(h.checkOut).getTime() - new Date(h.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
            return (
              <div key={h.id} className="rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-surface-900 dark:text-surface-100 truncate">{h.hotelName}</h4>
                    {tripMap[h.tripId] && (
                      <span className="text-xs text-teal-600 dark:text-teal-400">{tripMap[h.tripId].destination}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditingHotel(h)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><Edit3 className="size-3.5" /></button>
                    <button onClick={() => { deleteHotel(h.id); refresh(); }} className="rounded-lg p-1 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-surface-500 dark:text-surface-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>{new Date(h.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(h.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ({nights} night{nights > 1 ? "s" : ""})</span>
                  </div>
                  {h.confirmationNumber && (
                    <div className="flex items-center gap-1.5">
                      <Ticket className="size-3.5" />
                      <span className="font-mono text-xs">Conf# {h.confirmationNumber}</span>
                    </div>
                  )}
                  {h.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      <span className="truncate">{h.address}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HotelFormModal
        open={showAdd || editingHotel !== null}
        onClose={() => { setShowAdd(false); setEditingHotel(null); }}
        hotel={editingHotel}
        trips={trips}
        onSave={(data) => {
          if (editingHotel) {
            updateHotel(editingHotel.id, data as Partial<Omit<HotelReservation, "id">>);
          } else {
            addHotel(data as Omit<HotelReservation, "id">);
          }
          setShowAdd(false); setEditingHotel(null); refresh();
        }}
      />
    </div>
  );
}

function HotelFormModal({ open, onClose, hotel, trips, onSave }: {
  open: boolean; onClose: () => void; hotel: HotelReservation | null; trips: Trip[];
  onSave: (data: Partial<HotelReservation>) => void;
}) {
  const [tripId, setTripId] = useState(hotel?.tripId ?? trips[0]?.id ?? "");
  const [hotelName, setHotelName] = useState(hotel?.hotelName ?? "");
  const [checkIn, setCheckIn] = useState(hotel?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(hotel?.checkOut ?? "");
  const [confirmationNumber, setConfirmationNumber] = useState(hotel?.confirmationNumber ?? "");
  const [address, setAddress] = useState(hotel?.address ?? "");
  const [notes, setNotes] = useState(hotel?.notes ?? "");

  const handleSave = () => {
    if (!tripId || !hotelName || !checkIn || !checkOut) return;
    onSave({ tripId, hotelName, checkIn, checkOut, confirmationNumber: confirmationNumber || undefined, address: address || undefined, notes: notes || undefined });
  };

  return (
    <Modal open={open} onClose={onClose} title={hotel ? "Edit Hotel" : "Add Hotel"}>
      <div className="space-y-4">
        <Field label="Trip" required>
          <select value={tripId} onChange={(e) => setTripId(e.target.value)} className={inputClasses()}>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
          </select>
        </Field>
        <Field label="Hotel Name" required>
          <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} className={inputClasses()} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in" required>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClasses()} />
          </Field>
          <Field label="Check-out" required>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClasses()} />
          </Field>
        </div>
        <Field label="Confirmation #">
          <input type="text" value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} className={inputClasses()} />
        </Field>
        <Field label="Address">
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses()} />
        </Field>
        <Field label="Notes">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClasses()} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">Save Hotel</button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// PACKING TAB
// ═══════════════════════════════════════════════════════════
function PackingTab({ trips, refresh }: { trips: Trip[]; refresh: () => void }) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id ?? "");
  const [showAdd, setShowAdd] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>("essentials");

  const items = useMemo(() => getPackingItems(selectedTripId), [selectedTripId, refresh]);
  const packedCount = items.filter((i) => i.packed).length;

  // Group by category
  const grouped = useMemo(() => {
    const g: Record<PackingCategory, PackingItem[]> = { essentials: [], clothing: [], electronics: [], toiletries: [], misc: [] };
    items.forEach((i) => g[i.category].push(i));
    return g;
  }, [items]);

  const handleAdd = () => {
    if (!newItemName.trim() || !selectedTripId) return;
    addPackingItem(selectedTripId, { name: newItemName.trim(), packed: false, category: newItemCategory });
    setNewItemName("");
    setShowAdd(false);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className={inputClasses() + " w-auto"}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
          <Plus className="size-4" /> Add Item
        </button>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.round((packedCount / items.length) * 100)}%` }} />
          </div>
          <span className="text-sm font-medium text-surface-500 dark:text-surface-400">{packedCount}/{items.length}</span>
        </div>
      )}

      {/* Add inline form */}
      {showAdd && (
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800 p-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Item name..."
            className={inputClasses() + " flex-1"}
            autoFocus
          />
          <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)} className={inputClasses() + " w-auto"}>
            {(Object.entries(PACKING_CATEGORY_LABELS) as [PackingCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 text-center">
          <Package className="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500 dark:text-surface-400">No packing items for this trip. Add items to get packing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(grouped) as [PackingCategory, PackingItem[]][]).map(([cat, catItems]) => {
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">{PACKING_CATEGORY_LABELS[cat]}</h4>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group"
                    >
                      <button onClick={() => { togglePackingItem(item.id); refresh(); }} className="shrink-0 text-surface-400 hover:text-teal-500 transition-colors">
                        {item.packed ? <CheckCircle2 className="size-5 text-teal-500" /> : <Circle className="size-5" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.packed ? "line-through text-surface-400" : "text-surface-700 dark:text-surface-300"}`}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => { deletePackingItem(item.id); refresh(); }}
                        className="opacity-0 group-hover:opacity-100 rounded p-1 text-surface-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BUDGET TAB
// ═══════════════════════════════════════════════════════════
function BudgetTab({ trips, expenses, refresh }: { trips: Trip[]; expenses: ExpenseEntry[]; refresh: () => void }) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id ?? "");
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState<ExpenseCategory>("transport");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const trip = trips.find((t) => t.id === selectedTripId);
  const tripExpenses = useMemo(() => expenses.filter((e) => e.tripId === selectedTripId), [expenses, selectedTripId]);
  const totalSpent = tripExpenses.reduce((s, e) => s + e.amount, 0);
  const budget = trip?.budget ?? 0;
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const remaining = budget - totalSpent;

  const byCategory = useMemo(() => getExpensesByCategory(selectedTripId), [selectedTripId, expenses]);

  const handleAddExpense = () => {
    if (!desc.trim() || !amount || !selectedTripId) return;
    addExpense({ tripId: selectedTripId, description: desc.trim(), amount: parseFloat(amount), category: cat, date });
    setDesc(""); setAmount(""); setShowAdd(false);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className={inputClasses() + " w-auto"}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
          <Plus className="size-4" /> Add Expense
        </button>
      </div>

      {/* Budget summary card */}
      {trip && budget > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 p-5">
          <h4 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-3">Budget Overview</h4>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">${totalSpent.toLocaleString()}</span>
            <span className="text-sm text-surface-500 dark:text-surface-400">of ${budget.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetPercent > 90 ? "bg-red-500" : budgetPercent > 60 ? "bg-amber-500" : "bg-teal-500"}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <div className="mt-2 text-sm font-medium text-surface-500 dark:text-surface-400">
            {remaining < 0 ? (
              <span className="text-red-500">Over budget by ${Math.abs(remaining).toLocaleString()}</span>
            ) : (
              <span>${remaining.toLocaleString()} remaining</span>
            )}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {totalSpent > 0 && (
        <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 p-4">
          <h4 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-3">By Category</h4>
          <div className="space-y-2">
            {(Object.entries(byCategory) as [ExpenseCategory, number][]).map(([cat, amt]) => {
              if (amt === 0) return null;
              const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className={`size-2.5 rounded-full ${EXPENSE_CATEGORY_COLORS[cat]}`} />
                  <span className="text-sm text-surface-600 dark:text-surface-400 w-24">{EXPENSE_CATEGORY_LABELS[cat]}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden">
                    <div className={`h-full rounded-full ${EXPENSE_CATEGORY_COLORS[cat]}`} style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300 w-16 text-right">${amt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add expense form */}
      {showAdd && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800 p-3">
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className={inputClasses() + " flex-1 min-w-[150px]"} autoFocus />
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$" className={inputClasses() + " w-24"} />
          <select value={cat} onChange={(e) => setCat(e.target.value as ExpenseCategory)} className={inputClasses() + " w-auto"}>
            {(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses() + " w-auto"} />
          <button onClick={handleAddExpense} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      )}

      {/* Expense list */}
      {tripExpenses.length === 0 && !showAdd && (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 text-center">
          <Wallet className="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500 dark:text-surface-400">No expenses tracked yet. Start logging spending.</p>
        </div>
      )}

      {tripExpenses.length > 0 && (
        <div className="space-y-2">
          {tripExpenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-3 group">
                <div className={`size-2.5 rounded-full shrink-0 ${EXPENSE_CATEGORY_COLORS[e.category]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{e.description}</p>
                  <p className="text-xs text-surface-400">{EXPENSE_CATEGORY_LABELS[e.category]} • {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">${e.amount.toLocaleString()}</span>
                <button onClick={() => { deleteExpense(e.id); refresh(); }} className="opacity-0 group-hover:opacity-100 rounded p-1 text-surface-400 hover:text-red-500 transition-all">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PLACES TAB
// ═══════════════════════════════════════════════════════════
function PlacesTab({ trips, places, refresh }: { trips: Trip[]; places: Place[]; refresh: () => void }) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id ?? "");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PlaceType>("attraction");
  const [notes, setNotes] = useState("");

  const tripPlaces = useMemo(() => places.filter((p) => p.tripId === selectedTripId), [places, selectedTripId]);
  const visitedCount = tripPlaces.filter((p) => p.visited).length;

  const handleAdd = () => {
    if (!name.trim() || !selectedTripId) return;
    addPlace({ tripId: selectedTripId, name: name.trim(), type, notes: notes || undefined });
    setName(""); setNotes(""); setShowAdd(false);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className={inputClasses() + " w-auto"}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
          <Plus className="size-4" /> Add Place
        </button>
        {tripPlaces.length > 0 && (
          <span className="text-sm text-surface-400">{visitedCount}/{tripPlaces.length} visited</span>
        )}
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800 p-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Place name..." className={inputClasses() + " flex-1 min-w-[150px]"} autoFocus />
          <select value={type} onChange={(e) => setType(e.target.value as PlaceType)} className={inputClasses() + " w-auto"}>
            {(Object.entries(PLACE_TYPE_LABELS) as [PlaceType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className={inputClasses() + " w-40"} />
          <button onClick={handleAdd} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      )}

      {tripPlaces.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 text-center">
          <MapPin className="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500 dark:text-surface-400">No places saved. Add attractions, restaurants, and more.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tripPlaces.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-3 group">
              <button onClick={() => { togglePlace(p.id); refresh(); }} className="shrink-0 text-surface-400 hover:text-teal-500 transition-colors">
                {p.visited ? <CheckCircle2 className="size-5 text-teal-500" /> : <Circle className="size-5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${p.visited ? "line-through text-surface-400" : "text-surface-800 dark:text-surface-200"}`}>
                  {p.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400">{PLACE_TYPE_LABELS[p.type]}</span>
                  {p.notes && <span className="text-xs text-surface-400 truncate">• {p.notes}</span>}
                </div>
              </div>
              <button onClick={() => { deletePlace(p.id); refresh(); }} className="opacity-0 group-hover:opacity-100 rounded p-1 text-surface-400 hover:text-red-500 transition-all">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DOCUMENTS TAB
// ═══════════════════════════════════════════════════════════
function DocsTab({ trips, documents, refresh }: { trips: Trip[]; documents: TravelDocument[]; refresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filterTripId, setFilterTripId] = useState<string>("");

  const filtered = filterTripId ? documents.filter((d) => d.tripId === filterTripId) : documents;
  const tripMap = useMemo(() => {
    const m: Record<string, Trip> = {};
    trips.forEach((t) => (m[t.id] = t));
    return m;
  }, [trips]);

  const typeIcons: Record<DocumentType, React.ReactNode> = {
    passport: <FileText className="size-4" />,
    visa: <Shield className="size-4" />,
    ticket: <Ticket className="size-4" />,
    insurance: <Shield className="size-4" />,
    other: <File className="size-4" />,
  };

  const [docName, setDocName] = useState("");
  const [docTripId, setDocTripId] = useState(trips[0]?.id ?? "");
  const [docType, setDocType] = useState<DocumentType>("passport");
  const [docExpiry, setDocExpiry] = useState("");
  const [docNotes, setDocNotes] = useState("");

  const handleAdd = () => {
    if (!docName.trim() || !docTripId) return;
    addDocument({
      tripId: docTripId,
      name: docName.trim(),
      type: docType,
      expirationDate: docExpiry || undefined,
      notes: docNotes || undefined,
    });
    setDocName(""); setDocExpiry(""); setDocNotes(""); setShowAdd(false);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
          <Plus className="size-4" /> Add Document
        </button>
        <select value={filterTripId} onChange={(e) => setFilterTripId(e.target.value)} className={inputClasses() + " w-auto"}>
          <option value="">All Trips</option>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800 p-3">
          <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Document name..." className={inputClasses() + " flex-1 min-w-[150px]"} autoFocus />
          <select value={docTripId} onChange={(e) => setDocTripId(e.target.value)} className={inputClasses() + " w-auto"}>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
          </select>
          <select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)} className={inputClasses() + " w-auto"}>
            {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input type="date" value={docExpiry} onChange={(e) => setDocExpiry(e.target.value)} className={inputClasses() + " w-auto"} placeholder="Expires" />
          <button onClick={handleAdd} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 text-center">
          <FileText className="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <p className="text-sm text-surface-500 dark:text-surface-400">No documents stored. Add passports, visas, tickets, and insurance.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => {
            const isExpiringSoon = d.expirationDate && getDaysUntil(d.expirationDate) <= 30 && getDaysUntil(d.expirationDate) >= 0;
            const isExpired = d.expirationDate && getDaysUntil(d.expirationDate) < 0;
            return (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-3 group">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  isExpired ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400" :
                  isExpiringSoon ? "bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400" :
                  "bg-teal-50 text-teal-500 dark:bg-teal-950/30 dark:text-teal-400"
                }`}>
                  {typeIcons[d.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{d.name}</p>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span>{DOCUMENT_TYPE_LABELS[d.type]}</span>
                    {tripMap[d.tripId] && <span>• {tripMap[d.tripId].destination}</span>}
                    {d.expirationDate && (
                      <span className={isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-500" : ""}>
                        • Expires {new Date(d.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {isExpired && " (EXPIRED)"}
                        {isExpiringSoon && " (soon)"}
                      </span>
                    )}
                  </div>
                  {d.notes && <p className="text-xs text-surface-400 mt-0.5">{d.notes}</p>}
                </div>
                <button onClick={() => { deleteDocument(d.id); refresh(); }} className="opacity-0 group-hover:opacity-100 rounded p-1 text-surface-400 hover:text-red-500 transition-all">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CURRENCY TAB
// ═══════════════════════════════════════════════════════════
function CurrencyTab() {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  const fromRate = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency)?.rate ?? 1;
  const toRate = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency)?.rate ?? 1;
  const converted = parseFloat(amount) || 0;
  const result = (converted / fromRate) * toRate;
  const fromSym = SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency)?.symbol ?? "$";
  const toSym = SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency)?.symbol ?? "€";

  // Quick swap
  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="space-y-6">
      {/* Converter Card */}
      <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 p-6 max-w-md">
        <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-4">Currency Converter</h3>

        {/* Amount */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClasses() + " text-lg font-semibold"}
            placeholder="100"
          />
        </div>

        {/* From / To */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">From</label>
            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className={inputClasses()}>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swap}
            className="mb-0.5 flex size-10 items-center justify-center rounded-xl bg-surface-100 text-surface-500 hover:bg-teal-100 hover:text-teal-600 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-teal-900/50 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowRightLeft className="size-4" />
          </button>

          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">To</label>
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className={inputClasses()}>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="mt-6 rounded-xl bg-surface-50 dark:bg-surface-800 p-4 text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {fromSym}{converted.toLocaleString()} {fromCurrency} =
          </p>
          <p className="text-3xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {toSym}{result.toFixed(2)}
          </p>
          <p className="text-xs text-surface-400 mt-1">{toCurrency}</p>
        </div>

        <p className="mt-3 text-[11px] text-surface-400 text-center">
          Exchange rates are mock data. 1 USD = {(1 / toRate * fromRate).toFixed(4)} {toCurrency}
        </p>
      </div>

      {/* Rate Table */}
      <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 overflow-hidden max-w-md">
        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800">
          <h4 className="text-sm font-semibold text-surface-500 dark:text-surface-400">Exchange Rates (per 1 USD)</h4>
        </div>
        <div className="divide-y divide-surface-100 dark:divide-surface-800">
          {SUPPORTED_CURRENCIES.map((c) => (
            <div key={c.code} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-surface-700 dark:text-surface-300">{c.code}</span>
                <span className="text-surface-400">{c.name}</span>
              </div>
              <span className="font-semibold text-surface-800 dark:text-surface-200">{c.symbol}{c.rate.toFixed(c.rate < 10 ? 4 : 2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TravelPage;
