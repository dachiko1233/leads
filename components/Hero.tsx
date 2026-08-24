import { ActivityMeter } from "./ActivityMeter";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-muted)]">
            <span className="dead-dot inline-block h-2 w-2 rounded-full bg-[color:var(--color-lime)]" />
            Hot leads, updated on demand
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Find local businesses that are{" "}
            <span className="text-[color:var(--color-cyan)]">neglecting</span> their
            social media.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[color:var(--color-muted)]">
            Stop hunting for clients — we hand you the ones who need you most.
            Businesses with abandoned or inactive pages are the hottest signal
            for SMM, web, and marketing work.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#pricing"
              className="rounded-full bg-[color:var(--color-cyan)] px-7 py-3 text-base font-semibold text-[color:var(--color-ink)] transition hover:brightness-110"
            >
              Order now
            </a>
            <a
              href="#how"
              className="rounded-full border border-[color:var(--color-ink-line)] px-7 py-3 text-base font-semibold text-[color:var(--color-warm)] transition hover:border-[color:var(--color-cyan)]"
            >
              How it works
            </a>
          </div>

          <p className="mt-6 text-sm text-[color:var(--color-muted)]">
            <span className="font-semibold text-[color:var(--color-warm)]">€1 per lead.</span>{" "}
            No subscription — pick a package, get a CSV.
          </p>
        </div>

        {/* Signature visual: a "dead" account card */}
        <div className="relative">
          <div className="rounded-2xl border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-semibold">@junipersalon</div>
                <div className="text-sm text-[color:var(--color-muted)]">Hair salon · Austin, TX</div>
              </div>
              <span className="rounded-full bg-[color:var(--color-danger)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--color-danger)]">
                Hot 88
              </span>
            </div>

            <div className="mt-6">
              <ActivityMeter label="No posts in 60+ days" />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[color:var(--color-muted)]">Last post</dt>
                <dd className="font-semibold text-[color:var(--color-danger)]">No posts</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-muted)]">Website</dt>
                <dd className="font-semibold">juniperco.com</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-muted)]">Phone</dt>
                <dd className="font-semibold">+1 512-555-0142</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-muted)]">Reviews</dt>
                <dd className="font-semibold">4 total</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
