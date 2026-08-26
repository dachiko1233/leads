const FAQS = [
  {
    q: "Where does the data come from?",
    a: "We find real, currently-operating local businesses through the Google Places API, then analyze their public web and social presence to flag neglected accounts.",
  },
  {
    q: "How do you know a page is neglected?",
    a: "We look for missing or one-sided social links, a weak overall web footprint, and stale activity signals. Each business gets a 0–100 hotness score and the list is ranked by it.",
  },
  {
    q: "How is a lead priced?",
    a: "Simple: €1 per lead. A package is just the number of leads you choose — 20 leads is €20, 1000 is €1000. No subscription.",
  },
  {
    q: "How do I get my list?",
    a: "After payment, we run the engine for your category and location and email you a leads.csv attachment via Resend — usually within a few minutes.",
  },
  {
    q: "Can I choose the category and city?",
    a: "Yes. You tell us the business category and location at checkout, and the list is generated for exactly that.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-3xl font-bold sm:text-4xl">FAQ</h2>
      <div className="mt-8 divide-y divide-[color:var(--color-ink-line)] rounded-2xl border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)]">
        {FAQS.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {f.q}
              <span className="text-[color:var(--color-cyan)] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-[color:var(--color-muted)]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
