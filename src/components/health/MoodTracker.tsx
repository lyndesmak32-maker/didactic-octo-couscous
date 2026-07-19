import { useMemo } from "react";
import { Smile } from "lucide-react";
import type { MoodEntry, MoodEmoji } from "~/types/health";
import { MOODS, MOOD_LABELS } from "~/types/health";

interface Props {
  entries: MoodEntry[];
  onSetMood: (mood: MoodEmoji) => void;
}

export function MoodTracker({ entries, onSetMood }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === today);

  // Build calendar heatmap data (last 30 days)
  const moodMap = useMemo(() => {
    const map: Record<string, MoodEmoji> = {};
    entries.forEach((e) => {
      map[e.date] = e.mood;
    });
    return map;
  }, [entries]);

  const last30Days = useMemo(() => {
    const days: { date: string; day: number; mood?: MoodEmoji; isToday: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      days.push({
        date: ds,
        day: d.getDate(),
        mood: moodMap[ds],
        isToday: ds === today,
      });
    }
    return days;
  }, [moodMap, today]);

  const moodColor = (mood?: MoodEmoji) => {
    switch (mood) {
      case "😊": return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700";
      case "😐": return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600";
      case "😞": return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "😡": return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700";
      case "😴": return "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700";
      default: return "bg-surface-100 dark:bg-surface-800 text-surface-400 border-surface-200 dark:border-surface-700";
    }
  };

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center gap-2 mb-4">
        <Smile className="size-5 text-amber-500" />
        <h3 className="font-semibold text-surface-900 dark:text-surface-100">Mood</h3>
      </div>

      {/* Today's mood selection */}
      <div className="mb-4">
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
          {todayEntry ? `Today: ${MOOD_LABELS[todayEntry.mood]}` : "How are you feeling today?"}
        </p>
        <div className="flex gap-2">
          {MOODS.map((mood) => (
            <button key={mood} onClick={() => onSetMood(mood)}
              className={`flex-1 rounded-xl border-2 py-2.5 text-center text-xl transition-colors ${
                todayEntry?.mood === mood
                  ? `${moodColor(mood)} border-current`
                  : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
              }`}>
              {mood}
            </button>
          ))}
        </div>
        {todayEntry && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {MOODS.map((mood) => (
              <span key={mood} className="text-[10px] text-surface-500">
                {mood} {MOOD_LABELS[mood]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 30-day heatmap */}
      <div>
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Last 30 Days</p>
        <div className="grid grid-cols-10 gap-1">
          {last30Days.map((d) => (
            <div key={d.date}
              className={`aspect-square rounded-md border text-[11px] flex items-center justify-center ${
                moodColor(d.mood)
              } ${d.isToday ? "ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-1" : ""}`}
              title={d.date}>
              {d.mood || d.day}
            </div>
          ))}
        </div>
      </div>

      {/* Recent list */}
      <div className="mt-4 space-y-1 max-h-32 overflow-y-auto">
        {entries.slice(-5).reverse().map((e) => (
          <div key={e.id} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
            <span className="text-lg">{e.mood}</span>
            <span>{new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            <span className="text-surface-400">— {MOOD_LABELS[e.mood]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
