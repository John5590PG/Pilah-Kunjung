import { z } from "zod";
import { requireUser } from "@/lib/auth/guard";
import { assertRate, handleRoute, jsonOk, parseBody } from "@/lib/api/http";
import { writeLimiter } from "@/lib/security/limiters";
import { listVisits, recordVisit } from "@/lib/services/visits";

const VisitSchema = z.object({
  unitId: z.string().min(1).max(64),
  mode: z.enum(["CALL", "VISIT"]),
  verifiedStatus: z.enum(["OPERATING", "PAUSED", "CLOSED"]),
  note: z.string().max(280).optional(),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADVISOR", "ADMIN"]);
    const unitId = new URL(request.url).searchParams.get("unitId") ?? undefined;
    const visits = await listVisits(user, unitId);
    return jsonOk({ visits });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADMIN"]);
    assertRate(writeLimiter.check(`visit:${user.id}`));

    const body = await parseBody(request, VisitSchema);
    const visit = await recordVisit(user, body);
    return jsonOk({ ok: true, visit }, { status: 201 });
  });
}
