import { createFileRoute } from "@tanstack/react-router";
import { getDb, getUserBySession, getSessionFromCookie, countUserLeads, countTotalLeads } from "../../../db.ts";
import { generateLeads } from "../../../lead-generator.ts";

const GUEST_MAX_LEADS = 5;
const FREE_MAX_LEADS = 10;
const STARTER_MAX_LEADS = 50;

function startOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export const Route = createFileRoute("/api/leads/generate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as {
            businessType?: string;
            location?: string;
          };
          const businessType = body.businessType;

          if (!businessType || typeof businessType !== "string") {
            return new Response(
              JSON.stringify({ error: "businessType is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const location =
            typeof body.location === "string" && body.location.trim().length > 0
              ? body.location.trim()
              : undefined;

          const sessionId = getSessionFromCookie(request);
          const db = getDb();

          let userId: number | null = null;
          let plan = "free";
          let planLimit = FREE_MAX_LEADS;
          let leadsUsed = 0;

          if (sessionId) {
            const user = getUserBySession(sessionId);
            if (user) {
              userId = user.id;
              plan = user.plan;

              if (plan === "free") {
                // Free: lifetime limit
                leadsUsed = countUserLeads(userId);
                planLimit = FREE_MAX_LEADS;
              } else if (plan === "starter") {
                // Starter: monthly limit
                leadsUsed = countUserLeads(userId, startOfMonth());
                planLimit = STARTER_MAX_LEADS;
              } else if (plan === "pro") {
                // Pro: unlimited — skip the check entirely
                planLimit = Infinity;
              }
            }
          }

          // Guest mode (no valid session): check global lead count as rough guard
          if (!userId) {
            leadsUsed = countTotalLeads();
            planLimit = GUEST_MAX_LEADS;
          }

          if (leadsUsed >= planLimit) {
            if (!userId) {
              return new Response(
                JSON.stringify({
                  error: "Guest limit reached. Create an account to continue generating leads.",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            if (plan === "free") {
              return new Response(
                JSON.stringify({
                  error: "Free plan limit reached. Upgrade to continue.",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            if (plan === "starter") {
              return new Response(
                JSON.stringify({
                  error: "Monthly lead limit reached. Upgrade to Pro for unlimited leads.",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
          }

          const leads = await generateLeads(businessType, 10, location);

          const insert = db.prepare(`
            INSERT INTO leads (company_name, industry, contact_name, email, phone, source, score, business_type, status, created_at, user_id)
            VALUES ($company_name, $industry, $contact_name, $email, $phone, $source, $score, $business_type, $status, $created_at, $user_id)
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
                $user_id: userId,
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
