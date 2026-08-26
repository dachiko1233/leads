// Resend email delivery — send the prioritized lead list as a CSV attachment.
//
// Verified against the current official docs (Aug 2026):
//   new Resend(process.env.RESEND_API_KEY)
//   resend.emails.send({ from, to, subject, html, attachments: [{ filename, content }] })
//   `content` may be a Buffer. Docs: https://resend.com/docs/send-with-nodejs

import { Resend } from "resend";
import type { Lead } from "./leads/types";

export interface SendLeadsEmailParams {
  to: string;
  leads: Lead[];
  csvBuffer: Buffer;
}

export async function sendLeadsEmail({
  to,
  leads,
  csvBuffer,
}: SendLeadsEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");

  const from = process.env.RESEND_FROM_EMAIL ?? "leads@getghostleads.com";
  const resend = new Resend(apiKey);

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
