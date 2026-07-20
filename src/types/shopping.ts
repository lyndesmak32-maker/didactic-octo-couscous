// ── Grocery Categories ──────────────────────────────────
export type GroceryCategory =
  | "Produce"
  | "Dairy"
  | "Meat"
  | "Pantry"
  | "Frozen"
  | "Bakery"
  | "Beverages"
  | "Snacks"
  | "Household"
  | "Other";

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  "Produce",
  "Dairy",
  "Meat",
  "Pantry",
  "Frozen",
  "Bakery",
  "Beverages",
  "Snacks",
  "Household",
  "Other",
];

export const CATEGORY_EMOJI: Record<GroceryCategory, string> = {
  Produce: "🥬",
  Dairy: "🧀",
  Meat: "🥩",
  Pantry: "🥫",
  Frozen: "❄️",
  Bakery: "🍞",
  Beverages: "🥤",
  Snacks: "🍿",
  Household: "🧹",
  Other: "📦",
};

// ── Grocery Item ────────────────────────────────────────
export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  category: GroceryCategory;
  checked: boolean;
  addedAt: string; // ISO date
}

// ── Grocery List ────────────────────────────────────────
export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  shared: boolean;
  createdAt: string;
}

// ── Priority ────────────────────────────────────────────
export type Priority = "low" | "medium" | "high";

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

// ── Wishlist Item ───────────────────────────────────────
export interface WishlistItem {
  id: string;
  name: string;
  price?: number;
  link?: string;
  priority: Priority;
  purchased: boolean;
  addedAt: string;
}

// ── Pantry Item ─────────────────────────────────────────
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: GroceryCategory;
  expiryDate?: string;
  lowStock: boolean;
  addedAt: string;
}

// ── Store ───────────────────────────────────────────────
export interface Store {
  id: string;
  name: string;
  type: "grocery" | "supermarket" | "wholesale" | "specialty" | "online" | "other";
  notes?: string;
}

export const STORE_TYPE_LABELS: Record<Store["type"], string> = {
  grocery: "Grocery",
  supermarket: "Supermarket",
  wholesale: "Wholesale",
  specialty: "Specialty",
  online: "Online",
  other: "Other",
};

// ── Shopping History ────────────────────────────────────
export interface ShoppingHistoryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  purchasedAt: string; // ISO date
  listName?: string;
}

// ── AI Recommendation ──────────────────────────────────
export interface AIRecommendation {
  id: string;
  name: string;
  category: GroceryCategory;
  reason: string;
  confidence: number; // 0-100
}

// ── Aggregate Store ─────────────────────────────────────
export interface ShoppingData {
  groceryLists: GroceryList[];
  wishlist: WishlistItem[];
  pantry: PantryItem[];
  stores: Store[];
  history: ShoppingHistoryItem[];
}
