import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/documents")({ component: DocumentsPage });

function DocumentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Documents</h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Secure vault for all your important files and documents.</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
          <FileText className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Document Vault</h3>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          Encrypted storage for passports, contracts, receipts, and important documents with AI search.
        </p>
      </div>
    </div>
  );
}
