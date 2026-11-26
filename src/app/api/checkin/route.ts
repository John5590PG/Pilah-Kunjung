import { z } from "zod";
import { createHash } from "node:crypto";
import { assertRate, clientIp, handleRoute, HttpError, jsonOk, parseBody } from "@/lib/api/http";
import { checkinLimiter, tokenLookupLimiter } from "@/lib/security/limiters";
import { readToken, submitCheckin } from "@/lib/services/checkin";

const CheckinSchema = z.object({
  token: z.string().min(10).max(200),
  status: z.enum(["OPERATING", "PAUSED", "CLOSED"]),
});

/** Hashed key so raw tokens never appear in limiter state or logs. */
function tokenKey(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 24);
}

/** GET only reads: safe for WhatsApp link previews (docs/04 #3). */
export async function GET(request: Request) {
  return handleRoute(async () => {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) throw new HttpError(400, "Parameter token wajib diisi.", "MISSING_TOKEN");

    assertRate(tokenLookupLimiter.check(`lookup:${clientIp(request)}:${tokenKey(token)}`));
    const unit = await readToken(token);
    return jsonOk({ unit });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseBody(request, CheckinSchema);
    assertRate(checkinLimiter.check(`checkin:${clientIp(request)}:${tokenKey(body.token)}`));

    const result = await submitCheckin(body.token, body.status);
    return jsonOk({ ok: true, ...result });
  });
}
