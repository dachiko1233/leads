// Example delivery table so customers see exactly what they get.

interface Row {
  name: string;
  category: string;
  location: string;
  lastPost: string;
  instagram: string;
  facebook: string;
  telephone: string;
  email: string;
}

const ROWS: Row[] = [
  {
    name: "Juniper & Co. Salon",
    category: "Hair salon",
    location: "Austin, TX",
    lastPost: "No posts",
    instagram: "—",
    facebook: "—",
    telephone: "+1 512-555-0142",
    email: "hello@juniperco.com",
  },
  {
    name: "Blue Agave Cantina",
    category: "Mexican restaurant",
    location: "Austin, TX",
    lastPost: "62 days ago",
    instagram: "—",
    facebook: "fb.com/blueagaveatx",
    telephone: "+1 512-555-0199",
    email: "—",
  },
  {
    name: "Maple & Thread Boutique",
    category: "Clothing store",
    location: "Austin, TX",
    lastPost: "45 days ago",
    instagram: "@mapleandthread",
    facebook: "—",
    telephone: "+1 512-555-0155",
    email: "—",
  },
  {
    name: "Barton Springs Bike Repair",
    category: "Bicycle shop",
    location: "Austin, TX",
    lastPost: "No posts",
    instagram: "—",
    facebook: "—",
    telephone: "+1 512-555-0188",
    email: "ride@bartonspringsbikes.com",
  },
];

const HEADERS = [
  "Name",
  "Category",
  "Location",
  "Last Post",
  "Instagram",
  "Facebook",
  "Telephone",
  "Email",
];

function LastPostCell({ value }: { value: string }) {
  const hot = value === "No posts" || /\d{2,}\s*days/.test(value);
  return (
    <span
      className={
        hot
          ? "font-semibold text-[color:var(--color-danger)]"
          : "text-[color:var(--color-muted)]"
      }
    >
      {value}
    </span>
  );
}

export function CsvPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">What you receive</h2>
          <p className="mt-3 max-w-2xl text-[color:var(--color-muted)]">
            A clean CSV of prioritized leads. The{" "}
            <span className="text-[color:var(--color-danger)]">Last Post</span> column is
            the hot signal — abandoned and stale pages float to the top.
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--color-ink-line)] px-4 py-2 text-sm text-[color:var(--color-muted)]">
          leads.csv
        </span>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)]">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-ink-line)] text-[color:var(--color-muted)]">
              {HEADERS.map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.name}
                className="border-b border-[color:var(--color-ink-line)]/60 last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium">{r.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted)]">{r.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted)]">{r.location}</td>
                <td className="whitespace-nowrap px-4 py-3"><LastPostCell value={r.lastPost} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted)]">{r.instagram}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted)]">{r.facebook}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted)]">{r.telephone}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted)]">{r.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
