// ── Water ──────────────────────────────────────────────
export interface WaterEntry {
  date: string; // ISO date YYYY-MM-DD
  totalOz: number;
  goalOz: number;
}

// ── Weight ─────────────────────────────────────────────
export interface WeightEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  weight: number; // lbs
}

// ── Medication ─────────────────────────────────────────
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // e.g. "08:00"
  taken: boolean;
  notes?: string;
}

// ── Sleep ──────────────────────────────────────────────
export type SleepQuality = "poor" | "fair" | "good" | "excellent";

export interface SleepEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  bedtime: string; // e.g. "22:30"
  wakeTime: string; // e.g. "06:30"
  hours: number;
  quality: SleepQuality;
  notes?: string;
}

// ── Mood ───────────────────────────────────────────────
export type MoodEmoji = "😊" | "😐" | "😞" | "😡" | "😴";

export interface MoodEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  mood: MoodEmoji;
  notes?: string;
}

export const MOOD_LABELS: Record<MoodEmoji, string> = {
  "😊": "Happy",
  "😐": "Neutral",
  "😞": "Sad",
  "😡": "Angry",
  "😴": "Tired",
};

export const MOODS: MoodEmoji[] = ["😊", "😐", "😞", "😡", "😴"];

// ── Exercise ───────────────────────────────────────────
export interface ExerciseEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  activityType: string;
  durationMinutes: number;
  calories: number;
  notes?: string;
}

// ── Nutrition ──────────────────────────────────────────
export interface NutritionEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  meal: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  notes?: string;
}

// ── Appointments ───────────────────────────────────────
export interface DoctorAppointment {
  id: string;
  doctorName: string;
  specialty?: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // e.g. "14:00"
  location?: string;
  notes?: string;
}

// ── Aggregate Store ────────────────────────────────────
export interface HealthData {
  waterEntries: WaterEntry[];
  weightEntries: WeightEntry[];
  medications: Medication[];
  sleepEntries: SleepEntry[];
  moodEntries: MoodEntry[];
  exerciseEntries: ExerciseEntry[];
  nutritionEntries: NutritionEntry[];
  doctorAppointments: DoctorAppointment[];
  settings: HealthSettings;
}

export interface HealthSettings {
  waterGoalOz: number;
  sleepGoalHours: number;
  dailyCalorieGoal: number;
  stepGoal: number;
  weightGoal?: number; // optional target weight
}

export const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  waterGoalOz: 64,
  sleepGoalHours: 8,
  dailyCalorieGoal: 2000,
  stepGoal: 10000,
};

// ── Daily Summary (computed) ───────────────────────────
export interface DailyHealthSummary {
  date: string;
  waterOz: number;
  waterGoalOz: number;
  weight?: number;
  sleepHours?: number;
  sleepGoalHours: number;
  mood?: MoodEmoji;
  exerciseMinutes: number;
  exerciseSessions: number;
  calories: number;
  calorieGoal: number;
  protein: number;
  carbs: number;
  fat: number;
  medicationsTaken: number;
  medicationsTotal: number;
  steps: number;
  stepGoal: number;
  activeMinutes: number;
}
