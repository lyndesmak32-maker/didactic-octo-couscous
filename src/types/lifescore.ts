// ── Category Scores ─────────────────────────────────────────
export interface CategoryScores {
  financialHealth: number;  // 0–25
  physicalHealth: number;   // 0–20
  mentalWellness: number;   // 0–15
  productivity: number;     // 0–20
  lifeManagement: number;   // 0–20
}

export type CategoryKey = keyof CategoryScores;

export const CATEGORY_META: Record<CategoryKey, { label: string; max: number; icon: string; route: string }> = {
  financialHealth:  { label: "Financial Health",  max: 25, icon: "💰", route: "/finances" },
  physicalHealth:   { label: "Physical Health",   max: 20, icon: "💪", route: "/health" },
  mentalWellness:   { label: "Mental Wellness",   max: 15, icon: "🧠", route: "/health" },
  productivity:     { label: "Productivity",      max: 20, icon: "🎯", route: "/goals" },
  lifeManagement:   { label: "Life Management",   max: 20, icon: "📋", route: "/calendar" },
};

// ── Factor ───────────────────────────────────────────────────
export interface ScoreFactor {
  label: string;
  impact: "positive" | "negative";
  detail: string;
  route?: string;
}

// ── Recommendation ───────────────────────────────────────────
export interface Recommendation {
  text: string;
  actionLabel: string;
  route: string;
  icon: string;
}

// ── Score Result ─────────────────────────────────────────────
export interface LifeScoreResult {
  total: number;                // 0–100
  categories: CategoryScores;
  factors: ScoreFactor[];
  recommendations: Recommendation[];
}

// ── History Entry ────────────────────────────────────────────
export interface LifeScoreEntry {
  date: string;       // ISO date YYYY-MM-DD
  total: number;
  categories: CategoryScores;
}
