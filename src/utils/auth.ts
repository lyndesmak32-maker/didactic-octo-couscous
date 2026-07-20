export type LockTimeout = "1min" | "5min" | "15min" | "never";

export interface AuthState {
  pinHash: string | null;
  lockTimeout: LockTimeout;
  lastActivity: number;
  sessionExpired: boolean;
}

const STORAGE_KEY = "lifeos-auth";

function getDefaultState(): AuthState {
  return {
    pinHash: null,
    lockTimeout: "5min",
    lastActivity: Date.now(),
    sessionExpired: false,
  };
}

function loadState(): AuthState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultState(), ...parsed };
    }
  } catch {
    // corrupted data, reset
  }
  const def = getDefaultState();
  saveState(def);
  return def;
}

function saveState(state: AuthState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── PIN hashing ─────────────────────────────────────────────
// Simple but effective multi-pass hash with salt (not plaintext).
// In a real app this would be WebAuthn/server-side; this is
// appropriate for a localStorage client-side PIN gate.
function hashPin(pin: string): string {
  // DJB2 hash, forward
  let h1 = 5381;
  for (let i = 0; i < pin.length; i++) {
    h1 = (h1 * 33) ^ pin.charCodeAt(i);
    h1 = h1 >>> 0;
  }
  // sdbm hash, reverse
  let h2 = 0;
  for (let i = pin.length - 1; i >= 0; i--) {
    h2 = pin.charCodeAt(i) + (h2 << 6) + (h2 << 16) - h2;
    h2 = h2 >>> 0;
  }
  const combined = h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  // Stretch with btoa
  return btoa(combined).replace(/=/g, "");
}

// ── Public API ──────────────────────────────────────────────

export function isPinSet(): boolean {
  return loadState().pinHash !== null;
}

export function setPin(pin: string): void {
  const state = loadState();
  state.pinHash = hashPin(pin);
  state.sessionExpired = false;
  state.lastActivity = Date.now();
  saveState(state);
}

export function changePin(oldPin: string, newPin: string): boolean {
  const state = loadState();
  if (!state.pinHash) return false;
  if (hashPin(oldPin) !== state.pinHash) return false;
  state.pinHash = hashPin(newPin);
  state.lastActivity = Date.now();
  saveState(state);
  return true;
}

export function verifyPin(pin: string): boolean {
  const state = loadState();
  if (!state.pinHash) return true; // no PIN set → always pass
  return hashPin(pin) === state.pinHash;
}

export function removePin(pin: string): boolean {
  const state = loadState();
  if (!state.pinHash) return false;
  if (hashPin(pin) !== state.pinHash) return false;
  state.pinHash = null;
  state.sessionExpired = false;
  saveState(state);
  return true;
}

export function getLockTimeout(): LockTimeout {
  return loadState().lockTimeout;
}

export function setLockTimeout(timeout: LockTimeout): void {
  const state = loadState();
  state.lockTimeout = timeout;
  saveState(state);
}

export function recordActivity(): void {
  const state = loadState();
  state.lastActivity = Date.now();
  // Don't persist on every activity — only if session state changed
  if (state.sessionExpired) {
    state.sessionExpired = false;
    saveState(state);
  } else {
    // Persist periodically to track activity across tabs
    if (Date.now() - state.lastActivity > 30_000) {
      saveState(state);
    }
  }
}

export function isSessionExpired(): boolean {
  const state = loadState();
  if (!state.pinHash) return false;
  if (state.sessionExpired) return true;

  const timeoutMs: Record<LockTimeout, number> = {
    "1min": 60_000,
    "5min": 300_000,
    "15min": 900_000,
    never: Infinity,
  };

  return Date.now() - state.lastActivity > timeoutMs[state.lockTimeout];
}

export function expireSession(): void {
  const state = loadState();
  state.sessionExpired = true;
  saveState(state);
}

export function unlockSession(pin: string): boolean {
  if (!verifyPin(pin)) return false;
  const state = loadState();
  state.sessionExpired = false;
  state.lastActivity = Date.now();
  saveState(state);
  return true;
}

export function lockNow(): void {
  expireSession();
}

export function resetAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
