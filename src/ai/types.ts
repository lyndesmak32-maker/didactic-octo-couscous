import type { CalendarEvent, Goal, Bill } from "~/types/dashboard";
import type { MemoryEntry } from "./memory";
import type { Plan } from "./planner";
import type { AutomationCard } from "./automation";

export interface AICommand {
  input: string;
  timestamp: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  category?: string;
  data?: Record<string, unknown>;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AIResponse {
  category: string;
  message: string;
  suggestions?: string[];
  data?: {
    events?: CalendarEvent[];
    tasks?: Goal[];
    bills?: Bill[];
    plan?: Plan;
    memory?: { key: string; value: string };
    memories?: MemoryEntry[];
    nextEvent?: CalendarEvent;
    reminder?: string;
    addedItem?: string;
    [key: string]: unknown;
  };
}

export interface AIContextType {
  conversations: AIConversation[];
  activeConversationId: string | null;
  activeConversation: AIConversation | null;
  isTyping: boolean;
  automations: AutomationCard[];
  inputValue: string;
  setInputValue: (v: string) => void;
  sendMessage: (text: string) => void;
  clearConversation: () => void;
  newConversation: () => void;
  switchConversation: (id: string) => void;
}
