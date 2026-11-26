import { z } from "zod";
import { requireUser } from "@/lib/auth/guard";
import { assertRate, handleRoute, HttpError, jsonOk, parseBody } from "@/lib/api/http";
import { writeLimiter } from "@/lib/security/limiters";
import { getCurrentCycle, rolloverCycle } from "@/lib/services/cycles";
import { periodLabelId } from "@/lib/services/cycle-math";
import { getRankingConfig } from "@/lib/services/settings";

const ActionSchema = z.object({ action: z.literal("rollover") });

export async function GET() {
  return handleRoute(async () => {
    await requireUser(["COORDINATOR", "ADVISOR", "ADMIN"]);
    const [cycle, config] = await Promise.all([getCurrentCycle(), getRankingConfig()]);
    return jsonOk({
      cycle: cycle
        ? {
            label: cycle.periodLabel,
            periodLabel: periodLabelId(cycle.periodLabel),
            openedAt: cycle.openedAt.toISOString(),
            cutoffAt: cycle.cutoffAt.toISOString(),
            closedAt: cycle.closedAt?.toISOString() ?? null,
          }
        : null,
      config,
    });
  });
}

/** Manual demo trigger for the automatic rollover (admin only). */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser(["ADMIN"]);
    assertRate(writeLimiter.check(`cycle:${user.id}`));

    const body = await parseBody(request, ActionSchema);
    if (body.action !== "rollover") throw new HttpError(400, "Aksi tidak dikenal.", "UNKNOWN_ACTION");

    const result = await rolloverCycle(user.id);
    return jsonOk({ ok: true, ...result });
  });
}
