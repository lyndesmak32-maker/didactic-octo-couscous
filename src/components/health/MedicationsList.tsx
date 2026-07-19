import { useState, useCallback } from "react";
import { Pill, Check, Plus, Trash2, Clock } from "lucide-react";
import type { Medication } from "~/types/health";

interface Props {
  medications: Medication[];
  onToggle: (id: string) => void;
  onAdd: (data: { name: string; dosage: string; time: string; notes?: string }) => void;
  onDelete: (id: string) => void;
}

export function MedicationsList({ medications, onToggle, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");

  const takenCount = medications.filter((m) => m.taken).length;

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), dosage: dosage.trim(), time });
    setName("");
    setDosage("");
    setTime("08:00");
    setShowAdd(false);
  }, [name, dosage, time, onAdd]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="size-5 text-rose-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Medications</h3>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {takenCount}/{medications.length}
          </span>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Plus className="size-4" />
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 space-y-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="Medication name" />
          <div className="flex gap-2">
            <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)}
              className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              placeholder="Dosage (e.g. 10mg)" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-28 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
          </div>
          <button onClick={handleAdd}
            className="w-full rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors">
            Add Medication
          </button>
        </div>
      )}

      {/* Medication list */}
      <div className="space-y-2">
        {medications.map((med) => (
          <div key={med.id}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
              med.taken
                ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                : "border-surface-200 bg-surface-50/50 dark:border-surface-700 dark:bg-surface-800/30"
            }`}>
            <button onClick={() => onToggle(med.id)}
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                med.taken
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-surface-300 dark:border-surface-600"
              }`}>
              {med.taken && <Check className="size-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${med.taken ? "text-surface-400 line-through" : "text-surface-900 dark:text-surface-100"}`}>
                {med.name}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{med.dosage}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
              <Clock className="size-3" />
              {med.time}
            </div>
            <button onClick={() => onDelete(med.id)}
              className="text-surface-300 hover:text-rose-500 transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {medications.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-4">No medications added</p>
        )}
      </div>
    </div>
  );
}
