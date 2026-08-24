// POST /api/webhooks/dodo — Dodo Payments webhook.
//
// On a successful payment we run the data engine for the purchased
// query/location/leads, build a CSV, and email it via Resend.
//
// IMPORTANT: we must read the RAW request body for signature verification, so
// this route does its own JSON parsing after verifying.

import { NextResponse } from "next/server";
import { verifyDodoWebhook } from "@/lib/dodo";
import { generateLeads } from "@/lib/leads";
import { leadsToCsv } from "@/lib/csv";
import { sendLeadsEmail } from "@/lib/email";

// A subset of the Dodo webhook payload shape we rely on.
interface DodoEvent {
  type?: string;
  data?: {
    metadata?: Record<string, string>;
    customer?: { email?: string };
  };
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();

  let event: DodoEvent;
  try {
    event = verifyDodoWebhook(rawBody, {
      id: request.headers.get("webhook-id") ?? "",
      signature: request.headers.get("webhook-signature") ?? "",
      timestamp: request.headers.get("webhook-timestamp") ?? "",
    }) as DodoEvent;
  } catch (err) {
    console.error("webhook signature verification failed:", err);
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

  // Fulfill the order. Do it inline but never throw back to Dodo on our own
  // failure — log instead so the delivery can be retried/investigated.
  try {
    const leads = await generateLeads({ query, location, limit: leadCount });
    const csv = Buffer.from(leadsToCsv(leads), "utf8");
    await sendLeadsEmail({ to: email, leads, csvBuffer: csv });
    console.log(`Fulfilled order: ${leads.length} leads -> ${email}`);
  } catch (err) {
    console.error("fulfillment failed:", err);
  }

  return NextResponse.json({ received: true });
}
