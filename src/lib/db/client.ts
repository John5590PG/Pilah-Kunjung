/**
 * Prisma client singleton (PostgreSQL).
 *
 * The UI prototype still runs on localStorage (src/lib/demo). The API routes
 * import this module only when a database-backed request is made, so a build
 * without DATABASE_URL still succeeds.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
