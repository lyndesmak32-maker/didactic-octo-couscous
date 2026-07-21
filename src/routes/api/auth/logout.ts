import { createFileRoute } from "@tanstack/react-router";
import { deleteSession } from "../../../auth.ts";

function getSessionFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const sessionId = getSessionFromCookie(request);
          if (sessionId) {
            deleteSession(sessionId);
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie":
                "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
            },
          });
        } catch (err) {
          console.error("POST /api/auth/logout error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
