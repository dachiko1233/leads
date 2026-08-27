const PREVIEW_ROWS = [
  {
    name: "Juniper & Co. Salon",
    category: "Hair salon",
    location: "Austin, TX",
    lastPost: "No posts",
    phone: "+1 512-555-0142",
    email: "hello@juniperco.com",
  },
  {
    name: "Blue Agave Cantina",
    category: "Mexican restaurant",
    location: "Denver, CO",
    lastPost: "62 days ago",
    phone: "+1 720-555-0199",
    email: "—",
  },
  {
    name: "Barton Springs Bikes",
    category: "Bicycle repair",
    location: "Portland, OR",
    lastPost: "No posts",
    phone: "+1 503-555-0188",
    email: "ride@bartonspringsbikes.com",
  },
  {
    name: "East Side Dental Care",
    category: "Dentist",
    location: "Nashville, TN",
    lastPost: "Unknown",
    phone: "+1 615-555-0110",
    email: "front@eastsidedental.com",
  },
  {
    name: "Maple & Thread",
    category: "Clothing store",
    location: "Chicago, IL",
    lastPost: "120 days ago",
    phone: "+1 312-555-0155",
    email: "—",
  },
  {
    name: "Lone Star Detailing",
    category: "Car detailing",
    location: "Phoenix, AZ",
    lastPost: "72 days ago",
    phone: "+1 602-555-0121",
    email: "book@lonestardetail.com",
  },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Light beams shooting up behind the headline */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[color:var(--color-cyan)] opacity-20 blur-[160px]" />
        <div className="absolute left-1/2 top-24 h-[30rem] w-40 -translate-x-1/2 -rotate-[24deg] bg-gradient-to-b from-[color:var(--color-cyan)]/40 to-transparent blur-2xl" />
        <div className="absolute left-1/2 top-24 h-[30rem] w-40 -translate-x-1/2 rotate-[24deg] bg-gradient-to-b from-[color:var(--color-lime)]/30 to-transparent blur-2xl" />
        <div className="absolute left-1/2 top-24 h-[26rem] w-24 -translate-x-1/2 bg-gradient-to-b from-white/20 to-transparent blur-xl" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-12 text-center lg:pb-32 lg:pt-16">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)] px-4 py-1.5 text-sm font-medium text-[color:var(--color-muted)]">
          <span className="dead-dot inline-block h-2 w-2 rounded-full bg-[color:var(--color-lime)]" />
          Hot leads, updated on demand
        </span>

        <h1 className="mt-8 text-6xl font-bold leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">
          Find local businesses that{" "}
          <span className="bg-gradient-to-r from-[color:var(--color-cyan)] to-[color:var(--color-lime)] bg-clip-text text-transparent">
            aren&apos;t active
          </span>{" "}
          on social media.
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#pricing"
            className="rounded-full bg-[color:var(--color-cyan)] px-8 py-4 text-lg font-semibold text-[color:var(--color-ink)] shadow-lg shadow-[color:var(--color-cyan)]/20 transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Order now
          </a>
          <a
            href="#how"
            className="rounded-full border border-[color:var(--color-ink-line)] px-8 py-4 text-lg font-semibold text-[color:var(--color-warm)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-cyan)]"
          >
            How it works
          </a>
        </div>

        <p className="mt-6 text-base text-[color:var(--color-muted)]">
          <span className="font-semibold text-[color:var(--color-warm)]">
            €1 per lead.
          </span>{" "}
          No subscription — pick a package, get a CSV.
        </p>

        {/* Floating leads.csv product mockup */}
        <div className="relative mt-20 w-full max-w-6xl lg:-mx-16 lg:w-[calc(100%+8rem)]">
          <div className="pointer-events-none absolute -inset-x-16 -top-16 bottom-0 -z-10 bg-[color:var(--color-cyan)] opacity-15 blur-[130px]" />
          <div className="overflow-hidden rounded-3xl border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)] shadow-2xl shadow-black/70 ring-1 ring-white/5">
            {/* window chrome */}
            <div className="flex items-center gap-2.5 border-b border-[color:var(--color-ink-line)] bg-white/[0.02] px-5 py-4">
              <span className="h-3.5 w-3.5 rounded-full bg-[color:var(--color-danger)]/70" />
              <span className="h-3.5 w-3.5 rounded-full bg-[color:var(--color-warm)]/30" />
              <span className="h-3.5 w-3.5 rounded-full bg-[color:var(--color-lime)]/70" />
              <span className="ml-3 text-sm font-medium text-[color:var(--color-warm)]">
                leads.csv
              </span>
              <span className="ml-auto rounded-full border border-[color:var(--color-ink-line)] px-3 py-1 text-xs text-[color:var(--color-muted)]">
                {PREVIEW_ROWS.length} of 250 rows
              </span>
            </div>

            {/* table */}
            <div className="text-left">
              <table className="w-full table-fixed border-collapse text-base">
                <thead>
                  <tr className="border-b border-[color:var(--color-ink-line)] text-sm uppercase tracking-wide text-[color:var(--color-muted)]">
                    <th className="px-6 py-4 text-left font-medium">Name</th>
                    <th className="px-6 py-4 text-left font-medium">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Last Post
                    </th>
                    <th className="px-6 py-4 text-left font-medium">Phone</th>
                    <th className="px-6 py-4 text-left font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVIEW_ROWS.map((r) => (
                    <tr
                      key={r.name}
                      className="border-b border-[color:var(--color-ink-line)]/60 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="break-words px-6 py-4 font-semibold text-[color:var(--color-warm)]">
                        {r.name}
                      </td>
                      <td className="break-words px-6 py-4 text-[color:var(--color-muted)]">
                        {r.category}
                      </td>
                      <td className="break-words px-6 py-4 text-[color:var(--color-muted)]">
                        {r.location}
                      </td>
                      <td className="break-words px-6 py-4 font-medium text-[color:var(--color-danger)]">
                        {r.lastPost}
                      </td>
                      <td className="break-words px-6 py-4 text-[color:var(--color-muted)]">
                        {r.phone}
                      </td>
                      <td className="break-words px-6 py-4 text-[color:var(--color-muted)]">
                        {r.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
