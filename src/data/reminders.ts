import type {
  RemindersData,
  RemindersSummary,
  BillReminder,
  BirthdayReminder,
  MedicineReminder,
  TaskReminder,
  AppointmentReminder,
  RenewalReminder,
  ReminderCategory,
  BillFrequency,
  MedicineFrequency,
  TaskPriority,
  RenewalPeriod,
} from "~/types/reminders";

const STORAGE_KEY = "lifeos-reminders";

// ── Helpers ────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  return daysFromNow(-n);
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Seed Data ──────────────────────────────────────────
function createSeedData(): RemindersData {
  const t = todayStr();

  const bills: BillReminder[] = [
    { id: "bill-1", category: "bills", name: "Electric Bill", dueDate: t, amount: 145.32, recurring: "monthly", autoPay: false, paid: false },
    { id: "bill-2", category: "bills", name: "Internet", dueDate: daysFromNow(5), amount: 79.99, recurring: "monthly", autoPay: true, paid: false },
    { id: "bill-3", category: "bills", name: "Rent", dueDate: daysFromNow(12), amount: 2200.0, recurring: "monthly", autoPay: false, paid: false, notes: "Pay via bank transfer" },
    { id: "bill-4", category: "bills", name: "Car Insurance", dueDate: daysFromNow(18), amount: 156.0, recurring: "monthly", autoPay: true, paid: false },
    { id: "bill-5", category: "bills", name: "Netflix", dueDate: daysAgo(2), amount: 15.99, recurring: "monthly", autoPay: true, paid: true },
  ];

  const birthdays: BirthdayReminder[] = [
    { id: "bday-1", category: "birthdays", name: "Mom", date: `2026-08-14`, reminderDaysBefore: 7, notes: "Loves orchids and dark chocolate" },
    { id: "bday-2", category: "birthdays", name: "Sarah (sister)", date: `2026-09-03`, reminderDaysBefore: 3, notes: "Gift card to Sephora usually works" },
    { id: "bday-3", category: "birthdays", name: "Alex (best friend)", date: `2026-07-25`, reminderDaysBefore: 1, notes: "Plan dinner at that Italian place" },
    { id: "bday-4", category: "birthdays", name: "Dad", date: `2026-10-12`, reminderDaysBefore: 7 },
  ];

  const medicine: MedicineReminder[] = [
    { id: "med-1", category: "medicine", name: "Vitamin D3", dosage: "2000 IU", frequency: "daily", timeOfDay: "08:00", startDate: daysAgo(30), taken: false },
    { id: "med-2", category: "medicine", name: "Lisinopril", dosage: "10mg", frequency: "daily", timeOfDay: "08:00", startDate: daysAgo(90), taken: false, notes: "Take with food" },
    { id: "med-3", category: "medicine", name: "Ibuprofen", dosage: "400mg", frequency: "as-needed", timeOfDay: "as-needed", startDate: daysAgo(14), taken: false, notes: "Max 3x daily for back pain" },
    { id: "med-4", category: "medicine", name: "Zyrtec", dosage: "10mg", frequency: "daily", timeOfDay: "20:00", startDate: daysAgo(60), taken: false, notes: "For seasonal allergies" },
    { id: "med-5", category: "medicine", name: "Amoxicillin", dosage: "500mg", frequency: "twice-daily", timeOfDay: "08:00,20:00", startDate: daysAgo(3), endDate: daysFromNow(7), taken: false, notes: "Finish full course" },
  ];

  const tasks: TaskReminder[] = [
    { id: "task-1", category: "tasks", title: "Submit tax documents", dueDate: daysFromNow(2), priority: "high", completed: false, notes: "Need W2 and 1099 forms" },
    { id: "task-2", category: "tasks", title: "Replace air filter", dueDate: daysFromNow(5), priority: "medium", completed: false },
    { id: "task-3", category: "tasks", title: "Schedule dentist appointment", dueDate: daysFromNow(7), priority: "low", completed: false },
    { id: "task-4", category: "tasks", title: "Update resume", dueDate: daysAgo(3), priority: "medium", completed: false },
    { id: "task-5", category: "tasks", title: "Buy groceries", dueDate: t, priority: "high", completed: false, notes: "Milk, eggs, bread, chicken" },
    { id: "task-6", category: "tasks", title: "Read project proposal", dueDate: daysAgo(1), priority: "medium", completed: true },
  ];

  const appointments: AppointmentReminder[] = [
    { id: "apt-1", category: "appointments", title: "Annual Physical", date: daysFromNow(10), time: "10:00", location: "City Medical Center", providerName: "Dr. Sarah Chen", notes: "Fasting blood work — no breakfast" },
    { id: "apt-2", category: "appointments", title: "Dental Cleaning", date: daysFromNow(21), time: "09:30", location: "Bright Smile Dental", providerName: "Dr. James Wilson" },
    { id: "apt-3", category: "appointments", title: "Oil Change", date: daysFromNow(4), time: "14:00", location: "Speedy Lube", notes: "Bring coupon from email" },
    { id: "apt-4", category: "appointments", title: "Haircut", date: t, time: "16:30", location: "Styles by Mia", providerName: "Mia" },
  ];

  const renewals: RenewalReminder[] = [
    { id: "ren-1", category: "renewals", item: "Passport", expirationDate: daysFromNow(240), renewalPeriod: "once", notes: "Renew 6 months before expiration" },
    { id: "ren-2", category: "renewals", item: "Driver's License", expirationDate: daysFromNow(180), renewalPeriod: "biannual" },
    { id: "ren-3", category: "renewals", item: "Car Registration", expirationDate: daysFromNow(65), renewalPeriod: "annual", notes: "Need smog check first" },
    { id: "ren-4", category: "renewals", item: "Amazon Prime", expirationDate: daysFromNow(35), renewalPeriod: "annual" },
  ];

  return { bills, birthdays, medicine, tasks, appointments, renewals };
}

// ── Persistence ─────────────────────────────────────────
function loadData(): RemindersData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RemindersData;
  } catch {
    // corrupted
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: RemindersData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: RemindersData | null = null;
function getData(): RemindersData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 300;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: Summary ─────────────────────────────────
export function getRemindersSummary(): RemindersSummary {
  const store = getData();
  const t = todayStr();
  let total = 0;
  let dueToday = 0;
  let overdue = 0;

  const checkDate = (date: string, completed: boolean) => {
    if (completed) return;
    total++;
    if (date === t) dueToday++;
    else if (date < t) overdue++;
  };

  // Bills
  for (const b of store.bills) {
    if (b.paid) continue;
    total++;
    if (b.dueDate === t) dueToday++;
    else if (b.dueDate < t) overdue++;
  }

  // Birthdays (check if upcoming within 14 days; not "overdue" per se)
  const todayDate = new Date(t + "T00:00:00");
  const currentYear = todayDate.getFullYear();
  for (const bd of store.birthdays) {
    const bdDate = new Date(bd.date + "T00:00:00");
    // Normalize to current year
    const bdThisYear = new Date(currentYear, bdDate.getMonth(), bdDate.getDate());
    // If birthday this year already passed, next year
    const checkBd = bdThisYear < todayDate 
      ? new Date(currentYear + 1, bdDate.getMonth(), bdDate.getDate())
      : bdThisYear;
    const daysDiff = Math.ceil((checkBd.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    total++;
    if (daysDiff <= bd.reminderDaysBefore) dueToday++;
  }

  // Medicine (not taken today)
  for (const m of store.medicine) {
    if (m.taken) continue;
    if (m.endDate && m.endDate < t) continue; // course finished
    if (m.frequency === "as-needed") continue;
    total++;
    // Medicine is always "today" if not taken and active
    dueToday++;
  }

  // Tasks
  for (const tk of store.tasks) {
    checkDate(tk.dueDate, tk.completed);
  }

  // Appointments
  for (const a of store.appointments) {
    total++;
    if (a.date === t) dueToday++;
    else if (a.date < t) overdue++;
  }

  // Renewals
  for (const r of store.renewals) {
    total++;
    if (r.expirationDate === t) dueToday++;
    else if (r.expirationDate < t) overdue++;
  }

  return { total, dueToday, overdue };
}

// ── Public API: Upcoming ────────────────────────────────
export function getUpcomingReminders(days = 7): RemindersData {
  const store = getData();
  const t = todayStr();
  const cutoff = daysFromNow(days);

  const upcoming: RemindersData = {
    bills: store.bills.filter((b) => !b.paid && b.dueDate >= t && b.dueDate <= cutoff),
    birthdays: [],
    medicine: store.medicine.filter((m) => {
      if (m.taken) return false;
      if (m.endDate && m.endDate < t) return false;
      if (m.frequency === "as-needed") return false;
      return true;
    }),
    tasks: store.tasks.filter((tk) => !tk.completed && tk.dueDate >= t && tk.dueDate <= cutoff),
    appointments: store.appointments.filter((a) => a.date >= t && a.date <= cutoff),
    renewals: store.renewals.filter((r) => r.expirationDate >= t && r.expirationDate <= cutoff),
  };

  // Upcoming birthdays
  const todayDate = new Date(t + "T00:00:00");
  const currentYear = todayDate.getFullYear();
  for (const bd of store.birthdays) {
    const bdDate = new Date(bd.date + "T00:00:00");
    const bdThisYear = new Date(currentYear, bdDate.getMonth(), bdDate.getDate());
    const checkBd = bdThisYear < todayDate
      ? new Date(currentYear + 1, bdDate.getMonth(), bdDate.getDate())
      : bdThisYear;
    const daysDiff = Math.ceil((checkBd.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= bd.reminderDaysBefore) {
      upcoming.birthdays.push(bd);
    }
  }

  return upcoming;
}

export function getOverdueReminders(): RemindersData {
  const store = getData();
  const t = todayStr();

  return {
    bills: store.bills.filter((b) => !b.paid && b.dueDate < t),
    birthdays: [],
    medicine: [],
    tasks: store.tasks.filter((tk) => !tk.completed && tk.dueDate < t),
    appointments: store.appointments.filter((a) => a.date < t),
    renewals: store.renewals.filter((r) => r.expirationDate < t),
  };
}

// ── Public API: Category Getters ────────────────────────
export function getBills(): BillReminder[] {
  return getData().bills;
}

export function getBirthdays(): BirthdayReminder[] {
  return getData().birthdays;
}

export function getMedicine(): MedicineReminder[] {
  return getData().medicine;
}

export function getTasks(): TaskReminder[] {
  return getData().tasks;
}

export function getAppointments(): AppointmentReminder[] {
  return getData().appointments;
}

export function getRenewals(): RenewalReminder[] {
  return getData().renewals;
}

export function getByCategory(category: ReminderCategory) {
  const store = getData();
  return store[category];
}

// ── Public API: Bills CRUD ──────────────────────────────
export function addBill(data: Omit<BillReminder, "id" | "category">): BillReminder {
  const store = getData();
  const bill: BillReminder = { ...data, id: genId("bill"), category: "bills" };
  store.bills.push(bill);
  store.bills.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  persist();
  return bill;
}

export function updateBill(id: string, data: Partial<Omit<BillReminder, "id" | "category">>): void {
  const store = getData();
  const idx = store.bills.findIndex((b) => b.id === id);
  if (idx === -1) return;
  store.bills[idx] = { ...store.bills[idx], ...data };
  persist();
}

export function deleteBill(id: string): void {
  const store = getData();
  store.bills = store.bills.filter((b) => b.id !== id);
  persist();
}

export function toggleBillPaid(id: string): void {
  const store = getData();
  const bill = store.bills.find((b) => b.id === id);
  if (!bill) return;
  bill.paid = !bill.paid;
  persist();
}

// ── Public API: Birthdays CRUD ──────────────────────────
export function addBirthday(data: Omit<BirthdayReminder, "id" | "category">): BirthdayReminder {
  const store = getData();
  const bday: BirthdayReminder = { ...data, id: genId("bday"), category: "birthdays" };
  store.birthdays.push(bday);
  store.birthdays.sort((a, b) => a.date.localeCompare(b.date));
  persist();
  return bday;
}

export function updateBirthday(id: string, data: Partial<Omit<BirthdayReminder, "id" | "category">>): void {
  const store = getData();
  const idx = store.birthdays.findIndex((b) => b.id === id);
  if (idx === -1) return;
  store.birthdays[idx] = { ...store.birthdays[idx], ...data };
  persist();
}

export function deleteBirthday(id: string): void {
  const store = getData();
  store.birthdays = store.birthdays.filter((b) => b.id !== id);
  persist();
}

// ── Public API: Medicine CRUD ───────────────────────────
export function addMedicine(data: Omit<MedicineReminder, "id" | "category">): MedicineReminder {
  const store = getData();
  const med: MedicineReminder = { ...data, id: genId("med"), category: "medicine" };
  store.medicine.push(med);
  persist();
  return med;
}

export function updateMedicine(id: string, data: Partial<Omit<MedicineReminder, "id" | "category">>): void {
  const store = getData();
  const idx = store.medicine.findIndex((m) => m.id === id);
  if (idx === -1) return;
  store.medicine[idx] = { ...store.medicine[idx], ...data };
  persist();
}

export function deleteMedicine(id: string): void {
  const store = getData();
  store.medicine = store.medicine.filter((m) => m.id !== id);
  persist();
}

export function toggleMedicineTaken(id: string): void {
  const store = getData();
  const med = store.medicine.find((m) => m.id === id);
  if (!med) return;
  med.taken = !med.taken;
  persist();
}

// ── Public API: Tasks CRUD ──────────────────────────────
export function addTask(data: Omit<TaskReminder, "id" | "category">): TaskReminder {
  const store = getData();
  const task: TaskReminder = { ...data, id: genId("task"), category: "tasks" };
  store.tasks.push(task);
  store.tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  persist();
  return task;
}

export function updateTask(id: string, data: Partial<Omit<TaskReminder, "id" | "category">>): void {
  const store = getData();
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;
  store.tasks[idx] = { ...store.tasks[idx], ...data };
  persist();
}

export function deleteTask(id: string): void {
  const store = getData();
  store.tasks = store.tasks.filter((t) => t.id !== id);
  persist();
}

export function toggleTaskComplete(id: string): void {
  const store = getData();
  const task = store.tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  persist();
}

// ── Public API: Appointments CRUD ───────────────────────
export function addAppointment(data: Omit<AppointmentReminder, "id" | "category">): AppointmentReminder {
  const store = getData();
  const apt: AppointmentReminder = { ...data, id: genId("apt"), category: "appointments" };
  store.appointments.push(apt);
  store.appointments.sort((a, b) => a.date.localeCompare(b.date));
  persist();
  return apt;
}

export function updateAppointment(id: string, data: Partial<Omit<AppointmentReminder, "id" | "category">>): void {
  const store = getData();
  const idx = store.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return;
  store.appointments[idx] = { ...store.appointments[idx], ...data };
  persist();
}

export function deleteAppointment(id: string): void {
  const store = getData();
  store.appointments = store.appointments.filter((a) => a.id !== id);
  persist();
}

// ── Public API: Renewals CRUD ───────────────────────────
export function addRenewal(data: Omit<RenewalReminder, "id" | "category">): RenewalReminder {
  const store = getData();
  const ren: RenewalReminder = { ...data, id: genId("ren"), category: "renewals" };
  store.renewals.push(ren);
  store.renewals.sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
  persist();
  return ren;
}

export function updateRenewal(id: string, data: Partial<Omit<RenewalReminder, "id" | "category">>): void {
  const store = getData();
  const idx = store.renewals.findIndex((r) => r.id === id);
  if (idx === -1) return;
  store.renewals[idx] = { ...store.renewals[idx], ...data };
  persist();
}

export function deleteRenewal(id: string): void {
  const store = getData();
  store.renewals = store.renewals.filter((r) => r.id !== id);
  persist();
}

// ── Reset ───────────────────────────────────────────────
export function resetRemindersData(): void {
  _cache = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
