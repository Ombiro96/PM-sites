import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry";
import { resolveClient } from "@/lib/brand/resolve";

/**
 * Enquiries never touch the Bomahut API — this site is read-only against
 * production. They are forwarded to the property manager's Make.com scenario,
 * which owns routing, notification and (later) lead storage.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > MAX_PER_WINDOW) return true;

  // Opportunistic cleanup; this instance is per-lambda and short-lived.
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (now > v.resetAt) hits.delete(k);
    }
  }
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
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

  const client = await resolveClient();
  const webhook =
    client.brand.enquiryWebhookUrl ?? process.env.MAKE_ENQUIRY_WEBHOOK_URL;

  if (!webhook) {
    console.error(
      `[PM-Sites] no enquiry webhook configured for ${client.brand.slug}`,
    );
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
        client: client.brand.slug,
        company: client.brand.company.legalName,
        accountNumber: client.brand.accountNumber,
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
