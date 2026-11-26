/** Checks whether the PostgreSQL-backed API is available; the UI adapts to it. */
import { handleRoute, jsonOk } from "@/lib/api/http";
import { prisma } from "@/lib/db/client";

export async function GET() {
  return handleRoute(async () => {
    let database = false;
    if (process.env.DATABASE_URL) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        database = true;
      } catch {
        database = false;
      }
    }
    return jsonOk({ mode: database ? "api" : "demo", database });
  });
}
