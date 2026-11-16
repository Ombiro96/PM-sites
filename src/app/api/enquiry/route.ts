import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { getSite } from "@/lib/site/source";

/**
 * Enquiries never touch the Bomahut API — this site is read-only against
 * production. They are forwarded to the property manager's Make.com scenario,
 * which owns routing, notification and (later) lead storage.
 */

export async function POST(request: Request) {
  if (rateLimited(`enquiry:${clientIp(request)}`)) {
    return NextResponse.json(
      { ok: false, error: "Too many enquiries. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the form and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { company, ...enquiry } = parsed.data;
  if (company) {
    // Honeypot tripped. Answer as if it worked so the bot stops retrying.
    return NextResponse.json({ ok: true });
  }

  const site = await getSite();
  const webhook = process.env.MAKE_ENQUIRY_WEBHOOK_URL;

  if (!webhook) {
    console.error("[PM-Sites] no enquiry webhook configured");
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not send your message. Please call us and we will help right away.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...enquiry,
        company: site.facts.display_name,
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded ${response.status}`);
    }
  } catch (error) {
    console.error("[PM-Sites] enquiry forwarding failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not send your message. Please call us and we will help right away.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
