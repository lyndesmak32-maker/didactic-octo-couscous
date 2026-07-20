import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  ShoppingCart, Plus, Trash2, Check, X, Store, Heart,
  Package, Clock, Users, Share2, AlertTriangle,
  ExternalLink, RefreshCw, Sparkles,
  ShoppingBag, List,
} from "lucide-react";
import type {
  GroceryList, GroceryItem, GroceryCategory,
  WishlistItem, PantryItem, Store as StoreType,
  ShoppingHistoryItem, AIRecommendation, Priority,
} from "~/types/shopping";
import {
  GROCERY_CATEGORIES, CATEGORY_EMOJI,
  PRIORITY_ORDER, PRIORITY_LABELS, PRIORITY_COLORS,
  STORE_TYPE_LABELS,
} from "~/types/shopping";
import {
  getGroceryLists, addGroceryList, deleteGroceryList, toggleListShared,
  addGroceryItem, updateGroceryItem, deleteGroceryItem, toggleGroceryItem,
  getWishlist, addWishlistItem, deleteWishlistItem, toggleWishlistPurchased,
  getPantry, addPantryItem, updatePantryItem, deletePantryItem,
  getStores, addStore, deleteStore,
  getHistory, getAIRecommendations,
} from "~/data/shopping";

export const Route = createFileRoute("/shopping")({ component: ShoppingPage });

type Tab = "lists" | "wishlist" | "pantry" | "history" | "stores";

const TABS: { id: Tab; label: string; icon: typeof ShoppingCart }[] = [
  { id: "lists", label: "Grocery Lists", icon: ShoppingCart },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "pantry", label: "Pantry", icon: Package },
  { id: "history", label: "History", icon: Clock },
  { id: "stores", label: "Stores", icon: Store },
];

// ── Helper: group items by category, unchecked first ────
function sortItems(items: GroceryItem[]): GroceryItem[] {
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  return [...unchecked, ...checked];
}

function groupByCategory(items: GroceryItem[]): Map<GroceryCategory, GroceryItem[]> {
  const map = new Map<GroceryCategory, GroceryItem[]>();
  for (const item of items) {
    const cat = item.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  return map;
}

// ── Helper: group history by date ────────────────────────
function groupHistoryByDate(items: ShoppingHistoryItem[]): Map<string, ShoppingHistoryItem[]> {
  const map = new Map<string, ShoppingHistoryItem[]>();
  for (const item of items) {
    if (!map.has(item.purchasedAt)) map.set(item.purchasedAt, []);
    map.get(item.purchasedAt)!.push(item);
  }
  return map;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";

  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

// ── Main Page Component ──────────────────────────────────
function ShoppingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lists");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Read data
  const lists = useMemo(() => getGroceryLists(), [tick]);
  const wishlist = useMemo(() => getWishlist(), [tick]);
  const pantry = useMemo(() => getPantry(), [tick]);
  const stores = useMemo(() => getStores(), [tick]);
  const history = useMemo(() => getHistory(), [tick]);
  const recommendations = useMemo(() => getAIRecommendations(), [tick]);

  // Selected list for grocery lists tab
  const [selectedListId, setSelectedListId] = useState<string>(lists[0]?.id ?? "");
  const selectedList = useMemo(
    () => lists.find((l) => l.id === selectedListId) ?? null,
    [lists, selectedListId]
  );

  // Auto-select first list if current selection removed
  if (!selectedList && lists.length > 0 && selectedListId !== lists[0].id) {
    setSelectedListId(lists[0].id);
  }

  // Add-list state
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Add-item state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemCat, setNewItemCat] = useState<GroceryCategory>("Produce");

  // Add-wishlist state
  const [showAddWish, setShowAddWish] = useState(false);
  const [newWishName, setNewWishName] = useState("");
  const [newWishPrice, setNewWishPrice] = useState("");
  const [newWishLink, setNewWishLink] = useState("");
  const [newWishPriority, setNewWishPriority] = useState<Priority>("medium");

  // Add-pantry state
  const [showAddPantry, setShowAddPantry] = useState(false);
  const [newPantryName, setNewPantryName] = useState("");
  const [newPantryQty, setNewPantryQty] = useState(1);
  const [newPantryUnit, setNewPantryUnit] = useState("");
  const [newPantryCat, setNewPantryCat] = useState<GroceryCategory>("Pantry");

  // Add-store state
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreType, setNewStoreType] = useState<StoreType["type"]>("grocery");

  // Handlers
  const handleAddList = () => {
    if (!newListName.trim()) return;
    const list = addGroceryList(newListName.trim());
    setSelectedListId(list.id);
    setNewListName("");
    setShowAddList(false);
    refresh();
  };

  const handleDeleteList = (id: string) => {
    deleteGroceryList(id);
    refresh();
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !selectedList) return;
    addGroceryItem(selectedList.id, {
      name: newItemName.trim(),
      quantity: newItemQty,
      category: newItemCat,
    });
    setNewItemName("");
    setNewItemQty(1);
    setNewItemCat("Produce");
    setShowAddItem(false);
    refresh();
  };

  const handleToggleItem = (itemId: string) => {
    if (!selectedList) return;
    toggleGroceryItem(selectedList.id, itemId);
    refresh();
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedList) return;
    deleteGroceryItem(selectedList.id, itemId);
    refresh();
  };

  const handleAddToGroceryList = (name: string, cat: GroceryCategory) => {
    // Add to currently selected list or auto-create "Quick List"
    let targetList = selectedList;
    if (!targetList) {
      targetList = addGroceryList("Quick List");
      setSelectedListId(targetList.id);
    }
    addGroceryItem(targetList.id, { name, quantity: 1, category: cat });
    refresh();
    setActiveTab("lists");
  };

  const handleToggleShared = (id: string) => {
    toggleListShared(id);
    refresh();
  };

  const handleAddWish = () => {
    if (!newWishName.trim()) return;
    addWishlistItem({
      name: newWishName.trim(),
      price: newWishPrice ? parseFloat(newWishPrice) : undefined,
      link: newWishLink.trim() || undefined,
      priority: newWishPriority,
    });
    setNewWishName("");
    setNewWishPrice("");
    setNewWishLink("");
    setNewWishPriority("medium");
    setShowAddWish(false);
    refresh();
  };

  const handleAddPantryItem = () => {
    if (!newPantryName.trim()) return;
    addPantryItem({
      name: newPantryName.trim(),
      quantity: newPantryQty,
      unit: newPantryUnit.trim() || undefined,
      category: newPantryCat,
      lowStock: newPantryQty <= 1,
    });
    setNewPantryName("");
    setNewPantryQty(1);
    setNewPantryUnit("");
    setNewPantryCat("Pantry");
    setShowAddPantry(false);
    refresh();
  };

  const handleAddStore = () => {
    if (!newStoreName.trim()) return;
    addStore({ name: newStoreName.trim(), type: newStoreType });
    setNewStoreName("");
    setNewStoreType("grocery");
    setShowAddStore(false);
    refresh();
  };

  const sortedWishlist = useMemo(
    () => [...wishlist].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [wishlist]
  );

  const historyByDate = useMemo(() => groupHistoryByDate(history), [history]);

  // Category-grouped items for selected list
  const categorizedItems = useMemo(() => {
    if (!selectedList) return new Map<GroceryCategory, GroceryItem[]>();
    return groupByCategory(sortItems(selectedList.items));
  }, [selectedList]);

  const uncheckedCount = selectedList
    ? selectedList.items.filter((i) => !i.checked).length
    : 0;
  const checkedCount = selectedList
    ? selectedList.items.filter((i) => i.checked).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
            <ShoppingCart className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">
              Shopping
            </h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              Grocery lists, wishlists, pantry tracker, and smart recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-800/50 dark:bg-violet-950/30">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-300">
              AI Suggestions
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec) => (
              <button
                key={rec.id}
                onClick={() => handleAddToGroceryList(rec.name, rec.category)}
                className="group flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-sm transition-all hover:border-violet-400 hover:shadow-sm dark:border-violet-800 dark:bg-surface-900 dark:hover:border-violet-600"
              >
                <span className="text-xs">{CATEGORY_EMOJI[rec.category]}</span>
                <span className="font-medium text-surface-900 dark:text-surface-100">{rec.name}</span>
                <span className="hidden text-xs text-surface-400 group-hover:inline">+ Add</span>
                <span className="ml-auto rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                  {rec.confidence}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-surface-100"
                : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* ============================================= */}
        {/* GROCERY LISTS TAB                            */}
        {/* ============================================= */}
        {activeTab === "lists" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
            {/* List Sidebar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">My Lists</h3>
                <button
                  onClick={() => setShowAddList(true)}
                  className="flex size-7 items-center justify-center rounded-lg text-violet-500 transition-colors hover:bg-violet-50 dark:hover:bg-violet-900/30"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              {showAddList && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name..."
                    className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddList(); if (e.key === "Escape") setShowAddList(false); }}
                    autoFocus
                  />
                  <button onClick={handleAddList} className="rounded-lg bg-violet-500 px-2 py-1.5 text-white hover:bg-violet-600"><Check className="size-4" /></button>
                  <button onClick={() => setShowAddList(false)} className="rounded-lg bg-surface-200 px-2 py-1.5 text-surface-600 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-400"><X className="size-4" /></button>
                </div>
              )}

              <div className="space-y-1">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      selectedListId === list.id
                        ? "bg-violet-50 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200"
                        : "text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                    }`}
                  >
                    <ShoppingBag className="size-4 shrink-0" />
                    <span className="flex-1 truncate font-medium">{list.name}</span>
                    {list.shared && <Users className="size-3 text-violet-500" />}
                    <span className="text-xs text-surface-400">
                      {list.items.filter((i) => !i.checked).length}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                      className="ml-1 rounded p-0.5 text-surface-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-surface-600 dark:hover:bg-red-900/30"
                      style={{ opacity: undefined }}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </button>
                ))}
                {lists.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-surface-400">
                    No lists yet. Create one to get started.
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              {selectedList && (
                <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-surface-500 dark:text-surface-400">Items</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-100">{selectedList.items.length}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-surface-500 dark:text-surface-400">Remaining</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">{uncheckedCount}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-surface-500 dark:text-surface-400">Done</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{checkedCount}</span>
                  </div>
                  {selectedList.items.length > 0 && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{ width: `${selectedList.items.length > 0 ? Math.round((checkedCount / selectedList.items.length) * 100) : 0}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List Items */}
            <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
              {selectedList ? (
                <>
                  {/* List Header */}
                  <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                        {selectedList.name}
                      </h3>
                      <button
                        onClick={() => handleToggleShared(selectedList.id)}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                          selectedList.shared
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                            : "bg-surface-100 text-surface-500 hover:text-violet-600 dark:bg-surface-800 dark:text-surface-400"
                        }`}
                      >
                        {selectedList.shared ? <Users className="size-3" /> : <Share2 className="size-3" />}
                        {selectedList.shared ? "Shared" : "Private"}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-600"
                    >
                      <Plus className="size-4" />
                      Add Item
                    </button>
                  </div>

                  {/* Add Item Form */}
                  {showAddItem && (
                    <div className="border-b border-surface-100 bg-surface-50/50 px-5 py-4 dark:border-surface-800 dark:bg-surface-900/50">
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Item name..."
                          className="min-w-[200px] flex-1 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); if (e.key === "Escape") setShowAddItem(false); }}
                          autoFocus
                        />
                        <input
                          type="number"
                          value={newItemQty}
                          onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                          min={1}
                        />
                        <select
                          value={newItemCat}
                          onChange={(e) => setNewItemCat(e.target.value as GroceryCategory)}
                          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
                        >
                          {GROCERY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {cat}</option>
                          ))}
                        </select>
                        <button onClick={handleAddItem} className="rounded-lg bg-violet-500 px-3 py-1.5 text-white hover:bg-violet-600"><Check className="size-4" /></button>
                        <button onClick={() => setShowAddItem(false)} className="rounded-lg bg-surface-200 px-3 py-1.5 text-surface-600 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-400"><X className="size-4" /></button>
                      </div>
                    </div>
                  )}

                  {/* Categorized Items */}
                  <div className="divide-y divide-surface-100 dark:divide-surface-800">
                    {selectedList.items.length === 0 ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <ShoppingCart className="mb-3 size-10 text-surface-300 dark:text-surface-600" />
                        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">No items yet</p>
                        <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
                          Add your first grocery item above.
                        </p>
                      </div>
                    ) : (
                      Array.from(categorizedItems.entries()).map(([category, items]) => (
                        <div key={category} className="py-2">
                          <div className="flex items-center gap-2 px-5 py-1.5">
                            <span className="text-sm">{CATEGORY_EMOJI[category]}</span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                              {category}
                            </span>
                            <span className="text-[10px] text-surface-300 dark:text-surface-600">
                              {items.length}
                            </span>
                          </div>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`group flex items-center gap-3 px-5 py-2 transition-colors ${
                                item.checked
                                  ? "opacity-60"
                                  : "hover:bg-surface-50 dark:hover:bg-surface-800/50"
                              }`}
                            >
                              <button
                                onClick={() => handleToggleItem(item.id)}
                                className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                  item.checked
                                    ? "border-violet-500 bg-violet-500 text-white"
                                    : "border-surface-300 hover:border-violet-400 dark:border-surface-600"
                                }`}
                              >
                                {item.checked && <Check className="size-3" />}
                              </button>
                              <span
                                className={`flex-1 text-sm ${
                                  item.checked
                                    ? "text-surface-400 line-through dark:text-surface-500"
                                    : "font-medium text-surface-900 dark:text-surface-100"
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="text-xs text-surface-400 dark:text-surface-500">
                                {item.quantity > 1 ? `×${item.quantity}` : ""}
                              </span>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="rounded p-1 text-surface-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-surface-600 dark:hover:bg-red-900/30"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <List className="mb-3 size-10 text-surface-300 dark:text-surface-600" />
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">No list selected</p>
                  <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
                    Create or select a grocery list to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* WISHLIST TAB                                 */}
        {/* ============================================= */}
        {activeTab === "wishlist" && (
          <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-pink-500" />
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">Wishlist</h3>
                <span className="text-xs text-surface-400">{wishlist.length} items</span>
              </div>
              <button
                onClick={() => setShowAddWish(true)}
                className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>

            {showAddWish && (
              <div className="border-b border-surface-100 bg-surface-50/50 px-5 py-4 dark:border-surface-800 dark:bg-surface-900/50">
                <div className="flex flex-wrap gap-2">
                  <input type="text" value={newWishName} onChange={(e) => setNewWishName(e.target.value)} placeholder="Item name..." className="min-w-[180px] flex-1 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" onKeyDown={(e) => { if (e.key === "Enter") handleAddWish(); if (e.key === "Escape") setShowAddWish(false); }} autoFocus />
                  <input type="number" value={newWishPrice} onChange={(e) => setNewWishPrice(e.target.value)} placeholder="Price" className="w-24 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" step="0.01" />
                  <input type="text" value={newWishLink} onChange={(e) => setNewWishLink(e.target.value)} placeholder="Link (optional)" className="w-40 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" />
                  <select value={newWishPriority} onChange={(e) => setNewWishPriority(e.target.value as Priority)} className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100">
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">⚪ Low</option>
                  </select>
                  <button onClick={handleAddWish} className="rounded-lg bg-violet-500 px-3 py-1.5 text-white hover:bg-violet-600"><Check className="size-4" /></button>
                  <button onClick={() => setShowAddWish(false)} className="rounded-lg bg-surface-200 px-3 py-1.5 text-surface-600 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-400"><X className="size-4" /></button>
                </div>
              </div>
            )}

            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {sortedWishlist.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Heart className="mb-3 size-10 text-surface-300 dark:text-surface-600" />
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Your wishlist is empty</p>
                  <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">Add items you'd like to buy.</p>
                </div>
              ) : (
                sortedWishlist.map((item) => (
                  <div key={item.id} className={`group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 ${item.purchased ? "opacity-50" : ""}`}>
                    <button
                      onClick={() => toggleWishlistPurchased(item.id)}
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        item.purchased
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-surface-300 hover:border-violet-400 dark:border-surface-600"
                      }`}
                    >
                      {item.purchased && <Check className="size-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${item.purchased ? "text-surface-400 line-through dark:text-surface-500" : "font-medium text-surface-900 dark:text-surface-100"}`}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-surface-400">
                        {item.price !== undefined && (
                          <span className="font-medium text-surface-600 dark:text-surface-300">${item.price.toFixed(2)}</span>
                        )}
                        <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: PRIORITY_COLORS[item.priority] + "20", color: PRIORITY_COLORS[item.priority] }}>
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-surface-400 hover:text-violet-500 dark:hover:text-violet-400">
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                      <button onClick={() => handleAddToGroceryList(item.name, "Other")} className="rounded p-1.5 text-surface-400 hover:text-violet-500 dark:hover:text-violet-400" title="Add to grocery list">
                        <ShoppingCart className="size-3.5" />
                      </button>
                      <button onClick={() => deleteWishlistItem(item.id)} className="rounded p-1.5 text-surface-400 hover:text-red-500 dark:hover:text-red-400">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* PANTRY TAB                                   */}
        {/* ============================================= */}
        {activeTab === "pantry" && (
          <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-amber-500" />
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">Pantry Inventory</h3>
                <span className="text-xs text-surface-400">{pantry.length} items</span>
              </div>
              <button
                onClick={() => setShowAddPantry(true)}
                className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>

            {showAddPantry && (
              <div className="border-b border-surface-100 bg-surface-50/50 px-5 py-4 dark:border-surface-800 dark:bg-surface-900/50">
                <div className="flex flex-wrap gap-2">
                  <input type="text" value={newPantryName} onChange={(e) => setNewPantryName(e.target.value)} placeholder="Item name..." className="min-w-[180px] flex-1 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" onKeyDown={(e) => { if (e.key === "Enter") handleAddPantryItem(); if (e.key === "Escape") setShowAddPantry(false); }} autoFocus />
                  <input type="number" value={newPantryQty} onChange={(e) => setNewPantryQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-20 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" min={0} />
                  <input type="text" value={newPantryUnit} onChange={(e) => setNewPantryUnit(e.target.value)} placeholder="Unit (e.g. lb)" className="w-28 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" />
                  <select value={newPantryCat} onChange={(e) => setNewPantryCat(e.target.value as GroceryCategory)} className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100">
                    {GROCERY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {cat}</option>
                    ))}
                  </select>
                  <button onClick={handleAddPantryItem} className="rounded-lg bg-violet-500 px-3 py-1.5 text-white hover:bg-violet-600"><Check className="size-4" /></button>
                  <button onClick={() => setShowAddPantry(false)} className="rounded-lg bg-surface-200 px-3 py-1.5 text-surface-600 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-400"><X className="size-4" /></button>
                </div>
              </div>
            )}

            {/* Low stock warning section */}
            {pantry.filter((p) => p.lowStock).length > 0 && (
              <div className="mx-5 mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm dark:border-amber-800/50 dark:bg-amber-950/30">
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                <span className="text-amber-800 dark:text-amber-300">
                  <strong>{pantry.filter((p) => p.lowStock).length}</strong> items running low
                </span>
              </div>
            )}

            <div className="divide-y divide-surface-100 p-4 dark:divide-surface-800">
              {pantry.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Package className="mb-3 size-10 text-surface-300 dark:text-surface-600" />
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Pantry is empty</p>
                  <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">Track what you have at home.</p>
                </div>
              ) : (
                pantry.map((item) => (
                  <div key={item.id} className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="text-lg">{CATEGORY_EMOJI[item.category]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.name}</span>
                        {item.lowStock && (
                          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            Low
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-surface-400 dark:text-surface-500">
                        {item.quantity} {item.unit ?? "units"}
                        {item.expiryDate && (
                          <> &middot; <span className="text-amber-600 dark:text-amber-400">Expires {new Date(item.expiryDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleAddToGroceryList(item.name, item.category)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/30"
                        title="Add to grocery list"
                      >
                        + List
                      </button>
                      <button onClick={() => deletePantryItem(item.id)} className="rounded p-1 text-surface-400 hover:text-red-500 dark:hover:text-red-400">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* HISTORY TAB                                  */}
        {/* ============================================= */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-4 dark:border-surface-800">
              <Clock className="size-5 text-blue-500" />
              <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">Shopping History</h3>
              <span className="text-xs text-surface-400">{history.length} purchases</span>
            </div>
            <div className="divide-y divide-surface-100 p-4 dark:divide-surface-800">
              {history.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Clock className="mb-3 size-10 text-surface-300 dark:text-surface-600" />
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">No history yet</p>
                  <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">Check off items from your lists to build history.</p>
                </div>
              ) : (
                Array.from(historyByDate.entries()).map(([date, items]) => (
                  <div key={date} className="py-3 first:pt-0 last:pb-0">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                        {formatDate(date)}
                      </h4>
                      <span className="text-[10px] text-surface-300 dark:text-surface-600">
                        {items.length} items
                      </span>
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="group flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                          <span className="text-sm">{CATEGORY_EMOJI[item.category]}</span>
                          <span className="flex-1 text-sm text-surface-700 dark:text-surface-300">{item.name}</span>
                          <span className="text-xs text-surface-400">{item.category}</span>
                          {item.listName && (
                            <span className="hidden text-xs text-surface-400 sm:inline">from {item.listName}</span>
                          )}
                          <button
                            onClick={() => handleAddToGroceryList(item.name, item.category)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 opacity-0 transition-all hover:bg-violet-50 group-hover:opacity-100 dark:text-violet-400 dark:hover:bg-violet-900/30"
                          >
                            <RefreshCw className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================= */}
        {/* STORES TAB                                   */}
        {/* ============================================= */}
        {activeTab === "stores" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
              <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
                <div className="flex items-center gap-2">
                  <Store className="size-5 text-violet-500" />
                  <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">Favorite Stores</h3>
                  <span className="text-xs text-surface-400">{stores.length}</span>
                </div>
                <button
                  onClick={() => setShowAddStore(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
                >
                  <Plus className="size-4" /> Add Store
                </button>
              </div>

              {showAddStore && (
                <div className="border-b border-surface-100 bg-surface-50/50 px-5 py-4 dark:border-surface-800 dark:bg-surface-900/50">
                  <div className="flex flex-wrap gap-2">
                    <input type="text" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} placeholder="Store name..." className="min-w-[200px] flex-1 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100" onKeyDown={(e) => { if (e.key === "Enter") handleAddStore(); if (e.key === "Escape") setShowAddStore(false); }} autoFocus />
                    <select value={newStoreType} onChange={(e) => setNewStoreType(e.target.value as StoreType["type"])} className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100">
                      {Object.entries(STORE_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <button onClick={handleAddStore} className="rounded-lg bg-violet-500 px-3 py-1.5 text-white hover:bg-violet-600"><Check className="size-4" /></button>
                    <button onClick={() => setShowAddStore(false)} className="rounded-lg bg-surface-200 px-3 py-1.5 text-surface-600 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-400"><X className="size-4" /></button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-surface-100 p-4 dark:divide-surface-800">
                {stores.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Store className="mb-3 size-10 text-surface-300 dark:text-surface-600" />
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">No stores saved</p>
                    <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">Add your favorite stores for quick access.</p>
                  </div>
                ) : (
                  stores.map((store) => (
                    <div key={store.id} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                        <Store className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{store.name}</span>
                        <div className="text-xs text-surface-400 dark:text-surface-500">
                          {STORE_TYPE_LABELS[store.type]}
                          {store.notes && <span className="ml-2 text-surface-300">— {store.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const list = addGroceryList(store.name);
                            setSelectedListId(list.id);
                            setActiveTab("lists");
                            refresh();
                          }}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium text-violet-600 opacity-0 transition-all hover:bg-violet-50 group-hover:opacity-100 dark:text-violet-400 dark:hover:bg-violet-900/30"
                        >
                          Quick List
                        </button>
                        <button onClick={() => deleteStore(store.id)} className="rounded p-1 text-surface-400 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 dark:hover:text-red-400">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
