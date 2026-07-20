import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  FileText, Plus, Search, X, Trash2, Edit3,
  Tag, Calendar, FolderOpen, Shield, Upload,
  FileImage, ChevronRight, Sparkles,
} from "lucide-react";
import type {
  Document,
  DocumentCategory,
  FileType,
} from "~/types/documents";
import {
  DOCUMENT_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  FILE_TYPE_ICONS,
  FILE_TYPE_LABELS,
} from "~/types/documents";
import {
  getDocuments,
  getDocumentById,
  addDocument,
  updateDocument,
  deleteDocument,
  getRecentlyAdded,
  getCategoryStats,
  searchDocuments,
} from "~/data/documents";

export const Route = createFileRoute("/documents")({ component: DocumentsPage });

// ── Helpers ────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeDate(dateStr: string): string {
  const input = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffMs = now.getTime() - input.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ── Add/Edit Document Modal ─────────────────────────────
function DocumentFormModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    category: DocumentCategory;
    description: string;
    dateAdded: string;
    tags: string[];
    fileType: FileType;
  }) => void;
  initial?: Document;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<DocumentCategory>(initial?.category ?? "other");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dateAdded, setDateAdded] = useState(initial?.dateAdded ?? new Date().toISOString().split("T")[0]);
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");
  const [fileType, setFileType] = useState<FileType>(initial?.fileType ?? "other");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ title: title.trim(), category, description: description.trim(), dateAdded, tags, fileType });
    // reset
    setTitle("");
    setCategory("other");
    setDescription("");
    setDateAdded(new Date().toISOString().split("T")[0]);
    setTagsInput("");
    setFileType("other");
  };

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-surface-900 border border-surface-200 dark:border-surface-800 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {isEdit ? "Edit Document" : "Add Document"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Passport, Insurance Card, Lease Agreement..."
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
              required
            />
          </div>

          {/* Category + File Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                File Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as FileType)}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
              >
                {(["pdf", "jpg", "doc", "xls", "txt", "other"] as FileType[]).map((ft) => (
                  <option key={ft} value={ft}>
                    {FILE_TYPE_ICONS[ft]} {FILE_TYPE_LABELS[ft]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document..."
              rows={2}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Date
            </label>
            <input
              type="date"
              value={dateAdded}
              onChange={(e) => setDateAdded(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Tags
              <span className="ml-1 text-xs text-surface-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. travel, insurance, personal"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
            />
          </div>

          {/* File Upload Placeholder */}
          <div className="rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 p-4 text-center dark:border-surface-700 dark:bg-surface-800/50">
            <Upload className="mx-auto size-6 text-surface-400" />
            <p className="mt-2 text-xs text-surface-500">
              File upload coming soon. OCR and automatic filing will be supported.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
            >
              {isEdit ? "Save Changes" : "Add Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Modal ────────────────────────────────────────
function DetailModal({
  doc,
  onClose,
  onEdit,
  onDelete,
}: {
  doc: Document;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = CATEGORY_COLORS[doc.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-sky-50 text-2xl dark:bg-sky-950/40">
              {CATEGORY_ICONS[doc.category]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {doc.title}
              </h3>
              <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.badge}`}>
                {CATEGORY_LABELS[doc.category]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Description */}
        {doc.description && (
          <p className="mb-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            {doc.description}
          </p>
        )}

        {/* Meta */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <Calendar className="size-4" />
            <span>Added {formatDate(doc.dateAdded)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <FileImage className="size-4" />
            <span>{FILE_TYPE_ICONS[doc.fileType]} {FILE_TYPE_LABELS[doc.fileType]}</span>
          </div>
          {doc.tags.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-surface-500 dark:text-surface-400">
              <Tag className="size-4 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-surface-100 px-2 py-0.5 text-xs dark:bg-surface-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            <Edit3 className="size-4" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document Card ────────────────────────────────────────
function DocumentCard({
  doc,
  onClick,
}: {
  doc: Document;
  onClick: () => void;
}) {
  const colors = CATEGORY_COLORS[doc.category];

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-surface-200 bg-white p-5 text-left transition-all hover:border-sky-200 hover:shadow-lg dark:border-surface-800 dark:bg-surface-900 dark:hover:border-sky-800 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xl ${colors.bg}`}>
          {CATEGORY_ICONS[doc.category]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-surface-900 dark:text-surface-100 truncate text-sm">
              {doc.title}
            </h4>
            <ChevronRight className="size-4 shrink-0 text-surface-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-surface-600" />
          </div>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400 line-clamp-2">
            {doc.description || "No description"}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}>
              {CATEGORY_LABELS[doc.category]}
            </span>
            <span className="text-[10px] text-surface-400 dark:text-surface-500">
              {FILE_TYPE_ICONS[doc.fileType]} {FILE_TYPE_LABELS[doc.fileType]}
            </span>
            <span className="text-[10px] text-surface-400 dark:text-surface-500">
              {relativeDate(doc.dateAdded)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────
function DocumentsPage() {
  const [refresh, setRefresh] = useState(0);
  const reload = useCallback(() => setRefresh((r) => r + 1), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | undefined>(undefined);

  const [detailDoc, setDetailDoc] = useState<Document | undefined>(undefined);

  // ── Derived data ──────────────────────────────────────
  const documents = useMemo(() => {
    let docs = searchQuery.trim()
      ? searchDocuments(searchQuery)
      : getDocuments();
    if (selectedCategory !== "all") {
      docs = docs.filter((d) => d.category === selectedCategory);
    }
    return docs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, searchQuery, selectedCategory]);

  const totalDocs = useMemo(() => getDocuments().length, [refresh]);
  const categoryStats = useMemo(() => getCategoryStats(), [refresh]);
  const recentDocs = useMemo(() => getRecentlyAdded(5), [refresh]);

  // ── Handlers ──────────────────────────────────────────
  const handleAdd = useCallback(
    (data: {
      title: string;
      category: DocumentCategory;
      description: string;
      dateAdded: string;
      tags: string[];
      fileType: FileType;
    }) => {
      addDocument(data);
      setFormOpen(false);
      reload();
    },
    [reload]
  );

  const handleUpdate = useCallback(
    (data: {
      title: string;
      category: DocumentCategory;
      description: string;
      dateAdded: string;
      tags: string[];
      fileType: FileType;
    }) => {
      if (editingDoc) {
        updateDocument(editingDoc.id, data);
        setEditingDoc(undefined);
        reload();
      }
    },
    [editingDoc, reload]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteDocument(id);
      setDetailDoc(undefined);
      reload();
    },
    [reload]
  );

  const openEdit = useCallback((doc: Document) => {
    setEditingDoc(doc);
    setFormOpen(true);
  }, []);

  // ── Render ────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            Documents
          </h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Secure vault for all your important files and documents.
          </p>
        </div>
        <button
          onClick={() => { setEditingDoc(undefined); setFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors shadow-sm"
        >
          <Plus className="size-4" />
          Add Document
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mb-1">
            <FileText className="size-3.5" />
            Total
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100">
            {totalDocs}
          </p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mb-1">
            <FolderOpen className="size-3.5" />
            Categories
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100">
            {categoryStats.length}
          </p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mb-1">
            <Tag className="size-3.5" />
            Recent
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100">
            {recentDocs.length}
          </p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mb-1">
            <Shield className="size-3.5" />
            Encrypted
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ✓
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        {/* AI Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents... try &ldquo;find my insurance card&rdquo; or &ldquo;show vehicle title&rdquo;"
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              <X className="size-4" />
            </button>
          )}
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 dark:bg-sky-950/40 pointer-events-none">
            <Sparkles className="size-3 text-sky-500" />
            <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400">AI</span>
          </div>
          {searchQuery && (
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ marginLeft: "-9999px" }}
            />
          )}
          {/* Re-position sparkles when search is active */}
          {searchQuery && (
            <div className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 dark:bg-sky-950/40 pointer-events-none">
              <Sparkles className="size-3 text-sky-500" />
              <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400">AI</span>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="-mx-1 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-sky-500 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
            }`}
          >
            All
          </button>
          {DOCUMENT_CATEGORIES.map((cat) => {
            const stat = categoryStats.find((s) => s.category === cat);
            const count = stat?.count ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "bg-sky-500 text-white"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className={`ml-0.5 rounded-full px-1.5 py-0 text-[10px] ${
                  selectedCategory === cat
                    ? "bg-white/20"
                    : "bg-surface-200 dark:bg-surface-700"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
            <FileText className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {searchQuery || selectedCategory !== "all" ? "No documents match your filters" : "No documents yet"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or category filter."
              : "Add your first document — passports, insurance cards, contracts, and more."}
          </p>
          {!searchQuery && selectedCategory === "all" && (
            <button
              onClick={() => { setEditingDoc(undefined); setFormOpen(true); }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
            >
              <Plus className="size-4" />
              Add Your First Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onClick={() => setDetailDoc(doc)} />
          ))}
        </div>
      )}

      {/* Modals */}
      <DocumentFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDoc(undefined); }}
        onSave={editingDoc ? handleUpdate : handleAdd}
        initial={editingDoc}
      />

      {detailDoc && (
        <DetailModal
          doc={detailDoc}
          onClose={() => setDetailDoc(undefined)}
          onEdit={() => openEdit(detailDoc)}
          onDelete={() => handleDelete(detailDoc.id)}
        />
      )}
    </div>
  );
}
