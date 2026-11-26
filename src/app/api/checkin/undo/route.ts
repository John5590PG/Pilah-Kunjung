import { z } from "zod";
import { createHash } from "node:crypto";
import { assertRate, clientIp, handleRoute, jsonOk, parseBody } from "@/lib/api/http";
import { checkinLimiter } from "@/lib/security/limiters";
import { undoCheckin } from "@/lib/services/checkin";

const UndoSchema = z.object({ token: z.string().min(10).max(200) });

function tokenKey(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 24);
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseBody(request, UndoSchema);
    assertRate(checkinLimiter.check(`undo:${clientIp(request)}:${tokenKey(body.token)}`));
    const result = await undoCheckin(body.token);
    return jsonOk({ ok: true, ...result });
  });
}
