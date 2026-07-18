import { Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
  suggestions: string[];
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ suggestions, onSelect }: SuggestedPromptsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      <Sparkles className="size-3.5 text-accent-400 shrink-0" />
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="rounded-full border border-accent-200 bg-white px-3 py-1 text-xs font-medium text-accent-700 transition-all hover:bg-accent-50 hover:border-accent-300 hover:shadow-sm dark:border-accent-800 dark:bg-surface-800 dark:text-accent-300 dark:hover:bg-accent-950/50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
