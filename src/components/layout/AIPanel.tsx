import { useState } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
}

const mockResponses = [
  "I can help you organize your day! Would you like me to review your calendar?",
  "Based on your spending patterns, you might want to review your dining budget this month.",
  "You have 3 tasks due today. Shall I prioritize them for you?",
  "I noticed you have a gap in your schedule tomorrow afternoon. Perfect time for a workout!",
];

export function AIPanel({ open, onClose }: AIPanelProps) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Hi! I'm your LifeOS assistant. I can help with scheduling, finances, goals, and more. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    // Mock response
    setTimeout(() => {
      const mock =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setMessages((prev) => [...prev, { role: "assistant", text: mock }]);
    }, 800);
  };

  if (!open) return null;

  const panelContent = (
    <div className="flex h-full flex-col bg-white dark:bg-surface-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-300">
            <Bot className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              AI Assistant
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Always ready to help
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          aria-label="Close AI panel"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent-600 text-white"
                    : "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-surface-200 p-3 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
          />
          <button
            onClick={handleSend}
            className="flex size-10 items-center justify-center rounded-xl bg-accent-600 text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: right drawer */}
      <div className="hidden lg:block">
        <aside className="fixed inset-y-0 right-0 z-30 w-[var(--ai-panel-width)] border-l border-surface-200 shadow-2xl dark:border-surface-800">
          {panelContent}
        </aside>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-30 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={onClose} />
          <div className="max-h-[70vh] rounded-t-2xl shadow-2xl">
            <div className="h-8 bg-white dark:bg-surface-900 rounded-t-2xl flex items-center justify-center">
              <div className="w-10 h-1 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            <div className="h-[60vh] overflow-hidden rounded-b-2xl">
              {panelContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
