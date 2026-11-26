import { requireUser } from "@/lib/auth/guard";
import { handleRoute, jsonOk } from "@/lib/api/http";
import { archiveUnit } from "@/lib/services/units";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADMIN"]);
    const { id } = await params;
    await archiveUnit(id, user);
    return jsonOk({ ok: true, unitId: id, status: "CLOSED" });
  });
}
