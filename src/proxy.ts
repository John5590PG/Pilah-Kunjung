import { NextResponse, type NextRequest } from "next/server";

/**
 * In database mode the coordinator area requires a session cookie. In demo
 * mode (no DATABASE_URL) every screen stays freely clickable.
 * Signature/role checks are enforced again by the Route Handlers.
 */
export function proxy(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.next();
  if (!request.cookies.has("pk_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/cycles/:path*", "/units/:path*", "/settings/:path*"],
};
