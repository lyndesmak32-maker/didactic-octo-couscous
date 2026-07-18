import { useCallback, useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((cb) => cb());
}

function getSnapshot() {
  return isOpen;
}

function getServerSnapshot() {
  return false;
}

export function useAIPanel() {
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    isOpen = !isOpen;
    notify();
  }, []);

  const close = useCallback(() => {
    isOpen = false;
    notify();
  }, []);

  const openPanel = useCallback(() => {
    isOpen = true;
    notify();
  }, []);

  return { open, toggle, close, openPanel };
}
