import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = "data/leads.db";

let db: Database | null = null;

export function getDb(): Database {
  if (db) return db;

  // Ensure data directory exists
  mkdirSync(dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      source TEXT NOT NULL,
      score INTEGER NOT NULL,
      business_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Migrations: add columns if they don't exist (ignore errors if already added)
  try {
    db.exec("ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'");
  } catch { /* column already exists */ }
  try {
    db.exec("ALTER TABLE users ADD COLUMN plan_activated_at TEXT");
  } catch { /* column already exists */ }
  try {
    db.exec("ALTER TABLE leads ADD COLUMN user_id INTEGER REFERENCES users(id)");
  } catch { /* column already exists */ }

  return db;
}

export function getSessionFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export function getUserBySession(
  sessionId: string,
): { id: number; email: string; plan: string; plan_activated_at: string | null } | null {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT u.id, u.email, u.plan, u.plan_activated_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ?`,
    )
    .get(sessionId, new Date().toISOString()) as
    | { id: number; email: string; plan: string; plan_activated_at: string | null }
    | undefined;

  return row ?? null;
}

export function getUserPlan(
  userId: number,
): { plan: string; plan_activated_at: string | null } {
  const database = getDb();
  const row = database
    .prepare("SELECT plan, plan_activated_at FROM users WHERE id = ?")
    .get(userId) as { plan: string; plan_activated_at: string | null } | undefined;

  if (!row) throw new Error(`User ${userId} not found`);
  return row;
}

export function setUserPlan(userId: number, plan: string): void {
  const database = getDb();
  const now = new Date().toISOString();
  database
    .prepare("UPDATE users SET plan = ?, plan_activated_at = ? WHERE id = ?")
    .run(plan, now, userId);
}

export function countUserLeads(userId: number, since?: string): number {
  const database = getDb();
  if (since) {
    const row = database
      .prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ? AND created_at >= ?")
      .get(userId, since) as { count: number };
    return row.count;
  }
  const row = database
    .prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ?")
    .get(userId) as { count: number };
  return row.count;
}

export function countTotalLeads(): number {
  const database = getDb();
  const row = database.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
  return row.count;
}
