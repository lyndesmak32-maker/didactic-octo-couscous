import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { AIMessage, AIConversation } from "~/ai/types";
import { routeCommand } from "~/ai/router";
import { getAutomations } from "~/ai/automation";
import type { AutomationCard } from "~/ai/automation";

const STORAGE_KEY = "lifeos-ai-conversations";
const ACTIVE_KEY = "lifeos-ai-active-conversation";

interface AIState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  isTyping: boolean;
}

let state: AIState = loadState();
const listeners = new Set<() => void>();

function loadState(): AIState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const conversations: AIConversation[] = raw ? JSON.parse(raw) : [];
    const activeId = localStorage.getItem(ACTIVE_KEY);

    if (conversations.length === 0) {
      const newConv = createConversation();
      conversations.push(newConv);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      localStorage.setItem(ACTIVE_KEY, newConv.id);
      return {
        conversations,
        activeConversationId: newConv.id,
        isTyping: false,
      };
    }

    const validActiveId =
      activeId && conversations.find((c) => c.id === activeId)
        ? activeId
        : conversations[0].id;

    localStorage.setItem(ACTIVE_KEY, validActiveId);

    return {
      conversations,
      activeConversationId: validActiveId,
      isTyping: false,
    };
  } catch {
    const newConv = createConversation();
    return {
      conversations: [newConv],
      activeConversationId: newConv.id,
      isTyping: false,
    };
  }
}

function createConversation(title?: string): AIConversation {
  return {
    id: crypto.randomUUID(),
    title: title ?? "New conversation",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function persistState(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations));
  localStorage.setItem(ACTIVE_KEY, state.activeConversationId ?? "");
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): AIState {
  return state;
}

function getServerSnapshot(): AIState {
  return {
    conversations: [],
    activeConversationId: null,
    isTyping: false,
  };
}

function notify(): void {
  listeners.forEach((cb) => cb());
}

function generateId(): string {
  return crypto.randomUUID();
}

export interface UseAIReturn {
  conversations: AIConversation[];
  activeConversationId: string | null;
  activeConversation: AIConversation | null;
  isTyping: boolean;
  automations: AutomationCard[];
  sendMessage: (text: string) => void;
  clearConversation: () => void;
  newConversation: () => void;
  switchConversation: (id: string) => void;
}

export function useAI(): UseAIReturn {
  const currentState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const activeConversation = useMemo(() => {
    return (
      currentState.conversations.find(
        (c) => c.id === currentState.activeConversationId,
      ) ?? null
    );
  }, [currentState.conversations, currentState.activeConversationId]);

  const automations = useMemo(() => getAutomations(), []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: AIMessage = {
      id: generateId(),
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
    };

    const conv = state.conversations.find(
      (c) => c.id === state.activeConversationId,
    );
    if (!conv) return;

    conv.messages.push(userMsg);
    conv.updatedAt = Date.now();

    // Auto-title from first user message
    if (
      conv.messages.filter((m) => m.role === "user").length === 1 &&
      conv.title === "New conversation"
    ) {
      conv.title =
        text.trim().length > 40
          ? text.trim().slice(0, 40) + "..."
          : text.trim();
    }

    persistState();
    state = { ...state, isTyping: true };
    notify();

    // Simulate AI thinking delay
    const delay = 400 + Math.random() * 800;
    setTimeout(() => {
      const response = routeCommand(text.trim());

      const aiMsg: AIMessage = {
        id: generateId(),
        role: "assistant",
        text: response.message,
        timestamp: Date.now(),
        category: response.category,
        data: response.data as Record<string, unknown> | undefined,
      };

      const currentConv = state.conversations.find(
        (c) => c.id === state.activeConversationId,
      );
      if (currentConv) {
        currentConv.messages.push(aiMsg);
        currentConv.updatedAt = Date.now();
      }

      state = { ...state, isTyping: false };
      persistState();
      notify();
    }, delay);
  }, []);

  const clearConversation = useCallback(() => {
    const conv = state.conversations.find(
      (c) => c.id === state.activeConversationId,
    );
    if (conv) {
      conv.messages = [];
      conv.title = "New conversation";
      conv.updatedAt = Date.now();
    }
    persistState();
    notify();
  }, []);

  const newConversation = useCallback(() => {
    const newConv = createConversation();
    state.conversations.unshift(newConv);
    state.activeConversationId = newConv.id;
    persistState();
    notify();
  }, []);

  const switchConversation = useCallback((id: string) => {
    if (state.conversations.find((c) => c.id === id)) {
      state.activeConversationId = id;
      persistState();
      notify();
    }
  }, []);

  return {
    conversations: currentState.conversations,
    activeConversationId: currentState.activeConversationId,
    activeConversation,
    isTyping: currentState.isTyping,
    automations,
    sendMessage,
    clearConversation,
    newConversation,
    switchConversation,
  };
}
