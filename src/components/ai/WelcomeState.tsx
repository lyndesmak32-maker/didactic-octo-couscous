import {
  Sparkles,
  Calendar,
  Wallet,
  Heart,
  Target,
  ShoppingCart,
  Globe,
  Bell,
  FileText,
} from "lucide-react";

interface WelcomeStateProps {
  onPrompt: (prompt: string) => void;
}

const quickStarts = [
  {
    icon: Calendar,
    label: "Plan my week",
    prompt: "Plan my week",
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-950/50",
  },
  {
    icon: Wallet,
    label: "Check budget",
    prompt: "How's my budget?",
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  {
    icon: Heart,
    label: "Track health",
    prompt: "Track my health",
    color: "text-rose-500",
    bg: "bg-rose-100 dark:bg-rose-950/50",
  },
  {
    icon: Target,
    label: "Set a goal",
    prompt: "I want to lose 30 pounds",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-950/50",
  },
  {
    icon: ShoppingCart,
    label: "Shopping list",
    prompt: "Show my groceries",
    color: "text-cyan-500",
    bg: "bg-cyan-100 dark:bg-cyan-950/50",
  },
  {
    icon: Globe,
    label: "Plan a trip",
    prompt: "Plan a trip to Tokyo",
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-950/50",
  },
  {
    icon: Bell,
    label: "Set reminder",
    prompt: "Remind me to call mom at 6pm",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-950/50",
  },
  {
    icon: FileText,
    label: "Find document",
    prompt: "Find my insurance policy",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-950/50",
  },
];

export function WelcomeState({ onPrompt }: WelcomeStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-purple-500 text-white shadow-xl shadow-accent-500/25">
          <Sparkles className="size-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
          Your AI Chief of Staff
        </h2>
        <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          I can manage your calendar, track your finances, monitor your health,
          plan trips, set reminders, and much more. Just tell me what you need.
        </p>
      </div>

      {/* Quick start grid */}
      <div className="grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
        {quickStarts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onPrompt(item.prompt)}
              className="flex flex-col items-center gap-2 rounded-xl border border-surface-200 bg-white p-3 text-center transition-all hover:border-accent-200 hover:shadow-md hover:scale-[1.02] dark:border-surface-800 dark:bg-surface-900 dark:hover:border-accent-800"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
