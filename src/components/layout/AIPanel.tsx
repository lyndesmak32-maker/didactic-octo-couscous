import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Maximize2, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAI } from "~/hooks/useAI";
import { ChatMessage } from "~/components/ai/ChatMessage";
import { TypingIndicator } from "~/components/ai/TypingIndicator";
import { AutomationCards } from "~/components/ai/AutomationCards";
import { WelcomeState } from "~/components/ai/WelcomeState";

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIPanel({ open, onClose }: AIPanelProps) {
  const {
    activeConversation,
    isTyping,
    automations,
    sendMessage,
    clearConversation,
  } = useAI();

  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeConversation?.messages ?? [];
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!open) return null;

  const panelContent = (
    <div className="flex h-full flex-col bg-white dark:bg-surface-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 text-white shadow-md shadow-accent-500/25">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              AI Assistant
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {isTyping ? "Thinking..." : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setMinimized(!minimized)}
            className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            aria-label={minimized ? "Expand AI panel" : "Minimize AI panel"}
          >
            {minimized ? (
              <Maximize2 className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
          </button>
          <Link
            to="/ai"
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            aria-label="Open full AI page"
          >
            <Maximize2 className="size-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            aria-label="Close AI panel"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Minimized state — just show automation cards */}
      {minimized ? (
        <div className="flex-1 overflow-y-auto">
          <AutomationCards automations={automations} onAction={handlePrompt} />
          {automations.length === 0 && (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="text-sm text-surface-400 dark:text-surface-500">
                No new suggestions. Expand to chat!
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {!hasMessages ? (
              <div className="p-4">
                <div className="mb-4 rounded-xl bg-gradient-to-br from-accent-50 to-white p-4 dark:from-accent-950/20 dark:to-surface-800">
                  <p className="text-sm text-surface-700 dark:text-surface-300">
                    👋 Hi! I'm your LifeOS assistant. I can help with scheduling, finances, goals, and more. What would you like to do?
                  </p>
                </div>

                <AutomationCards
                  automations={automations}
                  onAction={handlePrompt}
                />

                {/* Quick action buttons */}
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Plan my week", prompt: "Plan my week" },
                    { label: "Check budget", prompt: "How's my budget?" },
                    { label: "Track health", prompt: "Track my health" },
                    { label: "Set a goal", prompt: "I want to lose 30 pounds" },
                    { label: "Shopping list", prompt: "Show my groceries" },
                    { label: "What's next?", prompt: "What's next?" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handlePrompt(item.prompt)}
                      className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-2 text-xs font-medium text-surface-700 transition-all hover:border-accent-200 hover:bg-white hover:shadow-sm dark:border-surface-800 dark:bg-surface-800/50 dark:text-surface-300 dark:hover:border-accent-800 dark:hover:bg-surface-800"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-4 py-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-surface-200 p-3 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white transition-all hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent-600/25"
                aria-label="Send message"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: right drawer */}
      <div className="hidden lg:block">
        <aside
          className={`fixed inset-y-0 right-0 z-30 border-l border-surface-200 shadow-2xl transition-all duration-300 dark:border-surface-800 ${
            minimized ? "w-80" : "w-[var(--ai-panel-width)]"
          }`}
        >
          {panelContent}
        </aside>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-30 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={onClose} />
          <div
            className={`max-h-[85vh] rounded-t-2xl shadow-2xl transition-all duration-300 ${
              minimized ? "max-h-[40vh]" : ""
            }`}
          >
            <div className="flex h-8 items-center justify-center rounded-t-2xl bg-white dark:bg-surface-900">
              <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            <div className="h-[70vh] overflow-hidden rounded-b-2xl">
              {panelContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
