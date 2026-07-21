import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "../../../db.ts";
import {
  verifyPassword,
  createSession,
  sessionCookie,
} from "../../../auth.ts";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as {
            email?: string;
            password?: string;
          };
          const { email, password } = body;

          if (!email || !password) {
            return new Response(
              JSON.stringify({ error: "Email and password are required" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const db = getDb();

          // Find user by email
          const user = db
            .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
            .get(email.toLowerCase().trim()) as
            | { id: number; email: string; password_hash: string }
            | undefined;

          if (!user) {
            return new Response(
              JSON.stringify({ error: "Invalid email or password" }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          // Verify password
          const valid = await verifyPassword(password, user.password_hash);
          if (!valid) {
            return new Response(
              JSON.stringify({ error: "Invalid email or password" }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          // Create session
          const sessionId = createSession(user.id);

          return new Response(
            JSON.stringify({ user: { id: user.id, email: user.email } }),
            {
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": sessionCookie(sessionId),
              },
            },
          );
        } catch (err) {
          console.error("POST /api/auth/login error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
