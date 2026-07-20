import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Target, Plus, TrendingUp, Flame, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Trash2, Calendar, X, BarChart3,
  Trophy, Zap, Circle,
} from "lucide-react";
import type { Goal, GoalCategory, GoalType, Milestone } from "~/types/goals";
import { getProgress, getDaysRemaining, getCategory, CATEGORIES } from "~/types/goals";
import {
  getGoalsByCategory, addGoal, deleteGoal, toggleGoalComplete,
  updateProgress, checkInHabit, getTodayHabitStatus,
  getWeeklyHabitGrid, toggleMilestone, deleteMilestone, getGoalsSummary,
} from "~/data/goals";

export const Route = createFileRoute("/goals")({ component: GoalsPage });

const TABS: { id: GoalCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

const UNIT_SUGGESTIONS: Record<GoalCategory, string[]> = {
  personal: ["task", "step", "item", "%"],
  fitness: ["lbs", "kg", "miles", "minutes", "sessions", "reps"],
  financial: ["$", "€", "£", "%", "months"],
  career: ["%", "courses", "projects", "interviews"],
  education: ["lessons", "pages", "hours", "%", "books"],
  habits: ["days/week", "minutes", "pages", "glasses", "sessions"],
};

function GoalsPage() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const [activeTab, setActiveTab] = useState<GoalCategory | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editProgressId, setEditProgressId] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState("");

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("goals-updated", handler);
    return () => window.removeEventListener("goals-updated", handler);
  }, [refresh]);

  const goals = useMemo(() => getGoalsByCategory(activeTab), [tick, activeTab]);
  const summary = useMemo(() => getGoalsSummary(), [tick]);
  const allGoals = useMemo(() => getGoalsByCategory("all"), [tick]);

  const recentAchievements = useMemo(() => {
    const achieved: { goalTitle: string; msTitle: string; date: string }[] = [];
    for (const g of allGoals) {
      for (const ms of g.milestones) {
        if (ms.completed && ms.completedAt) {
          achieved.push({ goalTitle: g.title, msTitle: ms.title, date: ms.completedAt });
        }
      }
    }
    return achieved.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [allGoals]);

  const handleAddGoal = useCallback(
    (data: {
      title: string; description: string; category: GoalCategory; type: GoalType;
      targetValue: number; unit: string; deadline?: string;
      milestones: Omit<Milestone, "id" | "completed">[];
    }) => {
      addGoal(data); setShowAddModal(false); refresh();
    }, [refresh]);

  const handleDelete = useCallback((id: string) => {
    deleteGoal(id); if (expandedId === id) setExpandedId(null); refresh();
  }, [expandedId, refresh]);

  const handleToggleComplete = useCallback((id: string) => { toggleGoalComplete(id); refresh(); }, [refresh]);
  const handleCheckIn = useCallback((id: string) => { checkInHabit(id); refresh(); }, [refresh]);

  const handleUpdateProgress = useCallback((id: string) => {
    const val = parseFloat(progressValue);
    if (!isNaN(val) && val >= 0) { updateProgress(id, val); setEditProgressId(null); setProgressValue(""); refresh(); }
  }, [progressValue, refresh]);

  const handleToggleMilestone = useCallback((goalId: string, msId: string) => { toggleMilestone(goalId, msId); refresh(); }, [refresh]);
  const handleDeleteMilestone = useCallback((goalId: string, msId: string) => { deleteMilestone(goalId, msId); refresh(); }, [refresh]);

  const handleStartEdit = useCallback((id: string) => {
    const g = allGoals.find((g) => g.id === id);
    setEditProgressId(id); setProgressValue(g ? String(g.currentValue) : "");
  }, [allGoals]);
  const handleCancelEdit = useCallback(() => { setEditProgressId(null); setProgressValue(""); }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <Target className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">Goals</h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">Set, track, and crush your goals — one milestone at a time.</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700 active:scale-95">
            <Plus className="size-4" />Add Goal
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={<Target className="size-4" />} label="Active" value={summary.active} color="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" />
        <SummaryCard icon={<CheckCircle2 className="size-4" />} label="Completed" value={summary.completed} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" />
        <SummaryCard icon={<TrendingUp className="size-4" />} label="Rate" value={`${summary.completionRate}%`} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" />
        <SummaryCard icon={<Flame className="size-4" />} label="Best Streak" value={`${summary.bestStreak}🔥`} color="bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400" />
      </div>

      {recentAchievements.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800 dark:from-amber-950/40 dark:to-yellow-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="size-4 text-amber-500" /><h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Recent Achievements</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentAchievements.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                <Zap className="size-3" />{a.msTitle}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
            }`}>
            {tab.id !== "all" && <span className="size-1.5 rounded-full" style={{ backgroundColor: getCategory(tab.id as GoalCategory).color }} />}
            {tab.label}
          </button>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 py-16 dark:border-surface-700">
          <Target className="size-10 text-surface-300 dark:text-surface-600" />
          <p className="mt-3 text-sm font-medium text-surface-500 dark:text-surface-400">No goals in this category</p>
          <p className="mt-1 text-xs text-surface-400">Click &quot;Add Goal&quot; to create your first goal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} expanded={expandedId === goal.id}
              onToggleExpand={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
              onDelete={handleDelete} onToggleComplete={handleToggleComplete}
              onCheckIn={handleCheckIn} onToggleMilestone={handleToggleMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              editProgressId={editProgressId} progressValue={progressValue}
              onStartEditProgress={handleStartEdit} onCancelEditProgress={handleCancelEdit}
              onProgressValueChange={setProgressValue} onSaveProgress={handleUpdateProgress} />
          ))}
        </div>
      )}

      {showAddModal && <AddGoalModal onClose={() => setShowAddModal(false)} onAdd={handleAddGoal} />}
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900">
      <div className={`flex size-8 items-center justify-center rounded-lg ${color}`}>{icon}</div>
      <p className="mt-2 text-lg font-bold text-surface-900 dark:text-surface-100">{value}</p>
      <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
    </div>
  );
}

function GoalCard({
  goal, expanded, onToggleExpand, onDelete, onToggleComplete, onCheckIn,
  onToggleMilestone, onDeleteMilestone,
  editProgressId, progressValue, onStartEditProgress, onCancelEditProgress,
  onProgressValueChange, onSaveProgress,
}: {
  goal: Goal; expanded: boolean; onToggleExpand: () => void;
  onDelete: (id: string) => void; onToggleComplete: (id: string) => void;
  onCheckIn: (id: string) => void;
  onToggleMilestone: (goalId: string, msId: string) => void;
  onDeleteMilestone: (goalId: string, msId: string) => void;
  editProgressId: string | null; progressValue: string;
  onStartEditProgress: (id: string) => void; onCancelEditProgress: () => void;
  onProgressValueChange: (v: string) => void; onSaveProgress: (id: string) => void;
}) {
  const progress = getProgress(goal);
  const category = getCategory(goal.category);
  const daysLeft = getDaysRemaining(goal);
  const isEditing = editProgressId === goal.id;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const completedM = goal.milestones.filter((m) => m.completed).length;
  const totalM = goal.milestones.length;
  const weeklyGrid = goal.type === "habit" ? getWeeklyHabitGrid(goal.id) : [];
  const circumference = 87.96;
  const strokeDash = (progress / 100) * circumference;

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white transition-shadow hover:shadow-md dark:border-surface-800 dark:bg-surface-900">
      <button onClick={onToggleExpand} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="relative shrink-0">
          <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-100 dark:text-surface-700" />
            <circle cx="18" cy="18" r="14" fill="none" stroke={category.color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`} className="transition-all duration-700" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-surface-700 dark:text-surface-300">{progress}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{goal.title}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${category.bgClass} ${category.textClass}`}>{category.label}</span>
          </div>
          <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400 line-clamp-2">{goal.description}</p>

          {goal.type === "numeric" && (
            <div className="mt-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: category.color }} />
                {goal.milestones.map((ms) => {
                  const pct = goal.targetValue > 0 ? (ms.targetValue / goal.targetValue) * 100 : 0;
                  return (
                    <div key={ms.id} className={`absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors ${
                      ms.completed ? "border-emerald-400 bg-emerald-400" : "border-white bg-surface-300 dark:border-surface-900 dark:bg-surface-500"}`}
                      style={{ left: `${Math.min(100, pct)}%` }} title={ms.title} />
                  );
                })}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-surface-400">
                <span>{goal.currentValue}{goal.unit ? ` ${goal.unit}` : ""}</span>
                <span>{goal.targetValue}{goal.unit ? ` ${goal.unit}` : ""}</span>
              </div>
            </div>
          )}

          {goal.type === "habit" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: category.color }} />
              </div>
              <span className="shrink-0 text-xs font-semibold text-orange-600 dark:text-orange-400">{goal.currentStreak}🔥</span>
            </div>
          )}

          {goal.type === "binary" && (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                <div className={`h-full rounded-full transition-all duration-500 ${goal.completed ? "bg-emerald-500" : "bg-surface-300 dark:bg-surface-600"}`}
                  style={{ width: goal.completed ? "100%" : "0%" }} />
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-surface-400">
            {goal.type === "habit" && <span className="flex items-center gap-1"><Flame className="size-3" />Best: {goal.bestStreak}d</span>}
            {daysLeft !== null && <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : ""}`}><Clock className="size-3" />{isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</span>}
            {goal.type === "numeric" && <span className="flex items-center gap-1"><BarChart3 className="size-3" />{goal.currentValue}/{goal.targetValue}{goal.unit}</span>}
            {totalM > 0 && <span className="flex items-center gap-1"><CheckCircle2 className="size-3" />{completedM}/{totalM}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-surface-400 mt-1" /> : <ChevronDown className="size-4 shrink-0 text-surface-400 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-surface-100 px-4 pb-4 pt-3 dark:border-surface-800">
          {goal.type === "numeric" && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-surface-500 dark:text-surface-400">Update Progress</p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={progressValue} onChange={(e) => onProgressValueChange(e.target.value)}
                    className="w-28 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
                    onKeyDown={(e) => { if (e.key === "Enter") onSaveProgress(goal.id); if (e.key === "Escape") onCancelEditProgress(); }} />
                  <span className="text-xs text-surface-400">{goal.unit}</span>
                  <button onClick={() => onSaveProgress(goal.id)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">Save</button>
                  <button onClick={onCancelEditProgress} className="rounded-lg bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-400">Cancel</button>
                </div>
              ) : (
                <button onClick={() => onStartEditProgress(goal.id)} className="rounded-lg border border-dashed border-surface-300 px-3 py-1.5 text-xs font-medium text-surface-500 hover:border-amber-400 hover:text-amber-600 dark:border-surface-600 dark:hover:border-amber-500">+ Update value</button>
              )}
            </div>
          )}

          {goal.type === "habit" && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400">This Week</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">🔥 {goal.currentStreak} day streak</span>
                  <span className="text-surface-400">Best: {goal.bestStreak}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {weeklyGrid.map((day) => {
                  const isToday = day.date === new Date().toISOString().split("T")[0];
                  return (
                    <button key={day.date} onClick={() => { if (isToday) onCheckIn(goal.id); }} disabled={!isToday}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs transition-colors ${
                        day.completed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : isToday ? "border-2 border-dashed border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 cursor-pointer hover:bg-amber-100"
                            : "bg-surface-50 text-surface-400 dark:bg-surface-800 dark:text-surface-500"
                      }`}>
                      <span className="text-[10px] font-medium">{day.day}</span>
                      <span className="text-xs font-semibold">{day.label}</span>
                      {day.completed ? <CheckCircle2 className="size-3" /> : <Circle className="size-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {goal.type === "binary" && (
            <div className="mb-4">
              <button onClick={() => onToggleComplete(goal.id)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  goal.completed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300"
                }`}><CheckCircle2 className="size-4" />{goal.completed ? "Completed!" : "Mark as Complete"}</button>
              {goal.completedAt && <p className="mt-1 text-center text-[10px] text-surface-400">Completed on {new Date(goal.completedAt).toLocaleDateString()}</p>}
            </div>
          )}

          {goal.milestones.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-surface-500 dark:text-surface-400">Milestones</p>
              <div className="space-y-1.5">
                {goal.milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                    <button onClick={() => onToggleMilestone(goal.id, ms.id)} className="shrink-0">
                      {ms.completed ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-4 text-surface-300 dark:text-surface-600" />}
                    </button>
                    <span className={`flex-1 text-xs ${ms.completed ? "text-surface-400 line-through" : "text-surface-700 dark:text-surface-300"}`}>{ms.title}</span>
                    <button onClick={() => onDeleteMilestone(goal.id, ms.id)} className="shrink-0 text-surface-300 hover:text-red-500 transition-colors"><X className="size-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {goal.type === "numeric" && goal.progressHistory.length > 1 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-surface-500 dark:text-surface-400">Progress Over Time</p>
              <div className="flex items-end gap-1 h-16">
                {goal.progressHistory.map((p, i) => {
                  const maxVal = goal.targetValue || 1;
                  const heightPct = Math.max(4, (p.value / maxVal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${p.date}: ${p.value}`}>
                      <div className="w-full rounded-t-sm transition-all" style={{ height: `${heightPct}%`, backgroundColor: category.color, opacity: 0.7 }} />
                      <span className="text-[8px] text-surface-400">{new Date(p.date).getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-surface-100 pt-3 dark:border-surface-800">
            {goal.deadline ? (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-surface-400"}`}>
                <Calendar className="size-3" />Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            ) : <span />}
            <button onClick={() => onDelete(goal.id)} className="flex items-center gap-1 text-xs text-surface-400 hover:text-red-500 transition-colors"><Trash2 className="size-3" />Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: { title: string; description: string; category: GoalCategory; type: GoalType; targetValue: number; unit: string; deadline?: string; milestones: Omit<Milestone, "id" | "completed">[] }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("personal");
  const [type, setType] = useState<GoalType>("numeric");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState<{ title: string; targetValue: string }[]>([]);
  const [newMsTitle, setNewMsTitle] = useState("");
  const [newMsValue, setNewMsValue] = useState("");

  const handleAddMs = () => {
    if (!newMsTitle.trim()) return;
    setMilestones([...milestones, { title: newMsTitle.trim(), targetValue: newMsValue || "0" }]);
    setNewMsTitle(""); setNewMsValue("");
  };
  const handleRemoveMs = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tgt = type === "binary" ? 1 : parseFloat(targetValue) || 0;
    onAdd({ title: title.trim(), description: description.trim(), category, type, targetValue: tgt, unit: type === "numeric" ? unit.trim() : "", deadline: deadline || undefined, milestones: milestones.filter((m) => m.title.trim()).map((m) => ({ title: m.title.trim(), targetValue: parseFloat(m.targetValue) || 0 })) });
  };

  const suggestedUnits = UNIT_SUGGESTIONS[category];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-surface-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-700">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Create New Goal</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Save $15,000 for emergency fund" required
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Why this goal matters..."
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm resize-none dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value as GoalCategory); setUnit(""); }}
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200">
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as GoalType)}
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200">
                <option value="numeric">Numeric (progress bar)</option>
                <option value="habit">Habit (daily check-in)</option>
                <option value="binary">Binary (complete/incomplete)</option>
              </select>
            </div>
          </div>
          {type === "numeric" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Target Value</label>
                <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="100" required min="1"
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Unit</label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {suggestedUnits.map((u) => (
                    <button key={u} type="button" onClick={() => setUnit(u)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${unit === u ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400"}`}>{u}</button>
                  ))}
                </div>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Custom unit"
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200" />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Deadline (optional)</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-500 dark:text-surface-400">Milestones</label>
            <div className="space-y-1.5 mb-2">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-1.5 dark:bg-surface-800">
                  <span className="flex-1 text-xs text-surface-700 dark:text-surface-300">{ms.title}</span>
                  {type === "numeric" && <span className="text-[10px] text-surface-400">{ms.targetValue}</span>}
                  <button type="button" onClick={() => handleRemoveMs(i)} className="text-surface-300 hover:text-red-500"><X className="size-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newMsTitle} onChange={(e) => setNewMsTitle(e.target.value)} placeholder="Milestone name"
                className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMs(); } }} />
              {type === "numeric" && (
                <input type="number" value={newMsValue} onChange={(e) => setNewMsValue(e.target.value)} placeholder="Value"
                  className="w-20 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200" />
              )}
              <button type="button" onClick={handleAddMs} className="rounded-lg bg-surface-100 px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400">+ Add</button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 hover:bg-amber-700 transition-all">Create Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}