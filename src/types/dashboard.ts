export interface WeatherData {
  temperature: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "snow" | "wind" | "fog";
  location: string;
  high: number;
  low: number;
  humidity: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  location?: string;
  color?: string;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  category: "health" | "work" | "personal" | "finance";
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO 8601 date
  status: "paid" | "upcoming" | "overdue" | "due-today";
}

export interface HealthSnapshot {
  steps: number;
  stepGoal: number;
  waterOz: number;
  waterGoalOz: number;
  sleepHours: number;
  sleepGoalHours: number;
  activeMinutes: number;
}

export interface TrafficEstimate {
  commuteMinutes: number;
  typicalMinutes: number;
  condition: "light" | "moderate" | "heavy";
  destination: string;
}

export interface SleepRecommendation {
  bedtime: string; // e.g. "10:30 PM"
  wakeTime: string;
  hoursRecommended: number;
  firstEventTitle: string;
  firstEventTime: string;
}

export interface BudgetData {
  spent: number;
  total: number;
  category: string; // e.g. "Monthly Budget"
  daysRemaining: number;
}

export interface AIBriefing {
  type: "morning" | "afternoon" | "evening";
  headline: string;
  points: string[];
  mood?: "productive" | "balanced" | "reflective";
}

export type TimeOfDay = "morning" | "afternoon" | "evening";
