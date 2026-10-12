import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Privacy Notice — ${legal.brand}`,
  description: `How ${legal.brand} collects and uses your data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy notice"
      intro={`This notice explains what personal data ${legal.brand} collects, why, and what rights you have over it.`}
    >
      <h2>Who is responsible for your data</h2>
      <p>
        {legal.legalName} ({legal.brand}), based in {legal.country}, is the data
        controller for the information described here. Contact us at{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a> for any
        privacy-related request.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Order details</strong> — the delivery email address, business
          category, and location you enter at checkout.
        </li>
        <li>
          <strong>Payment information</strong> — processed by {legal.processor}.
          We receive confirmation of payment but <strong>never see or store
          your full card details.</strong>
        </li>
        <li>
          <strong>Communications</strong> — the content of emails you send us
          for support.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To generate and deliver your lead list to the email you provided.</li>
        <li>To process your payment and provide receipts.</li>
        <li>To respond to support requests and handle refunds.</li>
        <li>To meet our legal, accounting, and tax obligations.</li>
      </ul>
      <p>
        Our legal bases are performance of our contract with you (delivering
        your order), compliance with legal obligations, and our legitimate
        interest in running and improving the service.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share data only with service providers that help us run {legal.brand},
        including:
      </p>
      <ul>
        <li>
          <strong>{legal.processor}</strong> — to process payments securely.
        </li>
        <li>
          Our email delivery provider — to send your list and receipts.
        </li>
      </ul>
      <p>
        We do not sell your personal data. We may disclose information where
        required by law.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep order and payment records for as long as needed to provide the
        service and to meet legal and accounting requirements, then delete or
        anonymise them.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        delete, or restrict use of your personal data, and to object to certain
        processing. To exercise any of these rights, email{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>. If you are in the
        EU/EEA, you also have the right to lodge a complaint with your local
        data-protection authority.
      </p>

      <h2>A note on the leads we sell</h2>
      <p>
        The lists we provide contain business contact information drawn from
        publicly available sources. If you are a business owner and want your
        details removed from our lists, email us and we will remove them.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        We may update this notice from time to time. The &ldquo;last
        updated&rdquo; date above reflects the current version.
      </p>
    </LegalPage>
  );
}
