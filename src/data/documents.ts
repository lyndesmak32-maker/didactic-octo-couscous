import type {
  Document,
  DocumentCategory,
  DocumentsData,
} from "~/types/documents";

const STORAGE_KEY = "lifeos-documents";

// ── Helpers ────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().split("T")[0];
}

// ── Seed Data ──────────────────────────────────────────
function createSeedData(): DocumentsData {
  return {
    documents: [
      {
        id: "doc-1",
        title: "U.S. Passport",
        category: "ids-passports",
        description: "Current U.S. passport book. Valid for international travel.",
        dateAdded: monthsAgo(6),
        tags: ["travel", "identification", "government"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-2",
        title: "Driver's License",
        category: "ids-passports",
        description: "State-issued driver's license. Expires March 2028.",
        dateAdded: monthsAgo(14),
        tags: ["identification", "driving", "government"],
        fileType: "jpg",
        fileUrl: "",
      },
      {
        id: "doc-3",
        title: "Health Insurance Card — Aetna",
        category: "insurance",
        description: "Health insurance member ID card. Group #84721. Primary care coverage.",
        dateAdded: monthsAgo(3),
        tags: ["health", "insurance", "medical"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-4",
        title: "Auto Insurance Policy — Geico",
        category: "insurance",
        description: "Full coverage auto insurance policy. 2024 Honda CR-V. Renews annually in October.",
        dateAdded: monthsAgo(10),
        tags: ["car", "insurance", "coverage"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-5",
        title: "Honda CR-V Registration",
        category: "vehicle",
        description: "Vehicle registration for 2024 Honda CR-V EX-L. Renewal due December 2026.",
        dateAdded: monthsAgo(6),
        tags: ["car", "registration", "DMV"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-6",
        title: "Annual Physical Results",
        category: "medical",
        description: "Blood work and physical exam results from Dr. Chen. All markers in normal range.",
        dateAdded: daysAgo(45),
        tags: ["health", "lab results", "annual checkup"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-7",
        title: "Home Depot Purchase — Patio Set",
        category: "receipts",
        description: "Receipt for outdoor patio furniture set. $849.99. 2-year warranty included.",
        dateAdded: daysAgo(20),
        tags: ["home", "furniture", "purchase"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-8",
        title: "2025 Tax Return",
        category: "tax",
        description: "Federal and state tax returns for 2025 tax year. Filed April 2026.",
        dateAdded: monthsAgo(4),
        tags: ["IRS", "federal", "state", "filing"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-9",
        title: "Employment Contract — LifeOS Inc.",
        category: "contracts",
        description: "Signed employment agreement. Full-time, salaried position. Includes non-compete clause.",
        dateAdded: monthsAgo(18),
        tags: ["work", "legal", "HR"],
        fileType: "pdf",
        fileUrl: "",
      },
      {
        id: "doc-10",
        title: "MacBook Pro Warranty",
        category: "warranties",
        description: "AppleCare+ extended warranty for MacBook Pro 16\". Coverage through June 2028.",
        dateAdded: monthsAgo(11),
        tags: ["electronics", "apple", "coverage"],
        fileType: "pdf",
        fileUrl: "",
      },
    ],
  };
}

// ── Persistence ──────────────────────────────────────────
function loadData(): DocumentsData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DocumentsData;
  } catch {
    // corrupted data
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: DocumentsData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: DocumentsData | null = null;
function getData(): DocumentsData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 100;
function genId(): string {
  _idCounter++;
  return `doc-${Date.now()}-${_idCounter}`;
}

// ── Public API ──────────────────────────────────────────
export function getDocuments(): Document[] {
  return getData().documents;
}

export function getDocumentById(id: string): Document | undefined {
  return getData().documents.find((d) => d.id === id);
}

export function addDocument(data: {
  title: string;
  category: DocumentCategory;
  description: string;
  dateAdded: string;
  tags: string[];
  fileType?: Document["fileType"];
  fileUrl?: string;
}): Document {
  const store = getData();
  const doc: Document = {
    id: genId(),
    title: data.title,
    category: data.category,
    description: data.description,
    dateAdded: data.dateAdded,
    tags: data.tags,
    fileType: data.fileType ?? "other",
    fileUrl: data.fileUrl ?? "",
  };
  store.documents.unshift(doc);
  persist();
  return doc;
}

export function updateDocument(
  id: string,
  data: Partial<Omit<Document, "id">>
): Document | null {
  const store = getData();
  const idx = store.documents.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  store.documents[idx] = { ...store.documents[idx], ...data };
  persist();
  return store.documents[idx];
}

export function deleteDocument(id: string): boolean {
  const store = getData();
  const len = store.documents.length;
  store.documents = store.documents.filter((d) => d.id !== id);
  if (store.documents.length !== len) {
    persist();
    return true;
  }
  return false;
}

export function getDocumentsByCategory(category: DocumentCategory): Document[] {
  return getData().documents.filter((d) => d.category === category);
}

export function getRecentlyAdded(limit = 5): Document[] {
  return [...getData().documents]
    .sort((a, b) => (b.dateAdded > a.dateAdded ? 1 : -1))
    .slice(0, limit);
}

export function getCategoryStats(): { category: DocumentCategory; count: number }[] {
  const docs = getData().documents;
  const map = new Map<DocumentCategory, number>();
  for (const doc of docs) {
    map.set(doc.category, (map.get(doc.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function searchDocuments(query: string): Document[] {
  const q = query.toLowerCase().trim();
  if (!q) return getData().documents;
  const docs = getData().documents;
  return docs.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
  );
}

// ── Reset ────────────────────────────────────────────────
export function resetDocumentsData(): void {
  _cache = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
