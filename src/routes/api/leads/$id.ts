import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "../../../db.ts";

const VALID_STATUSES = ["new", "contacted", "qualified", "archived"] as const;

export const Route = createFileRoute("/api/leads/$id")({
  server: {
    handlers: {
      GET: async ({ params }: { request: Request; params: { id: string } }) => {
        try {
          const db = getDb();
          const lead = db
            .prepare("SELECT * FROM leads WHERE id = ?")
            .get(params.id) as Record<string, unknown> | undefined;

          if (!lead) {
            return new Response(JSON.stringify({ error: "Lead not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ lead }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("GET /api/leads/$id error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      PATCH: async ({
        request,
        params,
      }: {
        request: Request;
        params: { id: string };
      }) => {
        try {
          const body = (await request.json()) as { status?: string };
          const newStatus = body.status;

          if (!newStatus || !VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
            return new Response(
              JSON.stringify({
                error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const db = getDb();

          const existing = db
            .prepare("SELECT * FROM leads WHERE id = ?")
            .get(params.id) as Record<string, unknown> | undefined;

          if (!existing) {
            return new Response(JSON.stringify({ error: "Lead not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(
            newStatus,
            params.id,
          );

          const updated = db
            .prepare("SELECT * FROM leads WHERE id = ?")
            .get(params.id);

          return new Response(JSON.stringify({ lead: updated }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("PATCH /api/leads/$id error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
