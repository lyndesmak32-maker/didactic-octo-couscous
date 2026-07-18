import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 text-white shadow-md shadow-accent-500/25">
        <Sparkles className="size-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-surface-100 px-4 py-3 dark:bg-surface-800">
        <div className="flex items-center gap-1">
          <span
            className="inline-block size-2 rounded-full bg-accent-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="inline-block size-2 rounded-full bg-accent-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="inline-block size-2 rounded-full bg-accent-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
