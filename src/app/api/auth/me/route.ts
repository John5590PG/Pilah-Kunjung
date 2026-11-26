import { requireUser } from "@/lib/auth/guard";
import { handleRoute, jsonOk } from "@/lib/api/http";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser();
    return jsonOk({ user });
  });
}
