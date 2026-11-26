import { z } from "zod";
import { requireUser } from "@/lib/auth/guard";
import { assertRate, handleRoute, jsonOk, parseBody } from "@/lib/api/http";
import { writeLimiter } from "@/lib/security/limiters";
import { markDraftSent } from "@/lib/services/drafts";

const Body = z.object({ unitId: z.string().min(1).max(64) });

export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADMIN"]);
    assertRate(writeLimiter.check(`draft:${user.id}`));
    const body = await parseBody(request, Body);
    const result = await markDraftSent(body.unitId, user.id);
    return jsonOk({ ok: true, ...result });
  });
}
