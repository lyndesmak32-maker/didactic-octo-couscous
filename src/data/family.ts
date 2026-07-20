import type {
  FamilyData,
  FamilyMember,
  FamilyRole,
  Chore,
  ChorePriority,
  ChoreRecurrence,
  EmergencyContact,
  Pet,
  VaccinationRecord,
  FamilyExpense,
  FamilyExpenseCategory,
} from "~/types/family";
import { MEMBER_COLORS } from "~/types/family";

const STORAGE_KEY = "lifeos-family";

// ── Helpers ────────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ── Seed Data ──────────────────────────────────────────────
function createSeedData(): FamilyData {
  const members: FamilyMember[] = [
    {
      id: "mem-1",
      name: "Alex",
      role: "Parent",
      avatar: "👨‍💼",
      email: "alex@family.com",
      phone: "555-0101",
      birthday: "1985-06-15",
      color: MEMBER_COLORS[0],
    },
    {
      id: "mem-2",
      name: "Jordan",
      role: "Parent",
      avatar: "👩‍💼",
      email: "jordan@family.com",
      phone: "555-0102",
      birthday: "1987-03-22",
      color: MEMBER_COLORS[2],
    },
    {
      id: "mem-3",
      name: "Taylor",
      role: "Child",
      avatar: "🧒",
      birthday: "2015-09-10",
      color: MEMBER_COLORS[3],
    },
    {
      id: "mem-4",
      name: "Casey",
      role: "Child",
      avatar: "👧",
      birthday: "2018-01-28",
      color: MEMBER_COLORS[4],
    },
    {
      id: "mem-5",
      name: "Grandma Rose",
      role: "Grandparent",
      avatar: "👵",
      phone: "555-0105",
      birthday: "1952-11-03",
      color: MEMBER_COLORS[5],
    },
  ];

  const chores: Chore[] = [
    { id: "ch-1", name: "Take out trash", assignedTo: "mem-3", dueDate: todayStr(), completed: false, recurring: "weekly", priority: "medium" },
    { id: "ch-2", name: "Vacuum living room", assignedTo: "mem-1", dueDate: todayStr(), completed: false, recurring: "weekly", priority: "medium" },
    { id: "ch-3", name: "Clean kitchen counters", assignedTo: "mem-2", dueDate: daysAgo(1), completed: true, recurring: "daily", priority: "high" },
    { id: "ch-4", name: "Mow the lawn", assignedTo: "mem-1", dueDate: daysFromNow(2), completed: false, recurring: "weekly", priority: "medium" },
    { id: "ch-5", name: "Fold laundry", assignedTo: "mem-4", dueDate: todayStr(), completed: false, priority: "low" },
    { id: "ch-6", name: "Do homework", assignedTo: "mem-3", dueDate: todayStr(), completed: true, recurring: "daily", priority: "high" },
    { id: "ch-7", name: "Feed the dog", assignedTo: "mem-4", dueDate: todayStr(), completed: true, recurring: "daily", priority: "high" },
    { id: "ch-8", name: "Water plants", assignedTo: "mem-2", dueDate: daysFromNow(1), completed: false, recurring: "weekly", priority: "low" },
    { id: "ch-9", name: "Clean bathroom", assignedTo: "mem-1", dueDate: daysFromNow(3), completed: false, recurring: "weekly", priority: "medium" },
    { id: "ch-10", name: "Sort recycling", assignedTo: "mem-3", dueDate: daysFromNow(1), completed: false, recurring: "weekly", priority: "low" },
    { id: "ch-11", name: "Make beds", assignedTo: "mem-4", dueDate: todayStr(), completed: false, recurring: "daily", priority: "low" },
    { id: "ch-12", name: "Grocery shopping", assignedTo: "mem-2", dueDate: daysFromNow(2), completed: false, recurring: "weekly", priority: "high" },
  ];

  const contacts: EmergencyContact[] = [
    { id: "ct-1", name: "Dr. Sarah Chen", relationship: "Family Doctor", phone: "555-0201", notes: "City Medical Center" },
    { id: "ct-2", name: "Robert Smith", relationship: "Neighbor", phone: "555-0202", notes: "House key holder" },
    { id: "ct-3", name: "Linda Park", relationship: "Babysitter", phone: "555-0203", notes: "Available weeknights" },
    { id: "ct-4", name: "Poison Control", relationship: "Emergency", phone: "1-800-222-1222", notes: "24/7" },
    { id: "ct-5", name: "Oakwood Elementary", relationship: "School", phone: "555-0204", notes: "Taylor's school" },
    { id: "ct-6", name: "Animal Emergency Hospital", relationship: "Vet Emergency", phone: "555-0205", notes: "Open 24/7" },
  ];

  const pets: Pet[] = [
    {
      id: "pet-1",
      name: "Max",
      type: "Dog",
      breed: "Golden Retriever",
      age: 5,
      vetName: "Dr. Wilson",
      vetPhone: "555-0301",
      notes: "Friendly, loves fetch. Allergic to chicken.",
      vaccinations: [
        { id: "vax-1", date: daysAgo(30), type: "Rabies", notes: "3-year vaccine" },
        { id: "vax-2", date: daysAgo(90), type: "DHPP", notes: "Annual booster" },
        { id: "vax-3", date: daysAgo(180), type: "Bordetella", notes: "Kennel cough" },
      ],
    },
    {
      id: "pet-2",
      name: "Luna",
      type: "Cat",
      breed: "Siamese",
      age: 3,
      vetName: "Dr. Wilson",
      vetPhone: "555-0301",
      notes: "Indoor only. Very vocal.",
      vaccinations: [
        { id: "vax-4", date: daysAgo(60), type: "Rabies", notes: "1-year vaccine" },
        { id: "vax-5", date: daysAgo(120), type: "FVRCP", notes: "Annual" },
      ],
    },
    {
      id: "pet-3",
      name: "Nemo",
      type: "Fish",
      breed: "Betta",
      age: 1,
      notes: "Tank in Taylor's room. Feed 2x daily.",
      vaccinations: [],
    },
  ];

  const expenses: FamilyExpense[] = [
    { id: "fe-1", description: "Weekly groceries", amount: 185.42, paidBy: "mem-1", category: "Groceries", date: daysAgo(3) },
    { id: "fe-2", description: "Family dinner out", amount: 87.50, paidBy: "mem-2", category: "Dining", date: daysAgo(5) },
    { id: "fe-3", description: "School supplies", amount: 42.99, paidBy: "mem-1", category: "School", date: daysAgo(7) },
    { id: "fe-4", description: "Electric bill", amount: 138.75, paidBy: "mem-2", category: "Utilities", date: daysAgo(10) },
    { id: "fe-5", description: "Movie tickets", amount: 56.00, paidBy: "mem-2", category: "Entertainment", date: daysAgo(12) },
    { id: "fe-6", description: "Gas", amount: 62.30, paidBy: "mem-1", category: "Transport", date: daysAgo(4) },
    { id: "fe-7", description: "Pet food & supplies", amount: 48.97, paidBy: "mem-2", category: "Shopping", date: daysAgo(6) },
    { id: "fe-8", description: "Taylor's doctor visit", amount: 25.00, paidBy: "mem-1", category: "Medical", date: daysAgo(14) },
  ];

  return { members, chores, contacts, pets, expenses };
}

// ── Persistence ─────────────────────────────────────────────
function loadData(): FamilyData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FamilyData;
  } catch {
    // corrupted
  }
  const seed = createSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: FamilyData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _cache: FamilyData | null = null;
function getData(): FamilyData {
  if (!_cache) _cache = loadData();
  return _cache;
}
function persist(): void {
  if (_cache) saveData(_cache);
}

let _idCounter = 500;
function genId(prefix: string): string {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ── Public API: Members ────────────────────────────────────
export function getMembers(): FamilyMember[] {
  return getData().members;
}

export function getMember(id: string): FamilyMember | undefined {
  return getData().members.find((m) => m.id === id);
}

export function addMember(data: Omit<FamilyMember, "id">): FamilyMember {
  const store = getData();
  const member: FamilyMember = { ...data, id: genId("mem") };
  store.members.push(member);
  persist();
  return member;
}

export function updateMember(id: string, data: Partial<Omit<FamilyMember, "id">>): void {
  const store = getData();
  const idx = store.members.findIndex((m) => m.id === id);
  if (idx === -1) return;
  store.members[idx] = { ...store.members[idx], ...data };
  persist();
}

export function deleteMember(id: string): void {
  const store = getData();
  store.members = store.members.filter((m) => m.id !== id);
  // Clean up chores and expenses referencing deleted member
  store.chores = store.chores.filter((c) => c.assignedTo !== id);
  store.expenses = store.expenses.filter((e) => e.paidBy !== id);
  persist();
}

// ── Public API: Chores ─────────────────────────────────────
export function getChores(): Chore[] {
  return getData().chores;
}

export function getChoresForWeek(): Chore[] {
  const chores = getData().chores;
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const tStr = todayStr();
  const eStr = weekEnd.toISOString().split("T")[0];
  return chores.filter((c) => c.dueDate >= tStr && c.dueDate <= eStr);
}

export function addChore(data: Omit<Chore, "id">): Chore {
  const store = getData();
  const chore: Chore = { ...data, id: genId("ch") };
  store.chores.push(chore);
  persist();
  return chore;
}

export function updateChore(id: string, data: Partial<Omit<Chore, "id">>): void {
  const store = getData();
  const idx = store.chores.findIndex((c) => c.id === id);
  if (idx === -1) return;
  store.chores[idx] = { ...store.chores[idx], ...data };
  persist();
}

export function toggleChore(id: string): void {
  const store = getData();
  const chore = store.chores.find((c) => c.id === id);
  if (chore) chore.completed = !chore.completed;
  persist();
}

export function deleteChore(id: string): void {
  const store = getData();
  store.chores = store.chores.filter((c) => c.id !== id);
  persist();
}

// ── Public API: Emergency Contacts ──────────────────────────
export function getContacts(): EmergencyContact[] {
  return getData().contacts;
}

export function addContact(data: Omit<EmergencyContact, "id">): EmergencyContact {
  const store = getData();
  const contact: EmergencyContact = { ...data, id: genId("ct") };
  store.contacts.push(contact);
  persist();
  return contact;
}

export function updateContact(id: string, data: Partial<Omit<EmergencyContact, "id">>): void {
  const store = getData();
  const idx = store.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return;
  store.contacts[idx] = { ...store.contacts[idx], ...data };
  persist();
}

export function deleteContact(id: string): void {
  const store = getData();
  store.contacts = store.contacts.filter((c) => c.id !== id);
  persist();
}

// ── Public API: Pets ───────────────────────────────────────
export function getPets(): Pet[] {
  return getData().pets;
}

export function getPet(id: string): Pet | undefined {
  return getData().pets.find((p) => p.id === id);
}

export function addPet(data: Omit<Pet, "id">): Pet {
  const store = getData();
  const pet: Pet = { ...data, id: genId("pet") };
  store.pets.push(pet);
  persist();
  return pet;
}

export function updatePet(id: string, data: Partial<Omit<Pet, "id">>): void {
  const store = getData();
  const idx = store.pets.findIndex((p) => p.id === id);
  if (idx === -1) return;
  store.pets[idx] = { ...store.pets[idx], ...data };
  persist();
}

export function deletePet(id: string): void {
  const store = getData();
  store.pets = store.pets.filter((p) => p.id !== id);
  persist();
}

export function addVaccination(petId: string, data: Omit<VaccinationRecord, "id">): VaccinationRecord | null {
  const store = getData();
  const pet = store.pets.find((p) => p.id === petId);
  if (!pet) return null;
  const vax: VaccinationRecord = { ...data, id: genId("vax") };
  pet.vaccinations.push(vax);
  pet.vaccinations.sort((a, b) => b.date.localeCompare(a.date));
  persist();
  return vax;
}

export function deleteVaccination(petId: string, vaxId: string): void {
  const store = getData();
  const pet = store.pets.find((p) => p.id === petId);
  if (!pet) return;
  pet.vaccinations = pet.vaccinations.filter((v) => v.id !== vaxId);
  persist();
}

// ── Public API: Expenses ────────────────────────────────────
export function getExpenses(): FamilyExpense[] {
  return getData().expenses;
}

export function addExpense(data: Omit<FamilyExpense, "id">): FamilyExpense {
  const store = getData();
  const expense: FamilyExpense = { ...data, id: genId("fe") };
  store.expenses.push(expense);
  persist();
  return expense;
}

export function updateExpense(id: string, data: Partial<Omit<FamilyExpense, "id">>): void {
  const store = getData();
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return;
  store.expenses[idx] = { ...store.expenses[idx], ...data };
  persist();
}

export function deleteExpense(id: string): void {
  const store = getData();
  store.expenses = store.expenses.filter((e) => e.id !== id);
  persist();
}

// ── Public API: Balance ─────────────────────────────────────
export function getBalances(): Record<string, number> {
  const store = getData();
  const balances: Record<string, number> = {};
  for (const m of store.members) {
    balances[m.id] = 0;
  }
  for (const e of store.expenses) {
    balances[e.paidBy] = (balances[e.paidBy] || 0) - e.amount;
  }
  const perPerson = store.expenses.reduce((s, e) => s + e.amount, 0) / store.members.length;
  for (const m of store.members) {
    balances[m.id] += perPerson;
  }
  return balances;
}
