import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function CheckoutSuccess() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="font-display text-lg font-bold">NearoLeads</span>
      </div>

      <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-lime/15">
        <span className="text-3xl text-lime">✓</span>
      </div>

      <h1 className="mt-6 text-3xl font-bold">Payment received</h1>
      <p className="mt-3 text-muted">
        We&apos;re generating your prioritized lead list now. It will arrive as a{" "}
        <code className="text-warm">leads.csv</code> attachment at the
        email you provided — usually within a few minutes.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-full border border-ink-line px-6 py-3 text-sm font-semibold transition hover:border-cyan"
      >
        Back to home
      </Link>
    </main>
  );
}
