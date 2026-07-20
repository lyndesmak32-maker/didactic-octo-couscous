import { useState, useCallback, useEffect, useRef } from "react";
import { Shield, Delete, ArrowRight, AlertTriangle } from "lucide-react";

export type PinLockMode = "unlock" | "setup" | "change" | "verify";

interface PinLockProps {
  mode: PinLockMode;
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  onForgotPin?: () => void;
}

export function PinLock({ mode, onSuccess, onCancel, onForgotPin }: PinLockProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [confirmDigits, setConfirmDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const forgotRef = useRef<HTMLDivElement>(null);

  const maxDigits = 6;
  const minDigits = 4;

  useEffect(() => {
    setDigits([]);
    setConfirmDigits([]);
    setError(null);
    setStep("enter");
    setShowForgotConfirm(false);
  }, [mode]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      if (step === "enter") {
        if (digits.length >= maxDigits) return;
        setDigits((prev) => [...prev, digit]);
      } else {
        if (confirmDigits.length >= maxDigits) return;
        setConfirmDigits((prev) => [...prev, digit]);
      }
    },
    [digits.length, confirmDigits.length, step],
  );

  const handleDelete = useCallback(() => {
    if (step === "enter") {
      setDigits((prev) => prev.slice(0, -1));
      setError(null);
    } else {
      setConfirmDigits((prev) => prev.slice(0, -1));
    }
  }, [step]);

  const handleSubmit = useCallback(() => {
    if (step === "enter") {
      if (digits.length < minDigits) {
        setError(`PIN must be at least ${minDigits} digits`);
        triggerShake();
        return;
      }
      if (mode === "setup") {
        setStep("confirm");
        return;
      }
      if (mode === "change") {
        setStep("confirm");
        return;
      }
      // unlock / verify modes — submit immediately
      onSuccess(digits.join(""));
    } else {
      // confirm step
      if (digits.join("") !== confirmDigits.join("")) {
        setError("PINs don't match. Try again.");
        triggerShake();
        setConfirmDigits([]);
        setStep("enter");
        setDigits([]);
        return;
      }
      onSuccess(digits.join(""));
    }
  }, [digits, confirmDigits, step, mode, minDigits, onSuccess, triggerShake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDigit, handleDelete, handleSubmit]);

  const getTitle = () => {
    switch (mode) {
      case "unlock":
        return "Welcome Back";
      case "setup":
        return step === "enter" ? "Set Your PIN" : "Confirm PIN";
      case "change":
        return step === "enter" ? "Enter New PIN" : "Confirm New PIN";
      case "verify":
        return "Enter PIN";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "unlock":
        return "Enter your PIN to unlock LifeOS";
      case "setup":
        return step === "enter"
          ? `Choose a ${minDigits}–${maxDigits} digit PIN to secure your data`
          : "Re-enter your PIN to confirm";
      case "change":
        return step === "enter"
          ? `Choose a new ${minDigits}–${maxDigits} digit PIN`
          : "Re-enter your new PIN to confirm";
      case "verify":
        return "Enter your PIN to continue";
    }
  };

  const currentDigits = step === "enter" ? digits : confirmDigits;

  const numpadLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["delete", "0", "submit"],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/95 backdrop-blur-xl">
      <div className="w-full max-w-sm px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent-500/10">
            <Shield className="size-8 text-accent-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-100">{getTitle()}</h2>
          <p className="mt-2 text-sm text-surface-400">{getSubtitle()}</p>
        </div>

        {/* Dot indicators */}
        <div className="mb-8 flex justify-center gap-3">
          {Array.from({ length: maxDigits }).map((_, i) => (
            <div
              key={i}
              className={`size-4 rounded-full border-2 transition-all duration-200 ${
                i < currentDigits.length
                  ? "border-accent-400 bg-accent-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  : "border-surface-600 bg-transparent"
              } ${i === currentDigits.length ? "border-surface-400" : ""}`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div
            className={`mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-center text-sm text-red-400 ${
              shake ? "animate-[shake_0.5s_ease-in-out]" : ""
            }`}
          >
            {error}
          </div>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3">
          {numpadLayout.map((row, rowIdx) => (
            <div key={rowIdx} className="contents">
              {row.map((key) => {
                if (key === "delete") {
                  return (
                    <button
                      key="delete"
                      onClick={handleDelete}
                      className="flex items-center justify-center rounded-xl py-4 text-surface-400 transition-colors hover:text-surface-200 active:bg-surface-800"
                      aria-label="Delete"
                    >
                      <Delete className="size-5" />
                    </button>
                  );
                }
                if (key === "submit") {
                  const canSubmit =
                    step === "enter"
                      ? digits.length >= minDigits
                      : confirmDigits.length >= minDigits;
                  return (
                    <button
                      key="submit"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={`flex items-center justify-center rounded-xl py-4 transition-all ${
                        canSubmit
                          ? "bg-accent-500 text-white hover:bg-accent-400 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                          : "cursor-not-allowed text-surface-700"
                      }`}
                      aria-label="Submit"
                    >
                      <ArrowRight className="size-5" />
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    onClick={() => handleDigit(key)}
                    className="rounded-xl py-4 text-2xl font-semibold text-surface-100 transition-all hover:bg-surface-800 active:scale-95 active:bg-surface-700"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex justify-center gap-4">
          {onCancel && mode !== "unlock" && (
            <button
              onClick={onCancel}
              className="text-sm text-surface-500 transition-colors hover:text-surface-300"
            >
              Cancel
            </button>
          )}
          {mode === "unlock" && onForgotPin && (
            <div className="text-center">
              {!showForgotConfirm ? (
                <button
                  onClick={() => setShowForgotConfirm(true)}
                  className="text-sm text-surface-500 transition-colors hover:text-surface-300"
                >
                  Forgot PIN?
                </button>
              ) : (
                <div
                  ref={forgotRef}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                >
                  <div className="mb-3 flex items-center gap-2 text-left">
                    <AlertTriangle className="size-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-300">
                      This will permanently delete all your LifeOS data and reset
                      the app. This cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowForgotConfirm(false)}
                      className="flex-1 rounded-lg border border-surface-700 px-3 py-1.5 text-xs text-surface-300 transition-colors hover:bg-surface-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onForgotPin}
                      className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-400"
                    >
                      Delete All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shake animation keyframes (injected via style tag) */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
