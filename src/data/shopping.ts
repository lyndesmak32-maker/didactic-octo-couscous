import type {
  ShoppingData,
  GroceryList,
  GroceryItem,
  GroceryCategory,
  WishlistItem,
  Priority,
  PantryItem,
  Store,
  ShoppingHistoryItem,
  AIRecommendation,
} from "~/types/shopping";

const STORAGE_KEY = "lifeos-shopping";

// ── Seed Data ────────────────────────────────────────────
function createSeedData(): ShoppingData {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
  const twoDaysAgo = new Date(now.getTime() - 172800000).toISOString().split("T")[0];
  const threeDaysAgo = new Date(now.getTime() - 259200000).toISOString().split("T")[0];
  const nextWeek = new Date(now.getTime() + 604800000).toISOString().split("T")[0];
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().split("T")[0];
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString().split("T")[0];

  return {
    groceryLists: [
      {
        id: "list-1",
        name: "Weekly Groceries",
        shared: true,
        createdAt: lastMonth,
        items: [
          { id: "gi-1", name: "Organic Bananas", quantity: 6, category: "Produce", checked: false, addedAt: today },
          { id: "gi-2", name: "Baby Spinach", quantity: 1, category: "Produce", checked: false, addedAt: today },
          { id: "gi-3", name: "Cherry Tomatoes", quantity: 2, category: "Produce", checked: false, addedAt: today },
          { id: "gi-4", name: "Whole Milk", quantity: 1, category: "Dairy", checked: false, addedAt: today },
          { id: "gi-5", name: "Greek Yogurt", quantity: 2, category: "Dairy", checked: false, addedAt: today },
          { id: "gi-6", name: "Cheddar Cheese", quantity: 1, category: "Dairy", checked: true, addedAt: today },
          { id: "gi-7", name: "Chicken Breast", quantity: 3, category: "Meat", checked: false, addedAt: today },
          { id: "gi-8", name: "Ground Beef", quantity: 1, category: "Meat", checked: false, addedAt: today },
          { id: "gi-9", name: "Olive Oil", quantity: 1, category: "Pantry", checked: false, addedAt: today },
          { id: "gi-10", name: "Brown Rice", quantity: 2, category: "Pantry", checked: true, addedAt: today },
          { id: "gi-11", name: "Canned Tomatoes", quantity: 3, category: "Pantry", checked: false, addedAt: today },
          { id: "gi-12", name: "Frozen Broccoli", quantity: 2, category: "Frozen", checked: false, addedAt: today },
          { id: "gi-13", name: "Frozen Berries", quantity: 1, category: "Frozen", checked: false, addedAt: today },
          { id: "gi-14", name: "Whole Wheat Bread", quantity: 1, category: "Bakery", checked: false, addedAt: today },
          { id: "gi-15", name: "Orange Juice", quantity: 1, category: "Beverages", checked: false, addedAt: today },
          { id: "gi-16", name: "Sparkling Water", quantity: 2, category: "Beverages", checked: true, addedAt: today },
          { id: "gi-17", name: "Almonds", quantity: 1, category: "Snacks", checked: true, addedAt: today },
          { id: "gi-18", name: "Paper Towels", quantity: 1, category: "Household", checked: false, addedAt: today },
        ],
      },
      {
        id: "list-2",
        name: "Costco Run",
        shared: false,
        createdAt: twoDaysAgo,
        items: [
          { id: "gi-19", name: "Salmon Fillets", quantity: 4, category: "Meat", checked: false, addedAt: twoDaysAgo },
          { id: "gi-20", name: "Avocados", quantity: 5, category: "Produce", checked: false, addedAt: twoDaysAgo },
          { id: "gi-21", name: "Almond Butter", quantity: 1, category: "Pantry", checked: false, addedAt: twoDaysAgo },
          { id: "gi-22", name: "Protein Bars", quantity: 2, category: "Snacks", checked: false, addedAt: twoDaysAgo },
          { id: "gi-23", name: "Laundry Detergent", quantity: 1, category: "Household", checked: false, addedAt: twoDaysAgo },
          { id: "gi-24", name: "Dish Soap", quantity: 1, category: "Household", checked: false, addedAt: twoDaysAgo },
        ],
      },
      {
        id: "list-3",
        name: "Farmers Market",
        shared: true,
        createdAt: today,
        items: [
          { id: "gi-25", name: "Heirloom Tomatoes", quantity: 4, category: "Produce", checked: false, addedAt: today },
          { id: "gi-26", name: "Fresh Basil", quantity: 1, category: "Produce", checked: false, addedAt: today },
          { id: "gi-27", name: "Farm Eggs", quantity: 2, category: "Dairy", checked: false, addedAt: today },
          { id: "gi-28", name: "Sourdough Bread", quantity: 1, category: "Bakery", checked: false, addedAt: today },
          { id: "gi-29", name: "Local Honey", quantity: 1, category: "Pantry", checked: true, addedAt: today },
        ],
      },
    ],
    wishlist: [
      { id: "wl-1", name: "KitchenAid Stand Mixer", price: 429.99, link: "https://example.com/mixer", priority: "high", purchased: false, addedAt: lastMonth },
      { id: "wl-2", name: "Cast Iron Dutch Oven", price: 89.95, link: "https://example.com/dutchoven", priority: "medium", purchased: false, addedAt: twoDaysAgo },
      { id: "wl-3", name: "Sous Vide Precision Cooker", price: 199.99, priority: "low", purchased: false, addedAt: lastMonth },
      { id: "wl-4", name: "Japanese Chef Knife", price: 149.00, link: "https://example.com/knife", priority: "high", purchased: false, addedAt: yesterday },
      { id: "wl-5", name: "Aeropress Coffee Maker", price: 39.95, priority: "medium", purchased: false, addedAt: today },
      { id: "wl-6", name: "Glass Food Storage Set", price: 45.00, link: "https://example.com/storage", priority: "low", purchased: false, addedAt: threeDaysAgo },
    ],
    pantry: [
      { id: "p-1", name: "Olive Oil", quantity: 1, unit: "bottle", category: "Pantry", lowStock: false, addedAt: lastMonth },
      { id: "p-2", name: "Brown Rice", quantity: 0.5, unit: "lb", category: "Pantry", lowStock: true, addedAt: lastMonth },
      { id: "p-3", name: "Black Beans", quantity: 2, unit: "can", category: "Pantry", expiryDate: nextMonth, lowStock: false, addedAt: lastMonth },
      { id: "p-4", name: "Pasta", quantity: 3, unit: "box", category: "Pantry", expiryDate: nextMonth, lowStock: false, addedAt: twoDaysAgo },
      { id: "p-5", name: "All-Purpose Flour", quantity: 0.5, unit: "lb", category: "Pantry", lowStock: true, addedAt: lastMonth },
      { id: "p-6", name: "Sugar", quantity: 1, unit: "lb", category: "Pantry", lowStock: false, addedAt: lastMonth },
      { id: "p-7", name: "Salt", quantity: 1, unit: "box", category: "Pantry", lowStock: false, addedAt: lastMonth },
      { id: "p-8", name: "Chicken Stock", quantity: 1, unit: "carton", category: "Pantry", expiryDate: nextWeek, lowStock: true, addedAt: twoDaysAgo },
      { id: "p-9", name: "Cereal", quantity: 0, unit: "box", category: "Pantry", lowStock: true, addedAt: threeDaysAgo },
      { id: "p-10", name: "Peanut Butter", quantity: 1, unit: "jar", category: "Pantry", expiryDate: nextMonth, lowStock: false, addedAt: lastMonth },
      { id: "p-11", name: "Canned Tuna", quantity: 3, unit: "can", category: "Pantry", expiryDate: nextMonth, lowStock: false, addedAt: lastMonth },
      { id: "p-12", name: "Frozen Peas", quantity: 1, unit: "bag", category: "Frozen", lowStock: false, addedAt: twoDaysAgo },
      { id: "p-13", name: "Ice Cream", quantity: 0.5, unit: "tub", category: "Frozen", lowStock: true, addedAt: threeDaysAgo },
    ],
    stores: [
      { id: "s-1", name: "Trader Joe's", type: "grocery" },
      { id: "s-2", name: "Costco", type: "wholesale" },
      { id: "s-3", name: "Whole Foods", type: "supermarket" },
      { id: "s-4", name: "Farmers Market Downtown", type: "specialty", notes: "Saturdays 8am-1pm" },
      { id: "s-5", name: "Amazon Fresh", type: "online" },
    ],
    history: [
      { id: "h-1", name: "Organic Bananas", category: "Produce", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
      { id: "h-2", name: "Whole Milk", category: "Dairy", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
      { id: "h-3", name: "Chicken Breast", category: "Meat", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
      { id: "h-4", name: "Brown Rice", category: "Pantry", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
      { id: "h-5", name: "Greek Yogurt", category: "Dairy", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
      { id: "h-6", name: "Avocados", category: "Produce", purchasedAt: yesterday, listName: "Costco Run" },
      { id: "h-7", name: "Salmon Fillets", category: "Meat", purchasedAt: yesterday, listName: "Costco Run" },
      { id: "h-8", name: "Laundry Detergent", category: "Household", purchasedAt: yesterday, listName: "Costco Run" },
      { id: "h-9", name: "Sourdough Bread", category: "Bakery", purchasedAt: lastMonth, listName: "Farmers Market" },
      { id: "h-10", name: "Farm Eggs", category: "Dairy", purchasedAt: lastMonth, listName: "Farmers Market" },
      { id: "h-11", name: "Sparkling Water", category: "Beverages", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
      { id: "h-12", name: "Almonds", category: "Snacks", purchasedAt: threeDaysAgo, listName: "Weekly Groceries" },
    ],
  };
}

// ── Persistence ──────────────────────────────────────────
function loadData(): ShoppingData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ShoppingData;
  } catch {
    // corrupted data
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: ShoppingData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: ShoppingData | null = null;
function getData(): ShoppingData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 200;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: Grocery Lists ────────────────────────────
export function getGroceryLists(): GroceryList[] {
  return getData().groceryLists;
}

export function getGroceryList(id: string): GroceryList | undefined {
  return getData().groceryLists.find((l) => l.id === id);
}

export function addGroceryList(name: string): GroceryList {
  const store = getData();
  const list: GroceryList = {
    id: genId("list"),
    name,
    items: [],
    shared: false,
    createdAt: new Date().toISOString().split("T")[0],
  };
  store.groceryLists.push(list);
  persist();
  return list;
}

export function deleteGroceryList(id: string): void {
  const store = getData();
  store.groceryLists = store.groceryLists.filter((l) => l.id !== id);
  persist();
}

export function toggleListShared(id: string): void {
  const store = getData();
  const list = store.groceryLists.find((l) => l.id === id);
  if (!list) return;
  list.shared = !list.shared;
  persist();
}

export function addGroceryItem(listId: string, data: { name: string; quantity: number; category: GroceryCategory }): GroceryItem | null {
  const store = getData();
  const list = store.groceryLists.find((l) => l.id === listId);
  if (!list) return null;
  const item: GroceryItem = {
    id: genId("gi"),
    name: data.name,
    quantity: data.quantity,
    category: data.category,
    checked: false,
    addedAt: new Date().toISOString().split("T")[0],
  };
  list.items.push(item);
  persist();
  return item;
}

export function updateGroceryItem(listId: string, itemId: string, data: Partial<Pick<GroceryItem, "name" | "quantity" | "category">>): void {
  const store = getData();
  const list = store.groceryLists.find((l) => l.id === listId);
  if (!list) return;
  const idx = list.items.findIndex((i) => i.id === itemId);
  if (idx === -1) return;
  list.items[idx] = { ...list.items[idx], ...data };
  persist();
}

export function deleteGroceryItem(listId: string, itemId: string): void {
  const store = getData();
  const list = store.groceryLists.find((l) => l.id === listId);
  if (!list) return;
  list.items = list.items.filter((i) => i.id !== itemId);
  persist();
}

export function toggleGroceryItem(listId: string, itemId: string): void {
  const store = getData();
  const list = store.groceryLists.find((l) => l.id === listId);
  if (!list) return;
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;
  item.checked = !item.checked;

  // Move to history when checked
  if (item.checked) {
    addToHistory({ name: item.name, category: item.category, listName: list.name });
  }
  persist();
}

// ── Public API: Wishlist ─────────────────────────────────
export function getWishlist(): WishlistItem[] {
  return getData().wishlist;
}

export function addWishlistItem(data: Omit<WishlistItem, "id" | "purchased" | "addedAt">): WishlistItem {
  const store = getData();
  const item: WishlistItem = {
    ...data,
    id: genId("wl"),
    purchased: false,
    addedAt: new Date().toISOString().split("T")[0],
  };
  store.wishlist.push(item);
  persist();
  return item;
}

export function deleteWishlistItem(id: string): void {
  const store = getData();
  store.wishlist = store.wishlist.filter((i) => i.id !== id);
  persist();
}

export function toggleWishlistPurchased(id: string): void {
  const store = getData();
  const item = store.wishlist.find((i) => i.id === id);
  if (!item) return;
  item.purchased = !item.purchased;
  persist();
}

// ── Public API: Pantry ───────────────────────────────────
export function getPantry(): PantryItem[] {
  return getData().pantry;
}

export function addPantryItem(data: Omit<PantryItem, "id" | "addedAt">): PantryItem {
  const store = getData();
  const item: PantryItem = {
    ...data,
    id: genId("p"),
    addedAt: new Date().toISOString().split("T")[0],
  };
  store.pantry.push(item);
  persist();
  return item;
}

export function updatePantryItem(id: string, data: Partial<Omit<PantryItem, "id" | "addedAt">>): void {
  const store = getData();
  const idx = store.pantry.findIndex((i) => i.id === id);
  if (idx === -1) return;
  store.pantry[idx] = { ...store.pantry[idx], ...data };
  persist();
}

export function deletePantryItem(id: string): void {
  const store = getData();
  store.pantry = store.pantry.filter((i) => i.id !== id);
  persist();
}

// ── Public API: Stores ───────────────────────────────────
export function getStores(): Store[] {
  return getData().stores;
}

export function addStore(data: { name: string; type: Store["type"]; notes?: string }): Store {
  const store = getData();
  const s: Store = { id: genId("s"), ...data };
  store.stores.push(s);
  persist();
  return s;
}

export function deleteStore(id: string): void {
  const store = getData();
  store.stores = store.stores.filter((s) => s.id !== id);
  persist();
}

// ── Public API: History ──────────────────────────────────
export function getHistory(): ShoppingHistoryItem[] {
  return getData().history;
}

function addToHistory(data: { name: string; category: GroceryCategory; listName?: string }): void {
  const store = getData();
  store.history.unshift({
    id: genId("h"),
    name: data.name,
    category: data.category,
    purchasedAt: new Date().toISOString().split("T")[0],
    listName: data.listName,
  });
}

// ── Public API: AI Recommendations ───────────────────────
export function getAIRecommendations(): AIRecommendation[] {
  const store = getData();
  const history = store.history;
  const pantry = store.pantry;
  const recommendations: AIRecommendation[] = [];

  // Track what's been purchased frequently
  const freqMap = new Map<string, { count: number; lastPurchased: string; category: GroceryCategory }>();
  for (const h of history) {
    const key = h.name.toLowerCase();
    const existing = freqMap.get(key);
    if (existing) {
      existing.count++;
      if (h.purchasedAt > existing.lastPurchased) existing.lastPurchased = h.purchasedAt;
    } else {
      freqMap.set(key, { count: 1, lastPurchased: h.purchasedAt, category: h.category });
    }
  }

  // Low-stock items as recommendations
  for (const p of pantry) {
    if (p.lowStock || p.quantity === 0) {
      recommendations.push({
        id: genId("ai"),
        name: p.name,
        category: p.category,
        reason: `You're running ${p.quantity === 0 ? "out" : "low"} — ${p.quantity} ${p.unit ?? "units"} left`,
        confidence: p.quantity === 0 ? 95 : 75,
      });
    }
  }

  // Frequently purchased items
  const now = new Date();
  for (const [name, data] of freqMap) {
    if (data.count >= 2) {
      const lastDate = new Date(data.lastPurchased);
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / 86400000);
      if (daysSince > 5) {
        recommendations.push({
          id: genId("ai"),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          category: data.category,
          reason: `You usually buy this every few days — last purchase was ${daysSince} days ago`,
          confidence: Math.min(Math.round(daysSince * 8), 90),
        });
      }
    }
  }

  // Sort by confidence descending, take top 6
  recommendations.sort((a, b) => b.confidence - a.confidence);
  return recommendations.slice(0, 6);
}

// ── Reset ────────────────────────────────────────────────
export function resetShoppingData(): void {
  _cache = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
