import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Refund Policy — ${legal.brand}`,
  description: `Refund and replacement policy for ${legal.brand} lead lists.`,
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund policy"
      intro="We sell digital lead lists that are generated and delivered instantly. Please read how refunds and replacements work before you buy."
    >
      <h2>Digital goods — delivered instantly</h2>
      <p>
        Each order produces a custom <strong>leads.csv</strong> file that is
        generated for you and sent by email shortly after payment. Because the
        product is a digital good delivered immediately and cannot be
        &ldquo;returned,&rdquo; <strong>all sales are final once the list has
        been delivered.</strong>
      </p>

      <h2>We replace bad leads</h2>
      <p>
        We stand behind the quality of our lists. If a lead we deliver is{" "}
        <strong>invalid</strong> — for example a duplicate within your order, a
        business that has permanently closed, or an entry with clearly incorrect
        core contact details — we will replace it free of charge.
      </p>
      <p>
        To request a replacement, email us within <strong>7 days</strong> of
        delivery with the affected rows and a short note on the issue. Verified
        invalid leads are replaced with fresh ones matching your original
        criteria.
      </p>

      <h2>When a refund may be issued</h2>
      <p>You may be entitled to a full or partial refund if:</p>
      <ul>
        <li>
          You were charged but, due to a technical error on our side, never
          received your list and we are unable to deliver it.
        </li>
        <li>
          A duplicate or accidental charge was made for the same order.
        </li>
        <li>
          We cannot fulfil your order for the category or location you
          requested, and no suitable replacement can be provided.
        </li>
      </ul>

      <h2>What is not refundable</h2>
      <ul>
        <li>
          A list that was delivered as described, simply because the results did
          not convert into clients. We provide qualified leads, not guaranteed
          sales.
        </li>
        <li>
          Change of mind after the list has been generated and delivered.
        </li>
        <li>
          Incorrect category, location, or delivery email entered by you at
          checkout. Please double-check your details before paying.
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email{" "}
        <a href={`mailto:${legal.email}?subject=${encodeURIComponent("Refund request")}`}>
          {legal.email}
        </a>{" "}
        with the email address used at checkout and the date of purchase.
        Approved refunds are returned to your original payment method via{" "}
        {legal.processor}, typically within 5–10 business days.
      </p>
    </LegalPage>
  );
}
