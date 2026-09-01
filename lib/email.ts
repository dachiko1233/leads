// Resend email delivery — send the prioritized lead list as a CSV attachment.
//
// Verified against the current official docs (Aug 2026):
//   new Resend(process.env.RESEND_API_KEY)
//   resend.emails.send({ from, to, subject, html, attachments: [{ filename, content }] })
//   `content` may be a Buffer. Docs: https://resend.com/docs/send-with-nodejs

import { Resend } from "resend";
import type { Lead } from "./leads/types";

/** Shared Resend client + verified sender. Throws if the API key is missing. */
function getResend(): { resend: Resend; from: string } {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");

  const from = process.env.RESEND_FROM_EMAIL ?? "leads@getghostleads.com";
  return { resend: new Resend(apiKey), from };
}

export interface SendLeadsEmailParams {
  to: string;
  leads: Lead[];
  csvBuffer: Buffer;
}

// NOTE: Under the manual-fulfillment model this is no longer called from the
// webhook. It is kept so scripts/run-leads.ts (and scripts/send-leads-once.ts)
// can still email the finished CSV to a customer by hand.
export async function sendLeadsEmail({
  to,
  leads,
  csvBuffer,
}: SendLeadsEmailParams): Promise<void> {
  const { resend, from } = getResend();

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Your GhostLeads list is ready (${leads.length} leads)`,
    html: buildHtml(leads.length),
    attachments: [{ filename: "leads.csv", content: csvBuffer }],
  });

  if (error) {
    throw new Error(`Resend failed to send: ${JSON.stringify(error)}`);
  }
}

export interface OrderNotification {
  customerEmail: string;
  query: string;
  location: string;
  leadCount: number;
  amountPaid: string; // pre-formatted, e.g. "€50.00"
  paymentId: string;
  timestamp: string; // ISO or human string
}

/**
 * Notify the admin (ADMIN_EMAIL) of a new paid order so it can be fulfilled by
 * hand. Contains every detail needed to run scripts/run-leads.ts and deliver.
 */
export async function sendOrderNotificationEmail(order: OrderNotification): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("ADMIN_EMAIL is not set.");

  const { resend, from } = getResend();

  const { error } = await resend.emails.send({
    from,
    to: adminEmail,
    replyTo: order.customerEmail,
    subject: `New GhostLeads order — ${order.leadCount} leads (${order.amountPaid})`,
    html: buildOrderNotificationHtml(order),
  });

  if (error) {
    throw new Error(`Resend failed to send order notification: ${JSON.stringify(error)}`);
  }
}

/**
 * Confirm to the customer that we received their order and their leads will
 * arrive within 24 hours. Does NOT contain the leads themselves.
 */
export async function sendOrderConfirmationEmail(to: string): Promise<void> {
  const { resend, from } = getResend();

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Your GhostLeads order is confirmed — leads within 24h",
    html: buildConfirmationHtml(),
  });

  if (error) {
    throw new Error(`Resend failed to send confirmation: ${JSON.stringify(error)}`);
  }
}

function buildHtml(count: number): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #0B1120;">
      <h2 style="margin:0 0 12px;">Your leads are ready</h2>
      <p style="margin:0 0 8px;">
        We found <strong>${count}</strong> local businesses that are neglecting
        their social media — ranked by how "hot" they are.
      </p>
      <p style="margin:0 0 8px;">Your full list is attached as <code>leads.csv</code>.</p>
      <p style="margin:16px 0 0; color:#64748B; font-size:13px;">— GhostLeads</p>
    </div>
  `;
}

function buildOrderNotificationHtml(order: OrderNotification): string {
  const row = (label: string, value: string): string => `
    <tr>
      <td style="padding:6px 12px 6px 0; color:#64748B; white-space:nowrap;">${label}</td>
      <td style="padding:6px 0; color:#0B1120; font-weight:600;">${escapeHtml(value)}</td>
    </tr>`;

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #0B1120;">
      <h2 style="margin:0 0 12px;">New paid order — fulfill manually</h2>
      <table style="border-collapse:collapse; font-size:14px;">
        ${row("Customer email", order.customerEmail)}
        ${row("Category / query", order.query)}
        ${row("Location / city", order.location || "—")}
        ${row("Leads ordered", String(order.leadCount))}
        ${row("Amount paid", order.amountPaid)}
        ${row("Payment ID", order.paymentId || "—")}
        ${row("Ordered at", order.timestamp)}
      </table>
      <p style="margin:16px 0 0; color:#64748B; font-size:13px;">
        Run <code>scripts/run-leads.ts</code> with these values, then send the CSV to the customer.
      </p>
    </div>
  `;
}

function buildConfirmationHtml(): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #0B1120;">
      <h2 style="margin:0 0 12px;">Your order is confirmed 🎉</h2>
      <p style="margin:0 0 8px;">
        Thanks for your order! We've received your payment and our team is
        putting your lead list together now.
      </p>
      <p style="margin:0 0 8px;">
        Your leads will arrive in your inbox <strong>within 24 hours</strong>.
      </p>
      <p style="margin:16px 0 0; color:#64748B; font-size:13px;">— GhostLeads</p>
    </div>
  `;
}

/** Minimal HTML-escape for values interpolated into notification emails. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
