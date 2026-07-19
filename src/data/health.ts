import type {
  HealthData,
  HealthSettings,
  WaterEntry,
  WeightEntry,
  Medication,
  SleepEntry,
  SleepQuality,
  MoodEntry,
  MoodEmoji,
  ExerciseEntry,
  NutritionEntry,
  DoctorAppointment,
  DailyHealthSummary,
} from "~/types/health";
import { DEFAULT_HEALTH_SETTINGS } from "~/types/health";

const STORAGE_KEY = "lifeos-health";

// ── Helpers ────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Seed Data ──────────────────────────────────────────
function createSeedData(): HealthData {
  const t = todayStr();

  // Generate 30 days of water entries
  const waterEntries: WaterEntry[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = daysAgo(i);
    waterEntries.push({
      date,
      totalOz: i === 0 ? 48 : randomInt(32, 80),
      goalOz: 64,
    });
  }

  // Generate 30 days of weight entries
  const weightEntries: WeightEntry[] = [];
  let weight = 178.5;
  for (let i = 29; i >= 0; i--) {
    const date = daysAgo(i);
    // slight downward trend
    weight -= Math.random() * 0.3 - 0.1;
    if (i % 3 === 0 || i === 0) {
      weightEntries.push({
        id: `wt-${i}`,
        date,
        weight: Math.round(weight * 10) / 10,
      });
    }
  }

  // Medications
  const medications: Medication[] = [
    { id: "med-1", name: "Vitamin D", dosage: "2000 IU", time: "08:00", taken: true },
    { id: "med-2", name: "Lisinopril", dosage: "10mg", time: "08:00", taken: true },
    { id: "med-3", name: "Multivitamin", dosage: "1 tablet", time: "12:00", taken: false },
    { id: "med-4", name: "Magnesium", dosage: "400mg", time: "22:00", taken: false },
  ];

  // Sleep entries (last 14 days)
  const sleepEntries: SleepEntry[] = [];
  const qualities: SleepQuality[] = ["poor", "fair", "good", "excellent"];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i);
    const hours = i === 0 ? 7.2 : randomInt(55, 90) / 10;
    const bedHour = randomInt(21, 23);
    const bedMin = randomInt(0, 3) * 15;
    const wakeHour = randomInt(5, 7);
    const wakeMin = randomInt(0, 3) * 15;
    sleepEntries.push({
      id: `sleep-${i}`,
      date,
      bedtime: `${String(bedHour).padStart(2, "0")}:${String(bedMin).padStart(2, "0")}`,
      wakeTime: `${String(wakeHour).padStart(2, "0")}:${String(wakeMin).padStart(2, "0")}`,
      hours,
      quality: qualities[randomInt(1, 3)],
    });
  }

  // Mood entries (last 14 days)
  const moodEntries: MoodEntry[] = [];
  const moods: MoodEmoji[] = ["😊", "😐", "😞", "😡", "😴"];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i);
    const mood = i <= 1 ? moods[randomInt(0, 1)] : moods[randomInt(0, 4)];
    moodEntries.push({
      id: `mood-${i}`,
      date,
      mood,
    });
  }

  // Exercise entries (last 14 days)
  const exerciseEntries: ExerciseEntry[] = [
    { id: "ex-1", date: t, activityType: "Running", durationMinutes: 30, calories: 320, notes: "Morning run in the park" },
    { id: "ex-2", date: daysAgo(1), activityType: "Weight Training", durationMinutes: 45, calories: 280, notes: "Upper body focus" },
    { id: "ex-3", date: daysAgo(2), activityType: "Yoga", durationMinutes: 60, calories: 180, notes: "Vinyasa flow" },
    { id: "ex-4", date: daysAgo(3), activityType: "Cycling", durationMinutes: 40, calories: 400, notes: "Indoor cycling" },
    { id: "ex-5", date: daysAgo(5), activityType: "Running", durationMinutes: 25, calories: 260 },
    { id: "ex-6", date: daysAgo(6), activityType: "Swimming", durationMinutes: 30, calories: 250, notes: "Laps at the pool" },
    { id: "ex-7", date: daysAgo(7), activityType: "Weight Training", durationMinutes: 50, calories: 310, notes: "Lower body" },
    { id: "ex-8", date: daysAgo(9), activityType: "HIIT", durationMinutes: 20, calories: 280 },
    { id: "ex-9", date: daysAgo(10), activityType: "Running", durationMinutes: 35, calories: 380, notes: "Interval training" },
    { id: "ex-10", date: daysAgo(12), activityType: "Yoga", durationMinutes: 45, calories: 150 },
    { id: "ex-11", date: daysAgo(13), activityType: "Cycling", durationMinutes: 30, calories: 320 },
    { id: "ex-12", date: daysAgo(14), activityType: "Weight Training", durationMinutes: 40, calories: 260 },
  ];

  // Nutrition entries (last 7 days)
  const nutritionEntries: NutritionEntry[] = [
    { id: "nut-1", date: t, meal: "Breakfast", calories: 450, protein: 25, carbs: 55, fat: 14, notes: "Oatmeal with banana and eggs" },
    { id: "nut-2", date: t, meal: "Lunch", calories: 620, protein: 42, carbs: 48, fat: 22, notes: "Grilled chicken salad" },
    { id: "nut-3", date: t, meal: "Snack", calories: 180, protein: 10, carbs: 25, fat: 5, notes: "Greek yogurt with berries" },
    { id: "nut-4", date: t, meal: "Dinner", calories: 580, protein: 38, carbs: 52, fat: 18, notes: "Salmon with quinoa and broccoli" },
    { id: "nut-5", date: daysAgo(1), meal: "Breakfast", calories: 380, protein: 20, carbs: 45, fat: 12 },
    { id: "nut-6", date: daysAgo(1), meal: "Lunch", calories: 550, protein: 35, carbs: 50, fat: 18 },
    { id: "nut-7", date: daysAgo(1), meal: "Dinner", calories: 650, protein: 45, carbs: 48, fat: 22 },
    { id: "nut-8", date: daysAgo(2), meal: "Breakfast", calories: 420, protein: 22, carbs: 50, fat: 14 },
    { id: "nut-9", date: daysAgo(2), meal: "Lunch", calories: 580, protein: 38, carbs: 52, fat: 16 },
    { id: "nut-10", date: daysAgo(2), meal: "Dinner", calories: 700, protein: 50, carbs: 55, fat: 24 },
    { id: "nut-11", date: daysAgo(3), meal: "Breakfast", calories: 350, protein: 18, carbs: 42, fat: 10 },
    { id: "nut-12", date: daysAgo(3), meal: "Lunch", calories: 600, protein: 40, carbs: 48, fat: 20 },
  ];

  // Doctor appointments
  const futureDate = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  };

  const doctorAppointments: DoctorAppointment[] = [
    { id: "apt-1", doctorName: "Dr. Sarah Chen", specialty: "Primary Care", date: futureDate(5), time: "10:00", location: "City Medical Center", notes: "Annual physical" },
    { id: "apt-2", doctorName: "Dr. James Wilson", specialty: "Dentist", date: futureDate(14), time: "09:30", location: "Bright Smile Dental", notes: "Cleaning and checkup" },
    { id: "apt-3", doctorName: "Dr. Emily Park", specialty: "Dermatologist", date: futureDate(21), time: "14:00", location: "Skin Health Clinic" },
    { id: "apt-4", doctorName: "Dr. Patel", specialty: "Cardiologist", date: daysAgo(10), time: "11:00", location: "Heart Care Associates", notes: "Annual checkup — all clear" },
  ];

  return {
    waterEntries,
    weightEntries,
    medications,
    sleepEntries,
    moodEntries,
    exerciseEntries,
    nutritionEntries,
    doctorAppointments,
    settings: { ...DEFAULT_HEALTH_SETTINGS },
  };
}

// ── Persistence ─────────────────────────────────────────
function loadData(): HealthData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as HealthData;
  } catch {
    // corrupted
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: HealthData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: HealthData | null = null;
function getData(): HealthData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 200;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: Settings ───────────────────────────────
export function getSettings(): HealthSettings {
  return getData().settings;
}

export function updateSettings(updates: Partial<HealthSettings>): void {
  const store = getData();
  store.settings = { ...store.settings, ...updates };
  persist();
}

// ── Public API: Water ──────────────────────────────────
export function getWaterEntries(): WaterEntry[] {
  return getData().waterEntries;
}

export function getTodayWater(): WaterEntry {
  const t = todayStr();
  const store = getData();
  let entry = store.waterEntries.find((w) => w.date === t);
  if (!entry) {
    entry = { date: t, totalOz: 0, goalOz: store.settings.waterGoalOz };
    store.waterEntries.push(entry);
    persist();
  }
  return entry;
}

export function addWater(oz: number): WaterEntry {
  const store = getData();
  const t = todayStr();
  let entry = store.waterEntries.find((w) => w.date === t);
  if (!entry) {
    entry = { date: t, totalOz: oz, goalOz: store.settings.waterGoalOz };
    store.waterEntries.push(entry);
  } else {
    entry.totalOz += oz;
  }
  persist();
  return entry;
}

export function setWaterGoal(oz: number): void {
  updateSettings({ waterGoalOz: oz });
  const store = getData();
  const t = todayStr();
  const entry = store.waterEntries.find((w) => w.date === t);
  if (entry) entry.goalOz = oz;
  persist();
}

// ── Public API: Weight ─────────────────────────────────
export function getWeightEntries(): WeightEntry[] {
  return getData().weightEntries;
}

export function addWeightEntry(data: Omit<WeightEntry, "id">): WeightEntry {
  const store = getData();
  const entry: WeightEntry = { ...data, id: genId("wt") };
  store.weightEntries.push(entry);
  store.weightEntries.sort((a, b) => a.date.localeCompare(b.date));
  persist();
  return entry;
}

export function deleteWeightEntry(id: string): void {
  const store = getData();
  store.weightEntries = store.weightEntries.filter((w) => w.id !== id);
  persist();
}

// ── Public API: Medications ────────────────────────────
export function getMedications(): Medication[] {
  return getData().medications;
}

export function toggleMedication(id: string): void {
  const store = getData();
  const med = store.medications.find((m) => m.id === id);
  if (med) med.taken = !med.taken;
  persist();
}

export function addMedication(data: Omit<Medication, "id" | "taken">): Medication {
  const store = getData();
  const med: Medication = { ...data, id: genId("med"), taken: false };
  store.medications.push(med);
  persist();
  return med;
}

export function updateMedication(id: string, data: Partial<Omit<Medication, "id">>): void {
  const store = getData();
  const idx = store.medications.findIndex((m) => m.id === id);
  if (idx === -1) return;
  store.medications[idx] = { ...store.medications[idx], ...data };
  persist();
}

export function deleteMedication(id: string): void {
  const store = getData();
  store.medications = store.medications.filter((m) => m.id !== id);
  persist();
}

export function resetMedications(): void {
  const store = getData();
  store.medications.forEach((m) => (m.taken = false));
  persist();
}

// ── Public API: Sleep ──────────────────────────────────
export function getSleepEntries(): SleepEntry[] {
  return getData().sleepEntries;
}

export function addSleepEntry(data: Omit<SleepEntry, "id">): SleepEntry {
  const store = getData();
  const entry: SleepEntry = { ...data, id: genId("sleep") };
  // Replace existing entry for same date
  const idx = store.sleepEntries.findIndex((s) => s.date === data.date);
  if (idx !== -1) {
    store.sleepEntries[idx] = entry;
  } else {
    store.sleepEntries.push(entry);
    store.sleepEntries.sort((a, b) => a.date.localeCompare(b.date));
  }
  persist();
  return entry;
}

export function deleteSleepEntry(id: string): void {
  const store = getData();
  store.sleepEntries = store.sleepEntries.filter((s) => s.id !== id);
  persist();
}

// ── Public API: Mood ───────────────────────────────────
export function getMoodEntries(): MoodEntry[] {
  return getData().moodEntries;
}

export function setTodayMood(mood: MoodEmoji, notes?: string): MoodEntry {
  const store = getData();
  const t = todayStr();
  const entry: MoodEntry = { id: genId("mood"), date: t, mood, notes };
  const idx = store.moodEntries.findIndex((m) => m.date === t);
  if (idx !== -1) {
    store.moodEntries[idx] = entry;
  } else {
    store.moodEntries.push(entry);
    store.moodEntries.sort((a, b) => a.date.localeCompare(b.date));
  }
  persist();
  return entry;
}

export function deleteMoodEntry(id: string): void {
  const store = getData();
  store.moodEntries = store.moodEntries.filter((m) => m.id !== id);
  persist();
}

// ── Public API: Exercise ───────────────────────────────
export function getExerciseEntries(): ExerciseEntry[] {
  return getData().exerciseEntries;
}

export function addExerciseEntry(data: Omit<ExerciseEntry, "id">): ExerciseEntry {
  const store = getData();
  const entry: ExerciseEntry = { ...data, id: genId("ex") };
  store.exerciseEntries.push(entry);
  store.exerciseEntries.sort((a, b) => b.date.localeCompare(a.date));
  persist();
  return entry;
}

export function deleteExerciseEntry(id: string): void {
  const store = getData();
  store.exerciseEntries = store.exerciseEntries.filter((e) => e.id !== id);
  persist();
}

// ── Public API: Nutrition ──────────────────────────────
export function getNutritionEntries(date?: string): NutritionEntry[] {
  const all = getData().nutritionEntries;
  if (!date) return all;
  return all.filter((n) => n.date === date);
}

export function addNutritionEntry(data: Omit<NutritionEntry, "id">): NutritionEntry {
  const store = getData();
  const entry: NutritionEntry = { ...data, id: genId("nut") };
  store.nutritionEntries.push(entry);
  persist();
  return entry;
}

export function deleteNutritionEntry(id: string): void {
  const store = getData();
  store.nutritionEntries = store.nutritionEntries.filter((e) => e.id !== id);
  persist();
}

// ── Public API: Appointments ───────────────────────────
export function getDoctorAppointments(): DoctorAppointment[] {
  return getData().doctorAppointments;
}

export function addDoctorAppointment(data: Omit<DoctorAppointment, "id">): DoctorAppointment {
  const store = getData();
  const apt: DoctorAppointment = { ...data, id: genId("apt") };
  store.doctorAppointments.push(apt);
  store.doctorAppointments.sort((a, b) => a.date.localeCompare(b.date));
  persist();
  return apt;
}

export function deleteDoctorAppointment(id: string): void {
  const store = getData();
  store.doctorAppointments = store.doctorAppointments.filter((a) => a.id !== id);
  persist();
}

// ── Public API: Daily Summary ──────────────────────────
export function getDailySummary(date?: string): DailyHealthSummary {
  const t = date || todayStr();
  const store = getData();

  const water = store.waterEntries.find((w) => w.date === t);
  const weight = [...store.weightEntries]
    .filter((w) => w.date <= t)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const sleep = store.sleepEntries.find((s) => s.date === t);
  const mood = store.moodEntries.find((m) => m.date === t);
  const exercises = store.exerciseEntries.filter((e) => e.date === t);
  const nutritions = store.nutritionEntries.filter((n) => n.date === t);

  return {
    date: t,
    waterOz: water?.totalOz ?? 0,
    waterGoalOz: store.settings.waterGoalOz,
    weight: weight?.weight,
    sleepHours: sleep?.hours,
    sleepGoalHours: store.settings.sleepGoalHours,
    mood: mood?.mood,
    exerciseMinutes: exercises.reduce((s, e) => s + e.durationMinutes, 0),
    exerciseSessions: exercises.length,
    calories: nutritions.reduce((s, n) => s + n.calories, 0),
    calorieGoal: store.settings.dailyCalorieGoal,
    protein: nutritions.reduce((s, n) => s + n.protein, 0),
    carbs: nutritions.reduce((s, n) => s + n.carbs, 0),
    fat: nutritions.reduce((s, n) => s + n.fat, 0),
    medicationsTaken: store.medications.filter((m) => m.taken).length,
    medicationsTotal: store.medications.length,
    steps: 6820,
    stepGoal: store.settings.stepGoal,
    activeMinutes: 42,
  };
}

// ── Weekly Water History ───────────────────────────────
export function getWeeklyWater(): WaterEntry[] {
  const store = getData();
  const result: WaterEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = daysAgo(i);
    const entry = store.waterEntries.find((w) => w.date === date);
    result.push(entry ?? { date, totalOz: 0, goalOz: store.settings.waterGoalOz });
  }
  return result;
}

// ── Weekly Exercise Summary ────────────────────────────
export function getWeeklyExerciseSummary(): { totalMinutes: number; sessions: number } {
  const store = getData();
  let totalMinutes = 0;
  let sessions = 0;
  for (let i = 6; i >= 0; i--) {
    const date = daysAgo(i);
    const exercises = store.exerciseEntries.filter((e) => e.date === date);
    totalMinutes += exercises.reduce((s, e) => s + e.durationMinutes, 0);
    sessions += exercises.length;
  }
  return { totalMinutes, sessions };
}

// ── Reset ──────────────────────────────────────────────
export function resetHealthData(): void {
  _cache = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
