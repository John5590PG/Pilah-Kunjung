import { requireUser } from "@/lib/auth/guard";
import { handleRoute, jsonOk } from "@/lib/api/http";
import { issueUnitToken } from "@/lib/services/tokens";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADMIN"]);
    const { id } = await params;
    const issued = await issueUnitToken(id, user.id);
    // The raw token is returned exactly once. Never log or store it.
    return jsonOk(issued, { status: 201 });
  });
}
