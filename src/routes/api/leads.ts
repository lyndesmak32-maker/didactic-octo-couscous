import { createFileRoute } from "@tanstack/react-router";

// Parent layout route for /api/leads — child routes (index, generate, $id) are nested under this.
export const Route = createFileRoute("/api/leads")({});
