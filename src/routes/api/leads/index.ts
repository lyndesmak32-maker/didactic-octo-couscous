import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "../../../db.ts";

export const Route = createFileRoute("/api/leads/")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const businessType = url.searchParams.get("businessType");
          const status = url.searchParams.get("status");

          const db = getDb();

          let query = "SELECT * FROM leads WHERE 1=1";
          const params: (string | number)[] = [];

          if (businessType) {
            query += " AND business_type = ?";
            params.push(businessType);
          }

          if (status) {
            query += " AND status = ?";
            params.push(status);
          }

          query += " ORDER BY created_at DESC LIMIT 100";

          const leads = db.prepare(query).all(...params);

          return new Response(JSON.stringify({ leads }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("GET /api/leads error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
