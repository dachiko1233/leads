import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Contact — ${legal.brand}`,
  description: `Get in touch with ${legal.brand}.`,
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact us"
      intro="Questions about your order, a lead list, or a refund? Reach out and we'll get back to you."
    >
      <h2>Email</h2>
      <p>
        The fastest way to reach us is by email. We aim to reply within 1–2
        business days.
      </p>
      <p>
        <a href={`mailto:${legal.email}?subject=${encodeURIComponent(legal.brand + " enquiry")}`}>
          {legal.email}
        </a>
      </p>

      <h2>Order support</h2>
      <p>
        If your order relates to a specific lead list, please include the{" "}
        <strong>email address you used at checkout</strong> and the date of
        purchase so we can find it quickly.
      </p>

      <h2>Business details</h2>
      <p>
        {legal.legalName}
        <br />
        {legal.country}
      </p>
    </LegalPage>
  );
}
