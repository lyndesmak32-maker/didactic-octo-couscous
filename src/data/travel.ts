import type {
  TravelData,
  Trip,
  TripStatus,
  Flight,
  FlightStatus,
  HotelReservation,
  PackingItem,
  PackingCategory,
  TravelDocument,
  DocumentType,
  ExpenseEntry,
  ExpenseCategory,
  Place,
  PlaceType,
} from "~/types/travel";
import { DEFAULT_PACKING_TEMPLATE } from "~/types/travel";

const STORAGE_KEY = "lifeos-travel";

// ── Helpers ────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ── Seed Data ──────────────────────────────────────────
function createSeedData(): TravelData {
  // Trip 1: Upcoming - Tokyo
  const trip1: Trip = {
    id: "trip-1",
    destination: "Tokyo, Japan",
    startDate: daysFromNow(45),
    endDate: daysFromNow(59),
    budget: 5000,
    spent: 1850,
    notes: "Two weeks exploring Tokyo, Kyoto, and Osaka. JR Pass already purchased.",
    status: "upcoming",
  };

  // Trip 2: Upcoming - Paris
  const trip2: Trip = {
    id: "trip-2",
    destination: "Paris, France",
    startDate: daysFromNow(90),
    endDate: daysFromNow(97),
    budget: 3500,
    spent: 620,
    notes: "Week-long romantic getaway. Booked Eiffel Tower tickets.",
    status: "upcoming",
  };

  // Trip 3: Past - New York
  const trip3: Trip = {
    id: "trip-3",
    destination: "New York City, USA",
    startDate: daysAgo(30),
    endDate: daysAgo(25),
    budget: 2800,
    spent: 2915,
    notes: "Long weekend in NYC. Went a little over budget but worth it!",
    status: "past",
  };

  const trips = [trip1, trip2, trip3];

  // Flights
  const flights: Flight[] = [
    {
      id: "fl-1",
      tripId: "trip-1",
      airline: "Japan Airlines",
      flightNumber: "JL005",
      departureAirport: "LAX",
      arrivalAirport: "NRT",
      departureTime: `${trip1.startDate}T11:30:00`,
      arrivalTime: `${trip1.startDate}T15:00:00`,
      status: "on-time",
      notes: "Direct flight, 11h 30m",
    },
    {
      id: "fl-2",
      tripId: "trip-1",
      airline: "Japan Airlines",
      flightNumber: "JL006",
      departureAirport: "NRT",
      arrivalAirport: "LAX",
      departureTime: `${trip1.endDate}T17:00:00`,
      arrivalTime: `${trip1.endDate}T11:30:00`,
      status: "on-time",
    },
    {
      id: "fl-3",
      tripId: "trip-2",
      airline: "Air France",
      flightNumber: "AF065",
      departureAirport: "JFK",
      arrivalAirport: "CDG",
      departureTime: `${trip2.startDate}T18:00:00`,
      arrivalTime: `${trip2.startDate}T07:30:00`,
      status: "on-time",
      notes: "Red-eye flight, 7h 30m",
    },
    {
      id: "fl-4",
      tripId: "trip-2",
      airline: "Air France",
      flightNumber: "AF066",
      departureAirport: "CDG",
      arrivalAirport: "JFK",
      departureTime: `${trip2.endDate}T10:00:00`,
      arrivalTime: `${trip2.endDate}T13:00:00`,
      status: "on-time",
    },
    {
      id: "fl-5",
      tripId: "trip-3",
      airline: "Delta",
      flightNumber: "DL402",
      departureAirport: "LAX",
      arrivalAirport: "JFK",
      departureTime: `${trip3.startDate}T07:00:00`,
      arrivalTime: `${trip3.startDate}T15:30:00`,
      status: "landed",
      notes: "Arrived 20 min early",
    },
    {
      id: "fl-6",
      tripId: "trip-3",
      airline: "Delta",
      flightNumber: "DL405",
      departureAirport: "JFK",
      arrivalAirport: "LAX",
      departureTime: `${trip3.endDate}T19:00:00`,
      arrivalTime: `${trip3.endDate}T22:30:00`,
      status: "landed",
      notes: "Delayed 45 min due to weather",
    },
  ];

  // Hotels
  const hotels: HotelReservation[] = [
    {
      id: "ht-1",
      tripId: "trip-1",
      hotelName: "Hotel Gracery Shinjuku",
      checkIn: trip1.startDate,
      checkOut: daysFromNow(49), // 4 days Tokyo
      confirmationNumber: "HG-88234",
      address: "1-19-1 Kabukicho, Shinjuku, Tokyo",
    },
    {
      id: "ht-2",
      tripId: "trip-1",
      hotelName: "Kyoto Granbell Hotel",
      checkIn: daysFromNow(50),
      checkOut: daysFromNow(55),
      confirmationNumber: "KGH-11922",
      address: "Higashiyama-ku, Kyoto",
    },
    {
      id: "ht-3",
      tripId: "trip-1",
      hotelName: "Hotel Gracery Shinjuku",
      checkIn: daysFromNow(56),
      checkOut: trip1.endDate,
      confirmationNumber: "HG-88421",
      address: "1-19-1 Kabukicho, Shinjuku, Tokyo",
      notes: "Last 3 nights back in Tokyo",
    },
    {
      id: "ht-4",
      tripId: "trip-2",
      hotelName: "Hôtel Le Marais",
      checkIn: trip2.startDate,
      checkOut: trip2.endDate,
      confirmationNumber: "HLM-4562",
      address: "3 Rue des Archives, 75004 Paris",
    },
    {
      id: "ht-5",
      tripId: "trip-3",
      hotelName: "The Manhattan Club",
      checkIn: trip3.startDate,
      checkOut: trip3.endDate,
      confirmationNumber: "MC-7710",
      address: "200 W 56th St, New York, NY 10019",
    },
  ];

  // Packing items (per trip)
  const packingItems: PackingItem[] = [];
  for (const trip of trips) {
    DEFAULT_PACKING_TEMPLATE.forEach((tmpl, idx) => {
      packingItems.push({
        id: `pk-${trip.id}-${idx}`,
        tripId: trip.id,
        name: tmpl.name,
        packed: trip.status === "past" ? true : idx < 5,
        category: tmpl.category,
      });
    });
  }

  // Documents
  const documents: TravelDocument[] = [
    {
      id: "doc-1",
      tripId: "trip-1",
      name: "US Passport",
      type: "passport",
      expirationDate: "2029-03-15",
    },
    {
      id: "doc-2",
      tripId: "trip-1",
      name: "Japan eVisa",
      type: "visa",
      expirationDate: trip1.endDate,
      notes: "Electronic visa, print a copy",
    },
    {
      id: "doc-3",
      tripId: "trip-1",
      name: "Travel Insurance - WorldNomads",
      type: "insurance",
      expirationDate: trip1.endDate,
    },
    {
      id: "doc-4",
      tripId: "trip-2",
      name: "US Passport",
      type: "passport",
      expirationDate: "2029-03-15",
    },
    {
      id: "doc-5",
      tripId: "trip-2",
      name: "Eiffel Tower Tickets",
      type: "ticket",
      expirationDate: daysFromNow(92),
      notes: "10:30 AM entry, skip the line",
    },
  ];

  // Expenses
  const expenses: ExpenseEntry[] = [
    { id: "ex-1", tripId: "trip-1", description: "JR Pass (14 days)", amount: 450, category: "transport", date: daysAgo(10) },
    { id: "ex-2", tripId: "trip-1", description: "Hotel Gracery Shinjuku (4 nights)", amount: 680, category: "accommodation", date: daysAgo(15) },
    { id: "ex-3", tripId: "trip-1", description: "Kyoto Granbell Hotel (5 nights)", amount: 550, category: "accommodation", date: daysAgo(15) },
    { id: "ex-4", tripId: "trip-1", description: "Travel insurance", amount: 95, category: "other", date: daysAgo(20) },
    { id: "ex-5", tripId: "trip-1", description: "Pocket WiFi rental", amount: 75, category: "other", date: daysAgo(8) },
    { id: "ex-6", tripId: "trip-2", description: "Flight JFK→CDG roundtrip", amount: 620, category: "transport", date: daysAgo(5) },
    { id: "ex-7", tripId: "trip-3", description: "Flight LAX→JFK roundtrip", amount: 420, category: "transport", date: daysAgo(40) },
    { id: "ex-8", tripId: "trip-3", description: "The Manhattan Club (5 nights)", amount: 1250, category: "accommodation", date: daysAgo(40) },
    { id: "ex-9", tripId: "trip-3", description: "Broadway show tickets", amount: 350, category: "activities", date: daysAgo(28) },
    { id: "ex-10", tripId: "trip-3", description: "Dinner at Le Bernardin", amount: 280, category: "food", date: daysAgo(27) },
    { id: "ex-11", tripId: "trip-3", description: "MoMA tickets", amount: 50, category: "activities", date: daysAgo(28) },
    { id: "ex-12", tripId: "trip-3", description: "Souvenirs", amount: 145, category: "shopping", date: daysAgo(26) },
    { id: "ex-13", tripId: "trip-3", description: "Subway pass", amount: 35, category: "transport", date: daysAgo(29) },
    { id: "ex-14", tripId: "trip-3", description: "Central Park bike rental", amount: 40, category: "activities", date: daysAgo(27) },
    { id: "ex-15", tripId: "trip-3", description: "Bagels & coffee (×5)", amount: 75, category: "food", date: daysAgo(26) },
  ];

  // Places
  const places: Place[] = [
    { id: "pl-1", tripId: "trip-1", name: "Shibuya Crossing", type: "attraction", visited: false },
    { id: "pl-2", tripId: "trip-1", name: "Fushimi Inari Shrine", type: "attraction", notes: "Go early to avoid crowds", visited: false },
    { id: "pl-3", tripId: "trip-1", name: "Tsukiji Outer Market", type: "restaurant", notes: "Best sushi breakfast", visited: false },
    { id: "pl-4", tripId: "trip-1", name: "Arashiyama Bamboo Grove", type: "park", visited: false },
    { id: "pl-5", tripId: "trip-1", name: "Akihabara Electric Town", type: "shopping", notes: "Electronics and anime", visited: false },
    { id: "pl-6", tripId: "trip-1", name: "TeamLab Borderless", type: "museum", visited: false },
    { id: "pl-7", tripId: "trip-1", name: "Ichiran Ramen", type: "restaurant", notes: "Solo ramen booths", visited: false },
    { id: "pl-8", tripId: "trip-2", name: "Eiffel Tower", type: "attraction", visited: false },
    { id: "pl-9", tripId: "trip-2", name: "Louvre Museum", type: "museum", notes: "Book skip-the-line tickets", visited: false },
    { id: "pl-10", tripId: "trip-2", name: "Montmartre & Sacré-Cœur", type: "attraction", visited: false },
    { id: "pl-11", tripId: "trip-2", name: "Le Jules Verne", type: "restaurant", notes: "Michelin star, need reservation", visited: false },
    { id: "pl-12", tripId: "trip-2", name: "Luxembourg Gardens", type: "park", visited: false },
    { id: "pl-13", tripId: "trip-3", name: "Central Park", type: "park", visited: true },
    { id: "pl-14", tripId: "trip-3", name: "Times Square", type: "attraction", visited: true },
    { id: "pl-15", tripId: "trip-3", name: "MoMA", type: "museum", visited: true, notes: "Incredible collection" },
    { id: "pl-16", tripId: "trip-3", name: "Katz's Delicatessen", type: "restaurant", visited: true },
    { id: "pl-17", tripId: "trip-3", name: "Brooklyn Bridge Walk", type: "attraction", visited: true },
  ];

  return { trips, flights, hotels, packingItems, documents, expenses, places };
}

// ── Persistence ─────────────────────────────────────────
function loadData(): TravelData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TravelData;
  } catch {
    // corrupted
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: TravelData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: TravelData | null = null;
function getData(): TravelData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 500;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: Trips ──────────────────────────────────
export function getTrips(): Trip[] {
  return getData().trips;
}

export function getTrip(id: string): Trip | undefined {
  return getData().trips.find((t) => t.id === id);
}

export function addTrip(data: Omit<Trip, "id" | "spent">): Trip {
  const store = getData();
  const trip: Trip = { ...data, id: genId("trip"), spent: 0 };
  store.trips.push(trip);
  store.trips.sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Auto-populate packing list
  DEFAULT_PACKING_TEMPLATE.forEach((tmpl, idx) => {
    store.packingItems.push({
      id: genId("pk"),
      tripId: trip.id,
      name: tmpl.name,
      packed: false,
      category: tmpl.category,
    });
  });

  persist();
  return trip;
}

export function updateTrip(id: string, data: Partial<Omit<Trip, "id">>): void {
  const store = getData();
  const idx = store.trips.findIndex((t) => t.id === id);
  if (idx === -1) return;
  store.trips[idx] = { ...store.trips[idx], ...data };
  persist();
}

export function deleteTrip(id: string): void {
  const store = getData();
  store.trips = store.trips.filter((t) => t.id !== id);
  store.flights = store.flights.filter((f) => f.tripId !== id);
  store.hotels = store.hotels.filter((h) => h.tripId !== id);
  store.packingItems = store.packingItems.filter((p) => p.tripId !== id);
  store.documents = store.documents.filter((d) => d.tripId !== id);
  store.expenses = store.expenses.filter((e) => e.tripId !== id);
  store.places = store.places.filter((p) => p.tripId !== id);
  persist();
}

// ── Public API: Flights ────────────────────────────────
export function getFlights(tripId?: string): Flight[] {
  const all = getData().flights;
  return tripId ? all.filter((f) => f.tripId === tripId) : all;
}

export function addFlight(data: Omit<Flight, "id">): Flight {
  const store = getData();
  const flight: Flight = { ...data, id: genId("fl") };
  store.flights.push(flight);
  persist();
  return flight;
}

export function updateFlight(id: string, data: Partial<Omit<Flight, "id">>): void {
  const store = getData();
  const idx = store.flights.findIndex((f) => f.id === id);
  if (idx === -1) return;
  store.flights[idx] = { ...store.flights[idx], ...data };
  persist();
}

export function deleteFlight(id: string): void {
  const store = getData();
  store.flights = store.flights.filter((f) => f.id !== id);
  persist();
}

// ── Public API: Hotels ─────────────────────────────────
export function getHotels(tripId?: string): HotelReservation[] {
  const all = getData().hotels;
  return tripId ? all.filter((h) => h.tripId === tripId) : all;
}

export function addHotel(data: Omit<HotelReservation, "id">): HotelReservation {
  const store = getData();
  const hotel: HotelReservation = { ...data, id: genId("ht") };
  store.hotels.push(hotel);
  persist();
  return hotel;
}

export function updateHotel(id: string, data: Partial<Omit<HotelReservation, "id">>): void {
  const store = getData();
  const idx = store.hotels.findIndex((h) => h.id === id);
  if (idx === -1) return;
  store.hotels[idx] = { ...store.hotels[idx], ...data };
  persist();
}

export function deleteHotel(id: string): void {
  const store = getData();
  store.hotels = store.hotels.filter((h) => h.id !== id);
  persist();
}

// ── Public API: Packing ────────────────────────────────
export function getPackingItems(tripId: string): PackingItem[] {
  return getData().packingItems.filter((p) => p.tripId === tripId);
}

export function addPackingItem(tripId: string, data: Omit<PackingItem, "id" | "tripId">): PackingItem {
  const store = getData();
  const item: PackingItem = { ...data, id: genId("pk"), tripId };
  store.packingItems.push(item);
  persist();
  return item;
}

export function togglePackingItem(id: string): void {
  const store = getData();
  const item = store.packingItems.find((p) => p.id === id);
  if (item) item.packed = !item.packed;
  persist();
}

export function updatePackingItem(id: string, data: Partial<Omit<PackingItem, "id">>): void {
  const store = getData();
  const idx = store.packingItems.findIndex((p) => p.id === id);
  if (idx === -1) return;
  store.packingItems[idx] = { ...store.packingItems[idx], ...data };
  persist();
}

export function deletePackingItem(id: string): void {
  const store = getData();
  store.packingItems = store.packingItems.filter((p) => p.id !== id);
  persist();
}

// ── Public API: Documents ──────────────────────────────
export function getDocuments(tripId?: string): TravelDocument[] {
  const all = getData().documents;
  return tripId ? all.filter((d) => d.tripId === tripId) : all;
}

export function addDocument(data: Omit<TravelDocument, "id">): TravelDocument {
  const store = getData();
  const doc: TravelDocument = { ...data, id: genId("doc") };
  store.documents.push(doc);
  persist();
  return doc;
}

export function updateDocument(id: string, data: Partial<Omit<TravelDocument, "id">>): void {
  const store = getData();
  const idx = store.documents.findIndex((d) => d.id === id);
  if (idx === -1) return;
  store.documents[idx] = { ...store.documents[idx], ...data };
  persist();
}

export function deleteDocument(id: string): void {
  const store = getData();
  store.documents = store.documents.filter((d) => d.id !== id);
  persist();
}

// ── Public API: Expenses ───────────────────────────────
export function getExpenses(tripId?: string): ExpenseEntry[] {
  const all = getData().expenses;
  if (!tripId) return all;
  return all.filter((e) => e.tripId === tripId);
}

export function addExpense(data: Omit<ExpenseEntry, "id">): ExpenseEntry {
  const store = getData();
  const entry: ExpenseEntry = { ...data, id: genId("ex") };
  store.expenses.push(entry);

  // Update trip spent
  const trip = store.trips.find((t) => t.id === data.tripId);
  if (trip) {
    trip.spent = store.expenses
      .filter((e) => e.tripId === trip.id)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  persist();
  return entry;
}

export function updateExpense(id: string, data: Partial<Omit<ExpenseEntry, "id">>): void {
  const store = getData();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return;
  store.expenses[idx] = { ...store.expenses[idx], ...data };

  // Recalculate trip spent
  const exp = store.expenses[idx];
  const trip = store.trips.find((t) => t.id === exp.tripId);
  if (trip) {
    trip.spent = store.expenses
      .filter((e) => e.tripId === trip.id)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  persist();
}

export function deleteExpense(id: string): void {
  const store = getData();
  const exp = store.expenses.find((e) => e.id === id);
  store.expenses = store.expenses.filter((e) => e.id !== id);

  if (exp) {
    const trip = store.trips.find((t) => t.id === exp.tripId);
    if (trip) {
      trip.spent = store.expenses
        .filter((e) => e.tripId === trip.id)
        .reduce((sum, e) => sum + e.amount, 0);
    }
  }

  persist();
}

// ── Public API: Places ─────────────────────────────────
export function getPlaces(tripId?: string): Place[] {
  const all = getData().places;
  return tripId ? all.filter((p) => p.tripId === tripId) : all;
}

export function addPlace(data: Omit<Place, "id" | "visited">): Place {
  const store = getData();
  const place: Place = { ...data, id: genId("pl"), visited: false };
  store.places.push(place);
  persist();
  return place;
}

export function togglePlace(id: string): void {
  const store = getData();
  const place = store.places.find((p) => p.id === id);
  if (place) place.visited = !place.visited;
  persist();
}

export function updatePlace(id: string, data: Partial<Omit<Place, "id">>): void {
  const store = getData();
  const idx = store.places.findIndex((p) => p.id === id);
  if (idx === -1) return;
  store.places[idx] = { ...store.places[idx], ...data };
  persist();
}

export function deletePlace(id: string): void {
  const store = getData();
  store.places = store.places.filter((p) => p.id !== id);
  persist();
}

// ── Helpers: Countdown ─────────────────────────────────
export function getDaysUntil(date: string): number {
  const target = new Date(date + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Helpers: Expense by category for a trip ────────────
export function getExpensesByCategory(tripId: string): Record<ExpenseCategory, number> {
  const entries = getExpenses(tripId);
  const result: Record<string, number> = {};
  for (const cat of ["transport", "food", "activities", "shopping", "accommodation", "other"] as ExpenseCategory[]) {
    result[cat] = entries.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
  }
  return result as Record<ExpenseCategory, number>;
}
