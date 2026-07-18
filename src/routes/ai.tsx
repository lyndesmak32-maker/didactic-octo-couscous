import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, MessageSquare, Zap, Brain } from "lucide-react";

export const Route = createFileRoute("/ai")({
  component: AIAssistant,
});

function AIAssistant() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
          AI Assistant
        </h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Your personal AI chief of staff, ready to help with anything.
        </p>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-8 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-300">
            <Sparkles className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Full AI Assistant View
          </h3>
          <p className="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
            The AI assistant is always available from the side panel. This full view
            will offer an expanded workspace with history, saved conversations, and
            deeper integrations.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: MessageSquare, label: "Natural chat", desc: "Conversational interface" },
            { icon: Zap, label: "Quick actions", desc: "One-tap task creation" },
            { icon: Brain, label: "Smart context", desc: "Understands your whole life" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-xl border border-surface-100 bg-surface-50 p-4 text-center dark:border-surface-800 dark:bg-surface-800/50"
              >
                <Icon className="mx-auto mb-2 size-5 text-accent-500" />
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {item.label}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
