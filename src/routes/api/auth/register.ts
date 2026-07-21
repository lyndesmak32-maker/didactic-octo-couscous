import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "../../../db.ts";
import {
  hashPassword,
  createSession,
  sessionCookie,
} from "../../../auth.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as {
            email?: string;
            password?: string;
          };
          const { email, password } = body;

          // Validate email
          if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
            return new Response(
              JSON.stringify({ error: "Valid email is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Validate password
          if (!password || typeof password !== "string" || password.length < 8) {
            return new Response(
              JSON.stringify({ error: "Password must be at least 8 characters" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const db = getDb();

          // Check if email already exists
          const existing = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email.toLowerCase().trim());
          if (existing) {
            return new Response(
              JSON.stringify({ error: "Email already registered" }),
              { status: 409, headers: { "Content-Type": "application/json" } },
            );
          }

          // Hash password and insert user
          const passwordHash = await hashPassword(password);
          const now = new Date().toISOString();
          const result = db
            .prepare(
              "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
            )
            .run(email.toLowerCase().trim(), passwordHash, now);

          const userId = Number(result.lastInsertRowid);

          // Create session
          const sessionId = createSession(userId);

          return new Response(
            JSON.stringify({ user: { id: userId, email: email.toLowerCase().trim() } }),
            {
              status: 201,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": sessionCookie(sessionId),
              },
            },
          );
        } catch (err) {
          console.error("POST /api/auth/register error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
