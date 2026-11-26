import { requireUser } from "@/lib/auth/guard";
import { handleRoute, jsonOk } from "@/lib/api/http";
import { listUnits } from "@/lib/services/units";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADVISOR", "ADMIN"]);
    const subDistrictId = new URL(request.url).searchParams.get("subDistrictId");
    const result = await listUnits(user, subDistrictId);
    return jsonOk(result);
  });
}
