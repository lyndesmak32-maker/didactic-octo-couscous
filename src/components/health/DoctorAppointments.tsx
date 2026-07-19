import { useState, useCallback } from "react";
import { Stethoscope, Plus, Trash2, MapPin, Calendar, Clock } from "lucide-react";
import type { DoctorAppointment } from "~/types/health";

interface Props {
  appointments: DoctorAppointment[];
  onAdd: (data: { doctorName: string; specialty?: string; date: string; time: string; location?: string; notes?: string }) => void;
  onDelete: (id: string) => void;
}

export function DoctorAppointments({ appointments, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const upcoming = appointments.filter((a) => a.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const past = appointments.filter((a) => a.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = useCallback(() => {
    if (!doctorName.trim() || !date) return;
    onAdd({
      doctorName: doctorName.trim(),
      specialty: specialty.trim() || undefined,
      date,
      time,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setDoctorName("");
    setSpecialty("");
    setDate("");
    setTime("10:00");
    setLocation("");
    setNotes("");
    setShowAdd(false);
  }, [doctorName, specialty, date, time, location, notes, onAdd]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-5 text-violet-500" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Doctor Appointments</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Plus className="size-4" />
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 space-y-2 rounded-lg bg-surface-50 p-3 dark:bg-surface-800/50">
          <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="Doctor name" />
          <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="Specialty (optional)" />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-surface-500 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
            <div>
              <label className="block text-[10px] text-surface-500 mb-1">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-28 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100" />
            </div>
          </div>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="Location (optional)" />
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            placeholder="Notes (optional)" />
          <button onClick={handleAdd}
            className="w-full rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 transition-colors">
            Add Appointment
          </button>
        </div>
      )}

      {/* Upcoming appointments */}
      {upcoming.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Upcoming</p>
          <div className="space-y-2">
            {upcoming.map((apt) => {
              const aptDate = new Date(apt.date + "T12:00:00");
              const daysUntil = Math.ceil((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={apt.id} className="flex items-start gap-3 rounded-xl border border-surface-200 p-3 dark:border-surface-700">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                    <Stethoscope className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{apt.doctorName}</p>
                    {apt.specialty && <p className="text-xs text-violet-500">{apt.specialty}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-surface-500">
                      <span className="flex items-center gap-1"><Calendar className="size-3" /> {aptDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {apt.time}</span>
                      {apt.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {apt.location}</span>}
                    </div>
                    {apt.notes && <p className="mt-1 text-xs text-surface-400">{apt.notes}</p>}
                    {daysUntil <= 3 && (
                      <span className="inline-block mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                      </span>
                    )}
                  </div>
                  <button onClick={() => onDelete(apt.id)}
                    className="text-surface-300 hover:text-rose-500 transition-colors shrink-0">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past appointments */}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Past</p>
          <div className="space-y-1">
            {past.slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                <div>
                  <span className="text-surface-700 dark:text-surface-300">{apt.doctorName}</span>
                  {apt.specialty && <span className="text-surface-400 ml-1">· {apt.specialty}</span>}
                </div>
                <span className="text-xs text-surface-400">
                  {new Date(apt.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-sm text-surface-400 text-center py-4">No appointments</p>
      )}
    </div>
  );
}
