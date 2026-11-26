/**
 * Small helpers for Route Handlers: typed errors, JSON parsing with Zod,
 * no-store responses, and rate-limit assertions.
 */
import { ZodError, type ZodType } from "zod";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code = "ERROR", details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex");
  return Response.json(data, { ...init, headers });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details ?? null } },
      { status: error.status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
    );
  }
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "VALIDATION",
          message: "Data tidak valid.",
          details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
      },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }
  console.error("[api] unhandled error", error);
  return Response.json(
    { error: { code: "INTERNAL", message: "Terjadi kesalahan pada server." } },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleRoute(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    return errorResponse(error);
  }
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "Body harus berupa JSON yang valid.", "INVALID_JSON");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(
      422,
      "Data tidak valid.",
      "VALIDATION",
      parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    );
  }
  return parsed.data;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}

export function assertRate(allowed: boolean, message = "Terlalu banyak permintaan. Coba lagi nanti."): void {
  if (!allowed) throw new HttpError(429, message, "RATE_LIMITED");
}
