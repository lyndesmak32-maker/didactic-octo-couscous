import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Heart, Droplets, Scale, Pill, Moon, Smile, Bike, UtensilsCrossed, Stethoscope } from "lucide-react";
import { HealthSummaryCards } from "~/components/health/HealthSummaryCards";
import { WaterTracker } from "~/components/health/WaterTracker";
import { WeightTracker } from "~/components/health/WeightTracker";
import { MedicationsList } from "~/components/health/MedicationsList";
import { SleepTracker } from "~/components/health/SleepTracker";
import { MoodTracker } from "~/components/health/MoodTracker";
import { ExerciseTracker } from "~/components/health/ExerciseTracker";
import { NutritionTracker } from "~/components/health/NutritionTracker";
import { DoctorAppointments } from "~/components/health/DoctorAppointments";
import type { MoodEmoji, SleepQuality } from "~/types/health";
import {
  getDailySummary,
  getTodayWater,
  addWater,
  setWaterGoal,
  getWeeklyWater,
  getWeightEntries,
  addWeightEntry,
  deleteWeightEntry,
  getMedications,
  toggleMedication,
  addMedication,
  deleteMedication,
  getSleepEntries,
  addSleepEntry,
  getMoodEntries,
  setTodayMood,
  getExerciseEntries,
  addExerciseEntry,
  deleteExerciseEntry,
  getWeeklyExerciseSummary,
  getNutritionEntries,
  addNutritionEntry,
  deleteNutritionEntry,
  getDoctorAppointments,
  addDoctorAppointment,
  deleteDoctorAppointment,
  getSettings,
} from "~/data/health";

export const Route = createFileRoute("/health")({ component: HealthPage });

type SectionId = "water" | "weight" | "medications" | "sleep" | "mood" | "exercise" | "nutrition" | "appointments";

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "water", label: "Water", icon: <Droplets className="size-4" /> },
  { id: "weight", label: "Weight", icon: <Scale className="size-4" /> },
  { id: "medications", label: "Meds", icon: <Pill className="size-4" /> },
  { id: "sleep", label: "Sleep", icon: <Moon className="size-4" /> },
  { id: "mood", label: "Mood", icon: <Smile className="size-4" /> },
  { id: "exercise", label: "Exercise", icon: <Bike className="size-4" /> },
  { id: "nutrition", label: "Nutrition", icon: <UtensilsCrossed className="size-4" /> },
  { id: "appointments", label: "Appts", icon: <Stethoscope className="size-4" /> },
];

function HealthPage() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Daily summary (auto-refreshes on tick)
  const summary = useMemo(() => getDailySummary(), [tick]);
  const settings = useMemo(() => getSettings(), [tick]);

  // Water
  const todayWater = useMemo(() => getTodayWater(), [tick]);
  const weeklyWater = useMemo(() => getWeeklyWater(), [tick]);
  const handleAddWater = useCallback((oz: number) => { addWater(oz); refresh(); }, [refresh]);
  const handleSetWaterGoal = useCallback((oz: number) => { setWaterGoal(oz); refresh(); }, [refresh]);

  // Weight
  const weightEntries = useMemo(() => getWeightEntries(), [tick]);
  const handleAddWeight = useCallback((data: { date: string; weight: number }) => {
    addWeightEntry(data); refresh();
  }, [refresh]);
  const handleDeleteWeight = useCallback((id: string) => { deleteWeightEntry(id); refresh(); }, [refresh]);

  // Medications
  const medications = useMemo(() => getMedications(), [tick]);
  const handleToggleMed = useCallback((id: string) => { toggleMedication(id); refresh(); }, [refresh]);
  const handleAddMed = useCallback((data: { name: string; dosage: string; time: string; notes?: string }) => {
    addMedication(data); refresh();
  }, [refresh]);
  const handleDeleteMed = useCallback((id: string) => { deleteMedication(id); refresh(); }, [refresh]);

  // Sleep
  const sleepEntries = useMemo(() => getSleepEntries(), [tick]);
  const handleAddSleep = useCallback((data: {
    date: string; bedtime: string; wakeTime: string; hours: number; quality: SleepQuality; notes?: string;
  }) => { addSleepEntry(data); refresh(); }, [refresh]);

  // Mood
  const moodEntries = useMemo(() => getMoodEntries(), [tick]);
  const handleSetMood = useCallback((mood: MoodEmoji) => { setTodayMood(mood); refresh(); }, [refresh]);

  // Exercise
  const exerciseEntries = useMemo(() => getExerciseEntries(), [tick]);
  const weeklyExSummary = useMemo(() => getWeeklyExerciseSummary(), [tick]);
  const handleAddExercise = useCallback((data: {
    date: string; activityType: string; durationMinutes: number; calories: number; notes?: string;
  }) => { addExerciseEntry(data); refresh(); }, [refresh]);
  const handleDeleteExercise = useCallback((id: string) => { deleteExerciseEntry(id); refresh(); }, [refresh]);

  // Nutrition
  const todayNutrition = useMemo(() => getNutritionEntries(new Date().toISOString().split("T")[0]), [tick]);
  const handleAddNutrition = useCallback((data: {
    date: string; meal: string; calories: number; protein: number; carbs: number; fat: number; notes?: string;
  }) => { addNutritionEntry(data); refresh(); }, [refresh]);
  const handleDeleteNutrition = useCallback((id: string) => { deleteNutritionEntry(id); refresh(); }, [refresh]);

  // Appointments
  const appointments = useMemo(() => getDoctorAppointments(), [tick]);
  const handleAddAppointment = useCallback((data: {
    doctorName: string; specialty?: string; date: string; time: string; location?: string; notes?: string;
  }) => { addDoctorAppointment(data); refresh(); }, [refresh]);
  const handleDeleteAppointment = useCallback((id: string) => { deleteDoctorAppointment(id); refresh(); }, [refresh]);

  // Daily reset for medications
  useEffect(() => {
    const lastReset = localStorage.getItem("lifeos-health-med-reset");
    const today = new Date().toISOString().split("T")[0];
    if (lastReset !== today) {
      // Check all medications and reset if needed
      const meds = getMedications();
      const allReset = meds.every((m) => !m.taken);
      if (!allReset) {
        // Only reset if it's a new day and meds were taken yesterday
        localStorage.setItem("lifeos-health-med-reset", today);
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <Heart className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 lg:text-3xl">
              Health
            </h2>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              Fitness, nutrition, sleep, and wellness — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <HealthSummaryCards summary={summary} />
      </div>

      {/* Section navigation pills */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors"
          >
            {section.icon}
            {section.label}
          </a>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-5">
        <section id="water">
          <WaterTracker
            waterOz={todayWater.totalOz}
            goalOz={todayWater.goalOz}
            weeklyWater={weeklyWater}
            onAddWater={handleAddWater}
            onChangeGoal={handleSetWaterGoal}
          />
        </section>

        <section id="weight">
          <WeightTracker
            entries={weightEntries}
            goalWeight={settings.weightGoal}
            onAdd={handleAddWeight}
            onDelete={handleDeleteWeight}
          />
        </section>

        <section id="medications">
          <MedicationsList
            medications={medications}
            onToggle={handleToggleMed}
            onAdd={handleAddMed}
            onDelete={handleDeleteMed}
          />
        </section>

        <section id="sleep">
          <SleepTracker
            sleepEntries={sleepEntries}
            sleepGoalHours={settings.sleepGoalHours}
            onAdd={handleAddSleep}
          />
        </section>

        <section id="mood">
          <MoodTracker
            entries={moodEntries}
            onSetMood={handleSetMood}
          />
        </section>

        <section id="exercise">
          <ExerciseTracker
            entries={exerciseEntries}
            weeklyMinutes={weeklyExSummary.totalMinutes}
            weeklySessions={weeklyExSummary.sessions}
            onAdd={handleAddExercise}
            onDelete={handleDeleteExercise}
          />
        </section>

        <section id="nutrition">
          <NutritionTracker
            entries={todayNutrition}
            dailyCalorieGoal={settings.dailyCalorieGoal}
            onAdd={handleAddNutrition}
            onDelete={handleDeleteNutrition}
          />
        </section>

        <section id="appointments">
          <DoctorAppointments
            appointments={appointments}
            onAdd={handleAddAppointment}
            onDelete={handleDeleteAppointment}
          />
        </section>
      </div>
    </div>
  );
}
