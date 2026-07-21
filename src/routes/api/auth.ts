import { createFileRoute } from "@tanstack/react-router";

// Parent layout route for /api/auth — child routes are nested under this.
export const Route = createFileRoute("/api/auth")({});
