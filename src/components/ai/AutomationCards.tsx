import { X, Bell } from "lucide-react";
import type { AutomationCard } from "~/ai/automation";
import { dismissAutomation } from "~/ai/automation";
import { useState } from "react";

interface AutomationCardsProps {
  automations: AutomationCard[];
  onAction: (prompt: string) => void;
}

const typeStyles: Record<
  AutomationCard["type"],
  { border: string; bg: string; iconBg: string }
> = {
  warning: {
    border:
      "border-amber-200 dark:border-amber-800",
    bg: "from-amber-50 to-white dark:from-amber-950/20 dark:to-surface-900",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
  },
  info: {
    border:
      "border-blue-200 dark:border-blue-800",
    bg: "from-blue-50 to-white dark:from-blue-950/20 dark:to-surface-900",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
  },
  tip: {
    border:
      "border-emerald-200 dark:border-emerald-800",
    bg: "from-emerald-50 to-white dark:from-emerald-950/20 dark:to-surface-900",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
  },
  suggestion: {
    border:
      "border-accent-200 dark:border-accent-800",
    bg: "from-accent-50 to-white dark:from-accent-950/20 dark:to-surface-900",
    iconBg: "bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400",
  },
};

export function AutomationCards({ automations, onAction }: AutomationCardsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (automations.length === 0) return null;

  const visible = automations.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    dismissAutomation(id);
  };

  return (
    <div className="space-y-2 px-4 py-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400">
        <Bell className="size-3" />
        <span>Suggestions for you</span>
      </div>
      {visible.map((card) => {
        const styles = typeStyles[card.type];
        return (
          <div
            key={card.id}
            className={`relative rounded-xl border bg-gradient-to-br p-3 transition-all hover:shadow-sm ${styles.border} ${styles.bg}`}
          >
            <button
              onClick={() => handleDismiss(card.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              aria-label="Dismiss"
            >
              <X className="size-3" />
            </button>
            <div className="flex items-start gap-2.5">
              <span className="text-lg shrink-0">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  {card.title}
                </p>
                <p
                  className="mt-0.5 text-xs text-surface-600 dark:text-surface-400 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: card.message
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                  }}
                />
                {card.action && (
                  <button
                    onClick={() => onAction(card.action!.prompt)}
                    className="mt-2 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-accent-700 transition-colors hover:bg-white hover:shadow-sm dark:bg-surface-800/80 dark:text-accent-300 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700"
                  >
                    {card.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
