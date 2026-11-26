import { clearSession } from "@/lib/auth/session";
import { handleRoute, jsonOk } from "@/lib/api/http";

export async function POST() {
  return handleRoute(async () => {
    await clearSession();
    return jsonOk({ ok: true });
  });
}
