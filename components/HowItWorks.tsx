import type { ReactNode } from "react";

type Step = {
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

const STEPS: Step[] = [
  {
    accent: "cyan",
    title: "You place your order",
    body: "Pick how many leads you want and pay — €100 per lead. That's it to get started.",
    icon: (
      <svg {...iconProps}>
        <path d="M6 6h15l-1.5 9h-12z" />
        <path d="M6 6 5 3H3" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    ),
  },
  {
    accent: "lime",
    title: "We call and close them",
    body: "We reach out to local businesses that need marketing and warm them up until they're ready to talk.",
    icon: (
      <svg {...iconProps}>
        <path d="M4.5 5.5c0 7.18 5.82 13 13 13a2 2 0 0 0 2-1.72l.26-1.8a1 1 0 0 0-.7-1.1l-3.1-1a1 1 0 0 0-1.06.3l-.9 1.03a11.3 11.3 0 0 1-5.24-5.24l1.03-.9a1 1 0 0 0 .3-1.06l-1-3.1a1 1 0 0 0-1.1-.7l-1.8.26A2 2 0 0 0 4.5 5.5Z" />
      </svg>
    ),
  },
  {
    accent: "cyan",
    title: "You get hot leads",
    body: "Every lead already said yes. You just show up, sign them, and grow your pipeline.",
    icon: (
      <svg {...iconProps}>
        <path d="m5 13 4 4L19 7" />
      </svg>
    ),
  },
];

const accentClasses: Record<Step["accent"], string> = {
  cyan: "text-cyan ring-cyan/20 bg-cyan/10 group-hover:ring-cyan/40 group-hover:shadow-cyan/20",
  lime: "text-lime ring-lime/20 bg-lime/10 group-hover:ring-lime/40 group-hover:shadow-lime/20",
};

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">
        How it works
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-base text-muted">
        You pay once. We call and close the clients. You do the work.
      </p>

      <div className="relative mt-14 grid gap-6 sm:grid-cols-3">
        {/* Connecting line behind the steps on desktop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-linear-to-r from-transparent via-ink-line to-transparent sm:block"
        />

        {STEPS.map((s) => (
          <div
            key={s.title}
            className="group relative rounded-2xl border border-ink-line bg-ink-soft p-6 text-center transition hover:-translate-y-1 hover:border-white/15"
          >
            <span
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ring-1 shadow-lg shadow-transparent transition ${accentClasses[s.accent]}`}
            >
              {s.icon}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-warm">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
