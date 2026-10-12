import type { ReactNode } from "react";

type Benefit = {
  icon: ReactNode;
  title: string;
  body: string;
  accent: "cyan" | "lime";
};

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const BENEFITS: Benefit[] = [
  {
    accent: "cyan",
    title: "No cold calling",
    body: "We make the calls. You get your time back.",
    icon: (
      <svg {...iconProps}>
        <path d="M4.5 5.5c0 7.18 5.82 13 13 13a2 2 0 0 0 2-1.72l.26-1.8a1 1 0 0 0-.7-1.1l-3.1-1a1 1 0 0 0-1.06.3l-.9 1.03a11.3 11.3 0 0 1-5.24-5.24l1.03-.9a1 1 0 0 0 .3-1.06l-1-3.1a1 1 0 0 0-1.1-.7l-1.8.26A2 2 0 0 0 4.5 5.5Z" />
        <path d="m4 4 16 16" />
      </svg>
    ),
  },
  {
    accent: "lime",
    title: "Only hot leads",
    body: "Every lead already said yes.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3c.5 2.5-.5 4-1.8 5.4C8.5 10.3 7 11.9 7 14.5A5 5 0 0 0 17 15c0-2-1-3.5-2-5 .9.4 1.6 1 2 1.8.3-3-1-5.4-2.3-6.8C13.4 3.7 12.6 3.2 12 3Z" />
        <path d="M12 18.5a2.2 2.2 0 0 0 2.2-2.2c0-1-.7-1.8-1.3-2.6-.4.9-.9 1.3-1.7 1.9-.6.5-1.4 1-1.4 2a2.2 2.2 0 0 0 2.2.9Z" />
      </svg>
    ),
  },
  {
    accent: "cyan",
    title: "Every month",
    body: "A fresh pipeline on autopilot.",
    icon: (
      <svg {...iconProps}>
        <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
        <path d="M4 4v4.5h4.5" />
        <path d="M4 12.5A8 8 0 0 0 17.7 17.7L20 15.5" />
        <path d="M20 20v-4.5h-4.5" />
      </svg>
    ),
  },
];

const accentClasses: Record<Benefit["accent"], string> = {
  cyan: "text-cyan ring-cyan/20 bg-cyan/10 group-hover:ring-cyan/40 group-hover:shadow-cyan/20",
  lime: "text-lime ring-lime/20 bg-lime/10 group-hover:ring-lime/40 group-hover:shadow-lime/20",
};

export function WhyAgencies() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">
        Why agencies love this
      </h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="group rounded-2xl border border-ink-line bg-ink-soft p-6 text-center transition hover:-translate-y-1 hover:border-white/15"
          >
            <span
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ring-1 shadow-lg shadow-transparent transition ${accentClasses[b.accent]}`}
            >
              {b.icon}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-warm">{b.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
