import { NextResponse } from "next/server";
import { getRequestType, requestSchema } from "@/lib/requests";
import { resolveClient } from "@/lib/brand/resolve";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * Tenant requests — notice to vacate, move-in applications, complaints.
 *
 * Like enquiries these never touch the Bomahut API. They are forwarded to the
 * property manager's Make.com scenario, which owns notification and routing.
 */

const FAILED =
  "We could not send your request. Please call us and we will help right away.";

export async function POST(request: Request) {
  if (rateLimited(`request:${clientIp(request)}`)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const slug =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>).requestType
      : null;
  const type = typeof slug === "string" ? getRequestType(slug) : undefined;

  if (!type) {
    return NextResponse.json(
      { ok: false, error: "Unknown request type" },
      { status: 400 },
    );
  }

  const parsed = requestSchema(type).safeParse(payload);
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

  const { company, ...submission } = parsed.data;
  if (company) {
    // Honeypot tripped. Answer as if it worked so the bot stops retrying.
    return NextResponse.json({ ok: true });
  }

  const client = await resolveClient();
  const webhook =
    client.brand.requestWebhookUrl ??
    process.env.MAKE_REQUEST_WEBHOOK_URL ??
    client.brand.enquiryWebhookUrl ??
    process.env.MAKE_ENQUIRY_WEBHOOK_URL;

  if (!webhook) {
    console.error(
      `[PM-Sites] no request webhook configured for ${client.brand.slug}`,
    );
    return NextResponse.json({ ok: false, error: FAILED }, { status: 503 });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...submission,
        requestTypeLabel: type.title,
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
    console.error("[PM-Sites] request forwarding failed", error);
    return NextResponse.json({ ok: false, error: FAILED }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
