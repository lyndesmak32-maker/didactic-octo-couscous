import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "../../../db.ts";
import { generateLeads } from "../../../lead-generator.ts";

export const Route = createFileRoute("/api/leads/generate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { businessType?: string };
          const businessType = body.businessType;

          if (!businessType || typeof businessType !== "string") {
            return new Response(
              JSON.stringify({ error: "businessType is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const leads = generateLeads(businessType, 10);
          const db = getDb();
          const insert = db.prepare(`
            INSERT INTO leads (company_name, industry, contact_name, email, phone, source, score, business_type, status, created_at)
            VALUES ($company_name, $industry, $contact_name, $email, $phone, $source, $score, $business_type, $status, $created_at)
          `);

          const insertMany = db.transaction((items: typeof leads) => {
            for (const lead of items) {
              insert.run({
                $company_name: lead.company_name,
                $industry: lead.industry,
                $contact_name: lead.contact_name,
                $email: lead.email,
                $phone: lead.phone,
                $source: lead.source,
                $score: lead.score,
                $business_type: lead.business_type,
                $status: lead.status,
                $created_at: lead.created_at,
              });
            }
          });

          insertMany(leads);

          const insertedLeads = db
            .prepare(
              "SELECT * FROM leads WHERE business_type = ? ORDER BY id DESC LIMIT ?",
            )
            .all(businessType, 10);

          return new Response(
            JSON.stringify({ count: leads.length, leads: insertedLeads }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("POST /api/leads/generate error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
