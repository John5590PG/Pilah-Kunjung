import { z } from "zod";
import { requireUser } from "@/lib/auth/guard";
import { assertRate, handleRoute, jsonOk, parseBody } from "@/lib/api/http";
import { writeLimiter } from "@/lib/security/limiters";
import { listRankingSettings, updateRankingSetting } from "@/lib/services/settings";

const SettingSchema = z.object({
  subDistrictId: z.string().min(1).max(64),
  wSilent: z.number().int().min(0).max(10),
  wUnconfirmed: z.number().int().min(0).max(10),
  wPaused: z.number().int().min(0).max(10),
  cutoffDays: z.number().int().min(1).max(31),
});

export async function GET() {
  return handleRoute(async () => {
    await requireUser(["COORDINATOR", "ADVISOR", "ADMIN"]);
    return jsonOk({ settings: await listRankingSettings() });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser(["ADMIN"]);
    assertRate(writeLimiter.check(`settings:${user.id}`));
    const body = await parseBody(request, SettingSchema);
    const setting = await updateRankingSetting(body, user.id);
    return jsonOk({ ok: true, setting });
  });
}
