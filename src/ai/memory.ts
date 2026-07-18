const STORAGE_KEY = "lifeos-ai-memory";

export interface MemoryEntry {
  key: string;
  value: string;
  createdAt: string; // ISO timestamp
}

export function getMemories(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MemoryEntry[];
  } catch {
    return [];
  }
}

function saveMemories(memories: MemoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

export function remember(key: string, value: string): MemoryEntry {
  const memories = getMemories();
  // Check if key already exists
  const existing = memories.find(
    (m) => m.key.toLowerCase() === key.toLowerCase(),
  );
  if (existing) {
    existing.value = value;
    existing.createdAt = new Date().toISOString();
    saveMemories(memories);
    return existing;
  }
  const entry: MemoryEntry = {
    key,
    value,
    createdAt: new Date().toISOString(),
  };
  memories.push(entry);
  saveMemories(memories);
  return entry;
}

export function forget(key: string): boolean {
  const memories = getMemories();
  const idx = memories.findIndex(
    (m) => m.key.toLowerCase() === key.toLowerCase(),
  );
  if (idx === -1) return false;
  memories.splice(idx, 1);
  saveMemories(memories);
  return true;
}

export function recall(key: string): MemoryEntry | undefined {
  return getMemories().find(
    (m) => m.key.toLowerCase() === key.toLowerCase(),
  );
}

/**
 * Scan user input for "remember that..." / "I have..." / "my favorite..." patterns
 * and auto-store facts. Returns the parsed memory if one was extracted, or null.
 */
export function extractMemoryFromInput(
  input: string,
): { key: string; value: string } | null {
  const trimmed = input.trim();

  // "remember that I have asthma"
  const rememberThat = trimmed.match(/^remember that (I|my) (.+)$/i);
  if (rememberThat) {
    const fact = rememberThat[2];
    // Try to split into key:value
    const colonIdx = fact.indexOf(" is ");
    if (colonIdx > 0) {
      return {
        key: fact.slice(0, colonIdx).trim(),
        value: fact.slice(colonIdx + 4).trim(),
      };
    }
    return { key: fact, value: "true" };
  }

  // "remember: my favorite store is Walmart"
  const rememberColon = trimmed.match(/^remember:\s*(.+?)\s+is\s+(.+)$/i);
  if (rememberColon) {
    return { key: rememberColon[1].trim(), value: rememberColon[2].trim() };
  }

  // "I hate early meetings"
  const iHate = trimmed.match(/^i (hate|love|prefer|like|dislike) (.+)$/i);
  if (iHate) {
    return {
      key: `preference:${iHate[2].trim()}`,
      value: iHate[1].toLowerCase(),
    };
  }

  // "my favorite store is Walmart"
  const myFavorite = trimmed.match(
    /^my favorite (.+?) (?:is|are) (.+)$/i,
  );
  if (myFavorite) {
    return {
      key: `favorite:${myFavorite[1].trim()}`,
      value: myFavorite[2].trim(),
    };
  }

  // "I have asthma" / "I'm allergic to peanuts"
  const iHave = trimmed.match(/^i (?:have|am) (.+)$/i);
  if (iHave) {
    return { key: iHave[1].trim(), value: "true" };
  }

  return null;
}

/**
 * Build a context string of relevant memories that can be injected into AI responses.
 */
export function getMemoryContext(): string {
  const memories = getMemories();
  if (memories.length === 0) return "";

  const lines = memories.map((m) => `- ${m.key}: ${m.value}`);
  return `\n\nThings I know about you:\n${lines.join("\n")}`;
}

/**
 * Search memories for keywords matching the query.
 */
export function searchMemories(query: string): MemoryEntry[] {
  const lower = query.toLowerCase();
  return getMemories().filter(
    (m) =>
      m.key.toLowerCase().includes(lower) ||
      m.value.toLowerCase().includes(lower),
  );
}
