const STEPS = [
  {
    n: "01",
    title: "Collect public data",
    body: "We pull real local businesses from the Google Places API — name, category, address, phone, website, and rating.",
  },
  {
    n: "02",
    title: "Analyze activity",
    body: "We discover each business's social links and flag pages that are abandoned or haven't posted in a long time.",
  },
  {
    n: "03",
    title: "Deliver a prioritized list",
    body: "Every business gets a 0–100 hotness score. You receive a ranked CSV — the neglected ones first.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
      <p className="mt-3 max-w-2xl text-[color:var(--color-muted)]">
        Three steps from raw public data to a list of clients who need you.
      </p>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="rounded-2xl border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)] p-6"
          >
            <div className="font-display text-4xl font-bold text-[color:var(--color-cyan)]">
              {s.n}
            </div>
            <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
