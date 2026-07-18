import { Sparkles, User } from "lucide-react";
import type { AIMessage } from "~/ai/types";
import { PlanCard } from "./PlanCard";

interface ChatMessageProps {
  message: AIMessage;
}

function renderMarkdown(text: string): string {
  // Simple markdown-like rendering
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\n/g, "<br/>");
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasPlan = message.data?.plan;

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? "bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400"
            : "bg-gradient-to-br from-accent-500 to-purple-500 text-white shadow-md shadow-accent-500/25"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </div>

      {/* Bubble */}
      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-accent-600 text-white rounded-br-md"
              : "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-200 rounded-bl-md"
          }`}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(message.text),
          }}
        />

        {/* Plan card if present */}
        {hasPlan && !isUser && (
          <PlanCard plan={message.data!.plan as import("~/ai/planner").Plan} />
        )}

        {/* Timestamp */}
        <span className="px-1 text-[10px] text-surface-400 dark:text-surface-500">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
