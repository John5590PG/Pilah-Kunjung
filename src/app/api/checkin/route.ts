// PLANNED (backend phase): One-tap check-in endpoint (hashed token, rate limit, undo).
// The 30 Nov prototype is front-end only; this route intentionally returns 501.
export async function POST() {
  return Response.json({ status: "planned", message: "Not implemented in the prototype." }, { status: 501 });
}
