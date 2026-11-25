// PLANNED (backend phase): Open cycle + WhatsApp drafts.
// The 30 Nov prototype is front-end only; this route intentionally returns 501.
export async function GET() {
  return Response.json({ status: "planned", message: "Not implemented in the prototype." }, { status: 501 });
}
