// ── Document Categories ──────────────────────────────────
export type DocumentCategory =
  | "ids-passports"
  | "insurance"
  | "vehicle"
  | "medical"
  | "receipts"
  | "tax"
  | "contracts"
  | "warranties"
  | "other";

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "ids-passports",
  "insurance",
  "vehicle",
  "medical",
  "receipts",
  "tax",
  "contracts",
  "warranties",
  "other",
];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  "ids-passports": "IDs & Passports",
  insurance: "Insurance",
  vehicle: "Vehicle",
  medical: "Medical Records",
  receipts: "Receipts",
  tax: "Tax Forms",
  contracts: "Contracts",
  warranties: "Warranties",
  other: "Other",
};

export const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  "ids-passports": "🪪",
  insurance: "🛡️",
  vehicle: "🚗",
  medical: "🏥",
  receipts: "🧾",
  tax: "📊",
  contracts: "📝",
  warranties: "📜",
  other: "📄",
};

export const CATEGORY_COLORS: Record<DocumentCategory, { bg: string; text: string; badge: string }> = {
  "ids-passports": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" },
  insurance: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300", badge: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" },
  vehicle: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300" },
  medical: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" },
  receipts: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" },
  tax: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" },
  contracts: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", badge: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" },
  warranties: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", badge: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300" },
  other: { bg: "bg-surface-100 dark:bg-surface-800", text: "text-surface-600 dark:text-surface-400", badge: "bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400" },
};

// ── File Type ────────────────────────────────────────────
export type FileType = "pdf" | "jpg" | "png" | "doc" | "xls" | "txt" | "other";

export const FILE_TYPE_ICONS: Record<FileType, string> = {
  pdf: "📕",
  jpg: "🖼️",
  png: "🖼️",
  doc: "📘",
  xls: "📗",
  txt: "📄",
  other: "📎",
};

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: "PDF",
  jpg: "Image",
  png: "Image",
  doc: "Document",
  xls: "Spreadsheet",
  txt: "Text",
  other: "File",
};

// ── Document ─────────────────────────────────────────────
export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  dateAdded: string; // ISO date
  tags: string[];
  fileType: FileType;
  fileUrl: string; // placeholder URL or data URI
}

// ── Documents Data ────────────────────────────────────────
export interface DocumentsData {
  documents: Document[];
}
