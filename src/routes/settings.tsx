import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Clock,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  FileText,
  Palette,
  Sparkles,
  Bell,
  Calendar,
  Wallet,
  Globe,
  Sun,
  Moon,
  RotateCcw,
} from "lucide-react";
import { PinLock } from "~/components/PinLock";
import {
  isPinSet,
  setPin,
  changePin,
  removePin,
  getLockTimeout,
  setLockTimeout,
  lockNow,
  verifyPin,
  type LockTimeout,
} from "~/utils/auth";
import {
  getPrivacyState,
  setModuleVisibility,
  setHideSensitiveData,
  exportAllData,
  deleteAllData,
  type ModuleName,
} from "~/data/privacy";
import { useTheme, ACCENT_COLORS, type AccentColor } from "~/hooks/useTheme";
import {
  getAIPreferences,
  setAIPreferences,
  setAIAlert,
  getGeneralPreferences,
  setGeneralPreferences,
  DEFAULT_AI_PREFS,
  DEFAULT_GENERAL,
  type AIVerbosity,
  type CalendarView,
  type FinanceView,
  type DateFormat,
  type WeekStart,
} from "~/data/preferences";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
          Settings
        </h2>
        <p className="mt-1 text-surface-500 dark:text-surface-400">
          Customize your LifeOS experience.
        </p>
      </div>

      <div className="space-y-6">
        <ThemeSection />
        <GeneralSection />
        <AISection />
        <SecuritySection />
        <PrivacySection />
        <DataSection />
        <AboutSection />
      </div>
    </div>
  );
}

// ── Theme Section ──────────────────────────────────────────────

function ThemeSection() {
  const { theme, setTheme, setAccent } = useTheme();
  const [currentAccent, setCurrentAccent] = useState<AccentColor>(() => {
    if (typeof window !== "undefined") {
      return (document.documentElement.getAttribute("data-accent") as AccentColor) || "amber";
    }
    return "amber";
  });

  const handleAccentChange = useCallback(
    (accent: AccentColor) => {
      setAccent(accent);
      setCurrentAccent(accent);
    },
    [setAccent],
  );

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Theme
        </h3>
      </div>

      <div className="space-y-4">
        {/* Mode toggle */}
        <div>
          <p className="mb-2 text-xs font-medium text-surface-400">Mode</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                theme === "light"
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300"
                  : "border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
              }`}
            >
              <Sun className="size-4" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                theme === "dark"
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300"
                  : "border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
              }`}
            >
              <Moon className="size-4" />
              Dark
            </button>
          </div>
        </div>

        {/* Accent color swatches */}
        <div>
          <p className="mb-2 text-xs font-medium text-surface-400">Accent Color</p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((ac) => {
              const isActive = currentAccent === ac.id;
              return (
                <button
                  key={ac.id}
                  onClick={() => handleAccentChange(ac.id)}
                  title={ac.label}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`size-9 rounded-full transition-all duration-200 ${
                      isActive
                        ? "ring-2 ring-offset-2 ring-accent-500 ring-offset-white dark:ring-offset-surface-900 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: ac.hex }}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive
                        ? "text-accent-600 dark:text-accent-400"
                        : "text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300"
                    }`}
                  >
                    {ac.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Live preview */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2 dark:bg-surface-800">
            <div
              className="size-3 rounded-full transition-colors duration-200"
              style={{ backgroundColor: ACCENT_COLORS.find((a) => a.id === currentAccent)?.hex }}
            />
            <span className="text-xs text-surface-500 dark:text-surface-400">
              Preview:{" "}
              <span
                className="font-semibold transition-colors duration-200"
                style={{ color: ACCENT_COLORS.find((a) => a.id === currentAccent)?.hex }}
              >
                {ACCENT_COLORS.find((a) => a.id === currentAccent)?.label}
              </span>{" "}
              accent active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── General Preferences Section ────────────────────────────────

function GeneralSection() {
  const [prefs, setPrefs] = useState(() => {
    if (typeof window !== "undefined") return getGeneralPreferences();
    return DEFAULT_GENERAL;
  });

  const update = useCallback(
    <K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) => {
      const next = { ...prefs, [key]: value };
      setPrefs(next);
      setGeneralPreferences({ [key]: value });
    },
    [prefs],
  );

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          General
        </h3>
      </div>

      <div className="space-y-1">
        {/* Default Calendar View */}
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-surface-400" />
            <span className="text-surface-700 dark:text-surface-200">
              Default Calendar View
            </span>
          </div>
          <select
            value={prefs.defaultCalendarView}
            onChange={(e) => update("defaultCalendarView", e.target.value as CalendarView)}
            className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>

        {/* Default Finance View */}
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <div className="flex items-center gap-3">
            <Wallet className="size-4 text-surface-400" />
            <span className="text-surface-700 dark:text-surface-200">
              Default Finance View
            </span>
          </div>
          <select
            value={prefs.defaultFinanceView}
            onChange={(e) => update("defaultFinanceView", e.target.value as FinanceView)}
            className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
          >
            <option value="overview">Overview</option>
            <option value="transactions">Transactions</option>
            <option value="budget">Budget</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-surface-400" />
            <span className="text-surface-700 dark:text-surface-200">
              Date Format
            </span>
          </div>
          <select
            value={prefs.dateFormat}
            onChange={(e) => update("dateFormat", e.target.value as DateFormat)}
            className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          </select>
        </div>

        {/* First Day of Week */}
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-surface-400" />
            <span className="text-surface-700 dark:text-surface-200">
              First Day of Week
            </span>
          </div>
          <select
            value={prefs.weekStart}
            onChange={(e) => update("weekStart", e.target.value as WeekStart)}
            className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ── AI Preferences Section ─────────────────────────────────────

function AISection() {
  const [prefs, setPrefs] = useState(() => {
    if (typeof window !== "undefined") return getAIPreferences();
    return DEFAULT_AI_PREFS;
  });

  const [nickname, setNickname] = useState(prefs.nickname);
  const [saved, setSaved] = useState(false);

  const saveNickname = useCallback(() => {
    setAIPreferences({ nickname: nickname.trim() || "LifeOS" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [nickname]);

  const handleVerbosity = useCallback((v: AIVerbosity) => {
    setPrefs((p) => ({ ...p, verbosity: v }));
    setAIPreferences({ verbosity: v });
  }, []);

  const handleAlert = useCallback((cat: keyof typeof prefs.proactiveAlerts, enabled: boolean) => {
    setPrefs((p) => ({
      ...p,
      proactiveAlerts: { ...p.proactiveAlerts, [cat]: enabled },
    }));
    setAIAlert(cat, enabled);
  }, []);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          AI Assistant
        </h3>
      </div>

      <div className="space-y-4">
        {/* AI Nickname */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-surface-400">Nickname / Persona</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveNickname()}
              placeholder="LifeOS"
              maxLength={20}
              className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700 placeholder:text-surface-400 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
            />
            <button
              onClick={saveNickname}
              className="rounded-lg bg-accent-500 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-accent-600"
            >
              {saved ? (
                <Check className="size-4" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>

        {/* Verbosity */}
        <div>
          <p className="mb-2 text-xs font-medium text-surface-400">Response Style</p>
          <div className="flex gap-1.5">
            {(["concise", "balanced", "detailed"] as AIVerbosity[]).map((v) => (
              <button
                key={v}
                onClick={() => handleVerbosity(v)}
                className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-all ${
                  prefs.verbosity === v
                    ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300"
                    : "border-surface-200 text-surface-500 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Proactive Alerts */}
        <div>
          <p className="mb-2 text-xs font-medium text-surface-400">
            Proactive Notifications
          </p>
          <div className="space-y-1">
            {[
              { key: "schedule" as const, label: "Schedule alerts", desc: "Upcoming events, conflicts, reminders" },
              { key: "finance" as const, label: "Finance alerts", desc: "Bill reminders, budget warnings" },
              { key: "health" as const, label: "Health nudges", desc: "Activity reminders, sleep tips" },
              { key: "goals" as const, label: "Goal progress", desc: "Progress nudges and milestones" },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm text-surface-700 dark:text-surface-200">
                    {label}
                  </span>
                  <p className="text-xs text-surface-400">{desc}</p>
                </div>
                <button
                  onClick={() => handleAlert(key, !prefs.proactiveAlerts[key])}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    prefs.proactiveAlerts[key]
                      ? "bg-accent-500"
                      : "bg-surface-300 dark:bg-surface-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                      prefs.proactiveAlerts[key] ? "translate-x-[22px]" : "translate-x-[1px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Security Section ─────────────────────────────────────────

function SecuritySection() {
  const [pinActive, setPinActive] = useState(false);
  const [pinModal, setPinModal] = useState<{
    open: boolean;
    mode: "setup" | "change-verify" | "change-new" | "remove";
  }>({ open: false, mode: "setup" });
  const [currentPin, setCurrentPin] = useState<string>("");
  const [timeout, setTimeout_] = useState<LockTimeout>("5min");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setPinActive(isPinSet());
    setTimeout_(getLockTimeout());
  }, []);

  const refresh = useCallback(() => {
    setPinActive(isPinSet());
    setTimeout_(getLockTimeout());
  }, []);

  const showMessage = useCallback(
    (text: string, type: "success" | "error") => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 3000);
    },
    [],
  );

  const handlePinSuccess = useCallback(
    (pin: string) => {
      switch (pinModal.mode) {
        case "setup":
          setPin(pin);
          showMessage("PIN set successfully", "success");
          setPinModal({ open: false, mode: "setup" });
          break;
        case "change-verify":
          setCurrentPin(pin);
          setPinModal({ open: true, mode: "change-new" });
          break;
        case "change-new":
          changePin(currentPin, pin);
          showMessage("PIN changed successfully", "success");
          setCurrentPin("");
          setPinModal({ open: false, mode: "setup" });
          break;
      }
      refresh();
    },
    [pinModal.mode, showMessage, refresh, currentPin],
  );

  const handleLockNow = useCallback(() => {
    lockNow();
    showMessage("App locked", "success");
    setTimeout(() => window.location.reload(), 500);
  }, [showMessage]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Security
        </h3>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-1">
        <button
          onClick={() =>
            setPinModal({
              open: true,
              mode: pinActive ? "change-verify" : "setup",
            })
          }
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
        >
          <div className="flex items-center gap-3">
            <Lock className="size-4 text-surface-400" />
            <div className="text-left">
              <span className="text-surface-700 dark:text-surface-200">
                App PIN Lock
              </span>
              <span className="ml-2 text-xs text-surface-400">
                {pinActive ? "Enabled" : "Not set"}
              </span>
            </div>
          </div>
          <ChevronRight className="size-4 text-surface-300 dark:text-surface-600" />
        </button>

        {pinActive && (
          <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-surface-400" />
              <span className="text-surface-700 dark:text-surface-200">
                Auto-lock timeout
              </span>
            </div>
            <select
              value={timeout}
              onChange={(e) => {
                const val = e.target.value as LockTimeout;
                setTimeout_(val);
                setLockTimeout(val);
              }}
              className="rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            >
              <option value="1min">1 minute</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="never">Never</option>
            </select>
          </div>
        )}

        {pinActive && (
          <button
            onClick={handleLockNow}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
          >
            <Lock className="size-4 text-amber-400" />
            <span className="text-amber-500">Lock Now</span>
          </button>
        )}

        {pinActive && (
          <button
            onClick={() =>
              setPinModal({ open: true, mode: "remove" })
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/5"
          >
            <Trash2 className="size-4" />
            <span>Remove PIN</span>
          </button>
        )}
      </div>

      {pinModal.open && pinModal.mode === "setup" && (
        <PinLock
          mode="setup"
          onSuccess={handlePinSuccess}
          onCancel={() => setPinModal({ open: false, mode: "setup" })}
        />
      )}

      {pinModal.open && pinModal.mode === "change-verify" && (
        <PinLock
          mode="verify"
          onSuccess={handlePinSuccess}
          onCancel={() => setPinModal({ open: false, mode: "setup" })}
        />
      )}

      {pinModal.open && pinModal.mode === "change-new" && (
        <PinLock
          mode="setup"
          onSuccess={handlePinSuccess}
          onCancel={() => {
            setPinModal({ open: false, mode: "setup" });
            setCurrentPin("");
          }}
        />
      )}

      {pinModal.open && pinModal.mode === "remove" && (
        <RemovePinModal
          onClose={() => setPinModal({ open: false, mode: "setup" })}
          onDone={() => {
            setPinModal({ open: false, mode: "setup" });
            refresh();
            showMessage("PIN removed", "success");
          }}
          onError={(msg) => showMessage(msg, "error")}
        />
      )}
    </div>
  );
}

function RemovePinModal({
  onClose,
  onDone,
  onError,
}: {
  onClose: () => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>([]);

  const handleDigit = useCallback(
    (d: string) => {
      if (digits.length >= 6) return;
      const next = [...digits, d];
      setDigits(next);
      if (next.length >= 4) {
        const pinStr = next.join("");
        if (removePin(pinStr)) {
          onDone();
        } else {
          setDigits([]);
          onError("Wrong PIN. Try again.");
        }
      }
    },
    [digits, onDone, onError],
  );

  const handleDelete = useCallback(() => {
    setDigits((prev) => prev.slice(0, -1));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-surface-700 bg-surface-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-400" />
          <h4 className="font-semibold text-surface-100">Remove PIN</h4>
        </div>
        <p className="mb-4 text-sm text-surface-400">
          Enter your current PIN to remove app lock protection.
        </p>

        <div className="mb-4 flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`size-3 rounded-full border-2 transition-all ${
                i < digits.length
                  ? "border-accent-400 bg-accent-400"
                  : "border-surface-600 bg-transparent"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "x"].map(
            (key) => {
              if (key === "del")
                return (
                  <button
                    key="del"
                    onClick={handleDelete}
                    className="rounded-lg py-2.5 text-sm text-surface-400 hover:bg-surface-800"
                  >
                    Del
                  </button>
                );
              if (key === "x") return <div key="x" />;
              return (
                <button
                  key={key}
                  onClick={() => handleDigit(key)}
                  className="rounded-lg py-3 text-xl font-semibold text-surface-100 hover:bg-surface-800 active:bg-surface-700"
                >
                  {key}
                </button>
              );
            },
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-surface-700 py-2 text-sm text-surface-400 hover:bg-surface-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Privacy Section ───────────────────────────────────────────

const MODULE_LABELS: Record<ModuleName, string> = {
  calendar: "Calendar",
  finances: "Finances",
  health: "Health",
  documents: "Documents",
  family: "Family",
  shopping: "Shopping",
  travel: "Travel",
};

function PrivacySection() {
  const [privacy, setPrivacy] = useState(getPrivacyState());

  const toggleModule = useCallback((mod: ModuleName) => {
    const next = !getPrivacyState().moduleVisibility[mod];
    setModuleVisibility(mod, next);
    setPrivacy(getPrivacyState());
  }, []);

  const toggleSensitive = useCallback(() => {
    const next = !getPrivacyState().hideSensitiveData;
    setHideSensitiveData(next);
    setPrivacy(getPrivacyState());
  }, []);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Privacy
        </h3>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <div className="flex items-center gap-3">
            {privacy.hideSensitiveData ? (
              <EyeOff className="size-4 text-amber-400" />
            ) : (
              <Eye className="size-4 text-surface-400" />
            )}
            <div>
              <span className="text-surface-700 dark:text-surface-200">
                Hide Sensitive Data
              </span>
              <p className="text-xs text-surface-400">
                Mask dollar amounts, health metrics, document titles
              </p>
            </div>
          </div>
          <button
            onClick={toggleSensitive}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              privacy.hideSensitiveData
                ? "bg-accent-500"
                : "bg-surface-300 dark:bg-surface-600"
            }`}
          >
            <div
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                privacy.hideSensitiveData ? "translate-x-[22px]" : "translate-x-[1px]"
              }`}
            />
          </button>
        </div>

        <div className="mt-2 border-t border-surface-100 pt-2 dark:border-surface-700">
          <p className="px-3 py-1.5 text-xs font-medium text-surface-400">
            Module Visibility
          </p>
          {Object.entries(MODULE_LABELS).map(([key, label]) => {
            const mod = key as ModuleName;
            const visible = privacy.moduleVisibility[mod];
            return (
              <div
                key={mod}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm"
              >
                <span className="text-surface-700 dark:text-surface-200">
                  {label}
                </span>
                <button
                  onClick={() => toggleModule(mod)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    visible
                      ? "bg-accent-500"
                      : "bg-surface-300 dark:bg-surface-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                      visible ? "translate-x-[22px]" : "translate-x-[1px]"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Data Section ──────────────────────────────────────────────

function DataSection() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "pin">("confirm");
  const [deletePin, setDeletePin] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  }, []);

  const handleDeletePinDigit = useCallback(
    (d: string) => {
      if (deletePin.length >= 6) return;
      const next = [...deletePin, d];
      setDeletePin(next);
      if (next.length >= 4) {
        if (verifyPin(next.join(""))) {
          deleteAllData();
          window.location.reload();
        } else {
          setDeletePin([]);
          setDeleteError("Wrong PIN. Please try again.");
        }
      }
    },
    [deletePin],
  );

  const handleDeleteBackspace = useCallback(() => {
    setDeletePin((prev) => prev.slice(0, -1));
  }, []);

  const hasPin = isPinSet();

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          Data
        </h3>
      </div>

      <div className="space-y-1">
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
        >
          <Download className="size-4 text-accent-400" />
          <span className="text-surface-700 dark:text-surface-200">
            Export All Data
          </span>
          {showExportSuccess && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
              <Check className="size-3" />
              Downloaded
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setShowDeleteConfirm(true);
            setDeleteStep(hasPin ? "pin" : "confirm");
            setDeletePin([]);
            setDeleteError(null);
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/5"
        >
          <Trash2 className="size-4" />
          <span>Delete All Data</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-700 bg-surface-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-400" />
              <h4 className="font-semibold text-surface-100">
                Delete All Data
              </h4>
            </div>

            <p className="mb-1 text-sm text-surface-300">
              This will permanently erase all your LifeOS data including:
            </p>
            <ul className="mb-4 space-y-0.5 text-xs text-surface-400">
              <li>• Calendar events and reminders</li>
              <li>• Financial records and budgets</li>
              <li>• Health metrics and history</li>
              <li>• Documents and files</li>
              <li>• Family profiles and settings</li>
              <li>• Shopping lists and pantry</li>
              <li>• Travel plans and bookings</li>
              <li>• Goals and AI preferences</li>
            </ul>
            <p className="mb-4 text-xs font-medium text-red-400">
              This action cannot be undone. Export your data first if you want a backup.
            </p>

            {deleteStep === "pin" && (
              <div>
                <p className="mb-3 text-sm text-surface-400">
                  Enter your PIN to confirm deletion:
                </p>

                <div className="mb-4 flex justify-center gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`size-3 rounded-full border-2 transition-all ${
                        i < deletePin.length
                          ? "border-red-400 bg-red-400"
                          : "border-surface-600 bg-transparent"
                      }`}
                    />
                  ))}
                </div>

                {deleteError && (
                  <p className="mb-3 text-center text-xs text-red-400">
                    {deleteError}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "x"].map(
                    (key) => {
                      if (key === "del")
                        return (
                          <button
                            key="del"
                            onClick={handleDeleteBackspace}
                            className="rounded-lg py-2.5 text-sm text-surface-400 hover:bg-surface-800"
                          >
                            Del
                          </button>
                        );
                      if (key === "x") return <div key="x" />;
                      return (
                        <button
                          key={key}
                          onClick={() => handleDeletePinDigit(key)}
                          className="rounded-lg py-3 text-xl font-semibold text-surface-100 hover:bg-surface-800 active:bg-surface-700"
                        >
                          {key}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                className="flex-1 rounded-lg border border-surface-700 py-2 text-sm text-surface-300 hover:bg-surface-800"
              >
                Cancel
              </button>
              {deleteStep === "confirm" && (
                <button
                  onClick={() => {
                    deleteAllData();
                    window.location.reload();
                  }}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-400"
                >
                  Delete Everything
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── About Section ─────────────────────────────────────────────

function AboutSection() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="mb-4 flex items-center gap-2">
        <Info className="size-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          About
        </h3>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <span className="text-surface-500 dark:text-surface-400">
            Version
          </span>
          <span className="text-surface-700 dark:text-surface-200">
            1.0.0-beta
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <span className="text-surface-500 dark:text-surface-400">
            Build
          </span>
          <span className="font-mono text-xs text-surface-700 dark:text-surface-200">
            {typeof window !== "undefined"
              ? document.querySelector('meta[name="build-id"]')?.getAttribute("content") ?? "dev"
              : "dev"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <span className="text-surface-500 dark:text-surface-400">
            Privacy Policy
          </span>
          <span className="text-xs text-surface-400">Coming soon</span>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <span className="text-surface-500 dark:text-surface-400">
            Terms of Service
          </span>
          <span className="text-xs text-surface-400">Coming soon</span>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
          <span className="text-surface-500 dark:text-surface-400">
            License
          </span>
          <span className="text-xs text-surface-400">Proprietary</span>
        </div>
      </div>
    </div>
  );
}
