import { createFileRoute } from "@tanstack/react-router";
import { getUserBySession } from "../../../db.ts";

function getSessionFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const sessionId = getSessionFromCookie(request);
          if (!sessionId) {
            return new Response(
              JSON.stringify({ error: "Not authenticated" }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          const user = getUserBySession(sessionId);
          if (!user) {
            return new Response(
              JSON.stringify({ error: "Not authenticated" }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({ user: { id: user.id, email: user.email } }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("GET /api/auth/me error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
