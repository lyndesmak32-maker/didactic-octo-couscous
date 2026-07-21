import { createFileRoute } from "@tanstack/react-router";
import { getUserBySession, getSessionFromCookie, setUserPlan } from "../../../db.ts";

const VALID_PLANS = ["starter", "pro"] as const;

export const Route = createFileRoute("/api/auth/verify-payment")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
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

          const body = (await request.json()) as { plan?: string };
          const plan = body.plan;

          if (!plan || !VALID_PLANS.includes(plan as typeof VALID_PLANS[number])) {
            return new Response(
              JSON.stringify({ error: 'plan must be "starter" or "pro"' }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // For MVP: trust the client and set the plan immediately.
          // In production, verify against Stripe webhook data here.
          setUserPlan(user.id, plan);

          return new Response(
            JSON.stringify({
              user: {
                id: user.id,
                email: user.email,
                plan,
                plan_activated_at: new Date().toISOString(),
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("POST /api/auth/verify-payment error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
