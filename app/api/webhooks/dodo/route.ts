// POST /api/webhooks/dodo — Dodo Payments webhook.
//
// MANUAL FULFILLMENT: on a successful payment we do NOT auto-generate or send
// leads. Instead we email the admin (ADMIN_EMAIL) an order notification with
// everything needed to fulfill by hand, and email the customer a confirmation
// that their leads will arrive within 24h. The lead generation + CSV emailing
// code still exists (lib/leads, lib/csv, sendLeadsEmail) for manual runs via
// scripts/run-leads.ts — it is simply no longer called from this path.
//
// IMPORTANT: we must read the RAW request body for signature verification, so
// this route does its own JSON parsing after verifying.

import { NextResponse } from "next/server";
import { verifyDodoWebhook } from "@/lib/dodo";
import { sendOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";

// A subset of the Dodo webhook payload shape we rely on.
interface DodoEvent {
  type?: string;
  data?: {
    metadata?: Record<string, string>;
    customer?: { email?: string };
    payment_id?: string;
    total_amount?: number; // in the currency's lowest unit (cents)
    currency?: string;
    created_at?: string;
  };
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();

  const signature = request.headers.get("webhook-signature");

  // This is a public URL, so bots/scanners constantly POST junk here. A genuine
  // Dodo webhook always carries a `webhook-signature` header; requests without
  // one are pure noise, so reject them silently and never log.
  if (!signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: DodoEvent;
  try {
    event = verifyDodoWebhook(rawBody, {
      id: request.headers.get("webhook-id") ?? "",
      signature,
      timestamp: request.headers.get("webhook-timestamp") ?? "",
    }) as DodoEvent;
  } catch (err) {
    // A signed-but-invalid payload is worth a single concise line (no stack
    // trace) so a real misconfiguration stays visible while logs stay readable.
    const message = err instanceof Error ? err.message : String(err);
    console.warn("webhook rejected (invalid signature):", message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  // Only act on a successful payment. Dodo uses `payment.succeeded`.
  if (event.type !== "payment.succeeded") {
    return NextResponse.json({ received: true, ignored: event.type ?? "unknown" });
  }

  const metadata = event.data?.metadata ?? {};
  const email = metadata.email ?? event.data?.customer?.email ?? "";
  const query = metadata.query ?? "";
  const location = metadata.location ?? "";
  const leadCount = Number(metadata.leads) || 0;

  if (!email || !query || leadCount <= 0) {
    console.error("webhook: missing order metadata", metadata);
    // Ack so Dodo does not retry a payload we can never fulfill.
    return NextResponse.json({ received: true, error: "missing order metadata" });
  }

  // Format the amount actually charged. Dodo sends `total_amount` in the
  // currency's lowest unit (cents); fall back to €1/lead if it is absent.
  const currency = event.data?.currency ?? "EUR";
  const amountCents = event.data?.total_amount ?? leadCount * 100;
  const amountPaid = formatAmount(amountCents, currency);
  const paymentId = event.data?.payment_id ?? "";
  const timestamp = event.data?.created_at ?? new Date().toISOString();

  // Manual fulfillment: notify the admin and confirm to the customer. Never
  // throw back to Dodo on our own failure — log instead so the delivery can be
  // retried/investigated. Send both independently so one failing doesn't block
  // the other.
  const results = await Promise.allSettled([
    sendOrderNotificationEmail({
      customerEmail: email,
      query,
      location,
      leadCount,
      amountPaid,
      paymentId,
      timestamp,
    }),
    sendOrderConfirmationEmail(email),
  ]);

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const which = i === 0 ? "admin notification" : "customer confirmation";
      console.error(`webhook: ${which} email failed:`, result.reason);
    }
  });

  if (results.every((r) => r.status === "fulfilled")) {
    console.log(`Order received: ${leadCount} leads for ${email} — admin notified.`);
  }

  return NextResponse.json({ received: true });
}

/** Format a lowest-unit (cents) amount as a currency string, e.g. 5000 -> "€50.00". */
function formatAmount(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(cents / 100);
  } catch {
    // Unknown/invalid currency code — fall back to a plain formatted number.
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
