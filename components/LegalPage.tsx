import Link from "next/link";
import { Logo } from "./Logo";
import { legal } from "@/lib/legal";

/**
 * Shared shell for legal / policy pages (Contact, Refunds, Terms, Privacy).
 * Gives a simple header that links back home and a readable prose column.
 */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/80 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={`${legal.brand} home`}
          >
            <Logo />
            <span className="font-display text-lg font-bold tracking-tight">
              {legal.brand}
            </span>
          </Link>
          <Link
            href="/#pricing"
            className="rounded-full bg-cyan px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            Buy Leads
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">
          Last updated: {legal.lastUpdated}
        </p>
        {intro && <p className="mt-6 text-lg text-muted">{intro}</p>}

        <div className="legal-prose mt-10">{children}</div>

        <div className="mt-16 border-t border-ink-line pt-8">
          <Link
            href="/"
            className="inline-flex rounded-full border border-ink-line px-6 py-3 text-sm font-semibold transition hover:border-cyan"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </>
  );
}
