import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Plus, Trash2 } from "lucide-react";
import { useAI } from "~/hooks/useAI";
import { ChatMessage } from "~/components/ai/ChatMessage";
import { TypingIndicator } from "~/components/ai/TypingIndicator";
import { SuggestedPrompts } from "~/components/ai/SuggestedPrompts";
import { AutomationCards } from "~/components/ai/AutomationCards";
import { WelcomeState } from "~/components/ai/WelcomeState";

export const Route = createFileRoute("/ai")({
  component: AIAssistantPage,
});

function AIAssistantPage() {
  const {
    activeConversation,
    isTyping,
    automations,
    sendMessage,
    clearConversation,
    newConversation,
    conversations,
    activeConversationId,
    switchConversation,
  } = useAI();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = activeConversation?.messages ?? [];
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on mount for desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

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

  // Get suggestions from the last AI message
  const lastAIMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const suggestions: string[] = lastAIMessage?.data?.suggestions
    ? (lastAIMessage.data.suggestions as string[])
    : [];

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height)-var(--bottom-nav-height))] flex-col lg:h-[calc(100dvh-var(--topbar-height))]">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 text-white shadow-md shadow-accent-500/25">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
              {activeConversation?.title ?? "AI Assistant"}
            </h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {isTyping ? "Thinking..." : "Online"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={newConversation}
            className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            aria-label="New conversation"
            title="New conversation"
          >
            <Plus className="size-4" />
          </button>
          {hasMessages && (
            <button
              onClick={clearConversation}
              className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation list sidebar (desktop) */}
      <div className="hidden lg:flex">
        {/* Conversation list - left sidebar on desktop */}
        <div className="w-56 shrink-0 border-r border-surface-200 dark:border-surface-800 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={newConversation}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-accent-600 transition-colors hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-950/50"
            >
              <Plus className="size-3.5" />
              New chat
            </button>
          </div>
          <div className="space-y-0.5 px-2 pb-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className={`w-full truncate rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  conv.id === activeConversationId
                    ? "bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300"
                    : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                }`}
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {!hasMessages ? (
              <WelcomeState onPrompt={handlePrompt} />
            ) : (
              <div className="space-y-4 px-4 py-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Automation cards above input */}
          {automations.length > 0 && hasMessages && (
            <AutomationCards
              automations={automations}
              onAction={handlePrompt}
            />
          )}

          {/* Suggested prompts */}
          {suggestions.length > 0 && hasMessages && (
            <SuggestedPrompts
              suggestions={suggestions}
              onSelect={handlePrompt}
            />
          )}

          {/* Input area */}
          <div className="border-t border-surface-200 p-3 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything — plan my week, track health, check budget..."
                className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white transition-all hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent-600/25"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
