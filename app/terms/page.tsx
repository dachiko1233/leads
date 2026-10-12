import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Terms of Service — ${legal.brand}`,
  description: `The terms governing use of ${legal.brand}.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms govern your purchase and use of lead lists from ${legal.brand}. By placing an order you agree to them.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {legal.brand} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) is operated by{" "}
        {legal.legalName}, based in {legal.country}. You can reach us at{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>.
      </p>

      <h2>2. What we provide</h2>
      <p>
        We provide curated lists of local businesses — for example businesses
        with neglected or inactive social media — matching the category and
        location you select. Lists are delivered as a{" "}
        <strong>leads.csv</strong> file to the email you provide at checkout.
      </p>

      <h2>3. Pricing and payment</h2>
      <p>
        Leads are priced at €{legal.pricePerLead} per lead. The total shown at
        checkout is a one-time charge. Payments are processed securely by{" "}
        {legal.processor}, our merchant of record. We do not store your card
        details.
      </p>

      <h2>4. Delivery</h2>
      <p>
        Lists are generated after successful payment and sent by email, usually
        within a few minutes. If you have not received your list within a
        reasonable time, check your spam folder and then contact us.
      </p>

      <h2>5. Refunds</h2>
      <p>
        Because lists are digital goods delivered instantly, sales are final
        once delivered, subject to our replacement and refund terms. See our{" "}
        <Link href="/refunds">Refund Policy</Link>.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree that you will:</p>
      <ul>
        <li>
          Use the leads only for your own lawful business outreach and
          marketing.
        </li>
        <li>
          Comply with all applicable anti-spam, marketing, and data-protection
          laws (such as GDPR and the CAN-SPAM Act) when contacting leads,
          including honouring opt-out requests.
        </li>
        <li>
          Not resell, redistribute, or publish the lists as a standalone product
          without our written permission.
        </li>
      </ul>
      <p>
        You are solely responsible for how you contact and handle the data of
        the businesses in your list.
      </p>

      <h2>7. Accuracy and no guarantee of results</h2>
      <p>
        We compile leads from publicly available sources and take care to keep
        them accurate, but we do not warrant that every entry is complete,
        current, or error-free. We do not guarantee any specific business
        outcome, response rate, or number of clients from a list.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total liability for any
        claim relating to an order is limited to the amount you paid for that
        order. We are not liable for indirect or consequential losses, including
        lost profits or lost business.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The version in effect at
        the time of your purchase applies to that order. Material changes will
        be reflected by the &ldquo;last updated&rdquo; date above.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>.
      </p>
    </LegalPage>
  );
}
