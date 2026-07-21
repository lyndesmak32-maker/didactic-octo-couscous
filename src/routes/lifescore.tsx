import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Sparkles, Zap } from "lucide-react";
import { computeLifeScore, getScoreHistory, getPreviousScore, getWeekTrend, recordScore } from "~/data/lifescore";
import type { LifeScoreResult, CategoryKey, LifeScoreEntry } from "~/types/lifescore";
import { CATEGORY_META } from "~/types/lifescore";
import { ScoreGauge } from "~/components/widgets/ScoreGauge";

export const Route = createFileRoute("/lifescore")({
  component: LifeScorePage,
});

function LifeScorePage() {
  const result = useMemo(() => computeLifeScore(), []);
  const trend = useMemo(() => getWeekTrend(), []);
  const prevScore = useMemo(() => getPreviousScore(), []);
  const history = useMemo(() => getScoreHistory(), []);

  // Record score
  useMemo(() => { recordScore(result); }, [result]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 lg:pb-8 lg:pt-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-3xl">
            Life Score
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Your personal wellness index, updated daily
          </p>
        </div>
        <span className="mt-2 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-400 sm:mt-0">
          Auto-computed
        </span>
      </div>

      {/* Score + Breakdown */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Gauge Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-200 bg-white p-8 dark:border-surface-800 dark:bg-surface-900">
          <ScoreGauge score={result.total} size={180} />
          <div className="mt-4 flex items-center gap-2">
            <TrendIcon trend={trend} />
            <span className={`text-sm font-semibold ${trendColor(trend)}`}>
              {trendLabel(trend)}{" "}
              {prevScore && (
                <span className="font-normal text-surface-400">
                  (was {prevScore.total})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
            Category Breakdown
          </h2>
          <div className="space-y-4">
            {(Object.keys(CATEGORY_META) as CategoryKey[]).map((key) => (
              <CategoryBar key={key} catKey={key} score={result.categories[key]} />
            ))}
          </div>
        </div>
      </div>

      {/* Factors & Recommendations */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
            <Zap className="size-4" /> What's Driving Your Score
          </h2>
          <div className="space-y-3">
            {result.factors.map((f, i) => (
              <FactorRow key={i} factor={f} />
            ))}
            {result.factors.length === 0 && (
              <p className="py-4 text-center text-sm text-surface-400">
                Add more data to see what affects your score.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
            <Sparkles className="size-4" /> How to Improve
          </h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <Link
                key={i}
                to={rec.route}
                className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent-50 dark:hover:bg-accent-950/30"
              >
                <span className="mt-0.5 text-lg">{rec.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-surface-700 dark:text-surface-300">{rec.text}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-700 dark:bg-accent-900/50 dark:text-accent-300">
                  {rec.actionLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Score History */}
      {history.length >= 2 && <ScoreHistoryBars history={history} />}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────

function trendIcon(trend: string) {
  if (trend === "up") return <TrendingUp className="size-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="size-4 text-red-500" />;
  return <Minus className="size-4 text-surface-400" />;
}

function trendColor(trend: string) {
  if (trend === "up") return "text-emerald-600 dark:text-emerald-400";
  if (trend === "down") return "text-red-600 dark:text-red-400";
  return "text-surface-500";
}

function trendLabel(trend: string) {
  if (trend === "up") return "Improving";
  if (trend === "down") return "Declining";
  return "Stable";
}

// ── Components ─────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="size-4 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="size-4 text-red-500" />;
  return <Minus className="size-4 text-surface-400" />;
}

function CategoryBar({ catKey, score }: { catKey: CategoryKey; score: number }) {
  const meta = CATEGORY_META[catKey];
  const pct = (score / meta.max) * 100;
  const barColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : pct >= 40 ? "bg-orange-400" : "bg-red-400";

  return (
    <Link
      to={meta.route}
      className="group block rounded-xl p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300">
          <span className="text-base">{meta.icon}</span> {meta.label}
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-surface-900 dark:text-surface-100">
          {score}/{meta.max}
          <ChevronRight className="size-3.5 text-surface-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}

function FactorRow({ factor }: { factor: { label: string; impact: string; detail: string; route?: string } }) {
  const isPositive = factor.impact === "positive";
  return (
    <div className={`flex items-start gap-3 rounded-xl p-3 ${isPositive ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isPositive ? "bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300" : "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300"}`}>
        {isPositive ? "+" : "−"}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{factor.label}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400">{factor.detail}</p>
      </div>
      {factor.route && (
        <Link to={factor.route} className="shrink-0 text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-300">
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function ScoreHistoryBars({ history }: { history: LifeScoreEntry[] }) {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const maxScore = Math.max(...recent.map((h) => h.total), 1);
  const minScore = Math.min(...recent.map((h) => h.total), 0);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
        Score History
      </h2>
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {recent.map((entry) => {
          const pct = maxScore > minScore ? ((entry.total - minScore) / (maxScore - minScore)) * 100 : 50;
          const height = 30 + (pct / 100) * 80;
          let barColor: string;
          if (entry.total >= 75) barColor = "bg-emerald-500";
          else if (entry.total >= 50) barColor = "bg-amber-400";
          else barColor = "bg-red-400";

          const dateObj = new Date(entry.date + "T00:00:00");
          const label = dateObj.toLocaleDateString("en-US", { weekday: "short" });

          return (
            <div key={entry.date} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">{entry.total}</span>
              <div className="w-full max-w-[32px] overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800">
                <div className={`w-full rounded-lg transition-all duration-300 ${barColor}`} style={{ height: `${height}px` }} />
              </div>
              <span className="text-[10px] text-surface-400">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
