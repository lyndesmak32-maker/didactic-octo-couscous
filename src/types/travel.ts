// ── Trip ───────────────────────────────────────────────
export type TripStatus = "upcoming" | "active" | "past";

export interface Trip {
  id: string;
  destination: string;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  budget: number;
  spent: number;
  notes?: string;
  status: TripStatus;
  image?: string;
}

// ── Flight ──────────────────────────────────────────────
export type FlightStatus = "on-time" | "delayed" | "departed" | "landed";

export interface Flight {
  id: string;
  tripId: string;
  airline: string;
  flightNumber: string;
  departureAirport: string; // airport code
  arrivalAirport: string; // airport code
  departureTime: string; // ISO datetime
  arrivalTime: string; // ISO datetime
  status: FlightStatus;
  notes?: string;
}

export const FLIGHT_STATUS_COLORS: Record<FlightStatus, string> = {
  "on-time": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  delayed: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  departed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  landed: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
};

// ── Hotel ───────────────────────────────────────────────
export interface HotelReservation {
  id: string;
  tripId: string;
  hotelName: string;
  checkIn: string; // ISO date YYYY-MM-DD
  checkOut: string; // ISO date YYYY-MM-DD
  confirmationNumber?: string;
  address?: string;
  notes?: string;
}

// ── Packing ─────────────────────────────────────────────
export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  packed: boolean;
  category: PackingCategory;
}

export type PackingCategory = "essentials" | "clothing" | "electronics" | "toiletries" | "misc";

export const PACKING_CATEGORY_LABELS: Record<PackingCategory, string> = {
  essentials: "Essentials",
  clothing: "Clothing",
  electronics: "Electronics",
  toiletries: "Toiletries",
  misc: "Misc",
};

export const DEFAULT_PACKING_TEMPLATE: { name: string; category: PackingCategory }[] = [
  { name: "Passport / ID", category: "essentials" },
  { name: "Travel insurance docs", category: "essentials" },
  { name: "Boarding passes / tickets", category: "essentials" },
  { name: "Credit cards / cash", category: "essentials" },
  { name: "Phone charger", category: "electronics" },
  { name: "Power bank", category: "electronics" },
  { name: "Headphones", category: "electronics" },
  { name: "Travel adapter", category: "electronics" },
  { name: "Toothbrush & toothpaste", category: "toiletries" },
  { name: "Shampoo & conditioner", category: "toiletries" },
  { name: "Sunscreen", category: "toiletries" },
  { name: "Deodorant", category: "toiletries" },
  { name: "Underwear (×7)", category: "clothing" },
  { name: "Socks (×7)", category: "clothing" },
  { name: "T-shirts (×5)", category: "clothing" },
  { name: "Comfortable walking shoes", category: "clothing" },
  { name: "Jacket / sweater", category: "clothing" },
  { name: "Swimwear", category: "clothing" },
  { name: "Sunglasses", category: "misc" },
  { name: "Reusable water bottle", category: "misc" },
];

// ── Documents ───────────────────────────────────────────
export type DocumentType = "passport" | "visa" | "ticket" | "insurance" | "other";

export interface TravelDocument {
  id: string;
  tripId: string;
  name: string;
  type: DocumentType;
  expirationDate?: string; // ISO date YYYY-MM-DD
  notes?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport: "Passport",
  visa: "Visa",
  ticket: "Ticket",
  insurance: "Insurance",
  other: "Other",
};

// ── Expenses ────────────────────────────────────────────
export type ExpenseCategory = "transport" | "food" | "activities" | "shopping" | "accommodation" | "other";

export interface ExpenseEntry {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date YYYY-MM-DD
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: "Transport",
  food: "Food",
  activities: "Activities",
  shopping: "Shopping",
  accommodation: "Accommodation",
  other: "Other",
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  transport: "bg-blue-500",
  food: "bg-amber-500",
  activities: "bg-violet-500",
  shopping: "bg-pink-500",
  accommodation: "bg-emerald-500",
  other: "bg-surface-400",
};

// ── Places ──────────────────────────────────────────────
export type PlaceType = "attraction" | "restaurant" | "museum" | "park" | "shopping" | "other";

export interface Place {
  id: string;
  tripId: string;
  name: string;
  type: PlaceType;
  notes?: string;
  visited: boolean;
}

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  attraction: "Attraction",
  restaurant: "Restaurant",
  museum: "Museum",
  park: "Park",
  shopping: "Shopping",
  other: "Other",
};

// ── Currency ────────────────────────────────────────────
export interface CurrencyRate {
  code: string;
  name: string;
  rate: number; // relative to USD
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyRate[] = [
  { code: "USD", name: "US Dollar", rate: 1, symbol: "$" },
  { code: "EUR", name: "Euro", rate: 0.92, symbol: "€" },
  { code: "GBP", name: "British Pound", rate: 0.79, symbol: "£" },
  { code: "JPY", name: "Japanese Yen", rate: 149.5, symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", rate: 1.36, symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", rate: 1.52, symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", rate: 0.88, symbol: "Fr" },
  { code: "MXN", name: "Mexican Peso", rate: 17.1, symbol: "MX$" },
  { code: "INR", name: "Indian Rupee", rate: 83.1, symbol: "₹" },
  { code: "KRW", name: "South Korean Won", rate: 1320, symbol: "₩" },
];

// ── Aggregate Store ─────────────────────────────────────
export interface TravelData {
  trips: Trip[];
  flights: Flight[];
  hotels: HotelReservation[];
  packingItems: PackingItem[];
  documents: TravelDocument[];
  expenses: ExpenseEntry[];
  places: Place[];
}
