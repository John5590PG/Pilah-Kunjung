import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { assertRate, clientIp, handleRoute, HttpError, jsonOk, parseBody } from "@/lib/api/http";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/auth/password";
import { writeSession } from "@/lib/auth/session";
import { loginLimiter } from "@/lib/security/limiters";

const LoginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    assertRate(loginLimiter.check(`login:${clientIp(request)}`));

    const body = await parseBody(request, LoginSchema);
    const email = body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always run a scrypt comparison so unknown emails do not answer faster.
    const valid = verifyPassword(body.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !valid) {
      throw new HttpError(401, "Email atau kata sandi salah.", "INVALID_CREDENTIALS");
    }

    await writeSession({
      id: user.id,
      email: user.email,
      role: user.role,
      subDistrictId: user.subDistrictId,
    });

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subDistrictId: user.subDistrictId,
      },
    });
  });
}
