import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function CheckoutCancel() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="font-display text-lg font-bold">NearoLeads</span>
      </div>

      <h1 className="mt-8 text-3xl font-bold">Checkout canceled</h1>
      <p className="mt-3 text-[color:var(--color-muted)]">
        No charge was made. You can pick a package again whenever you&apos;re ready.
      </p>

      <Link
        href="/#pricing"
        className="mt-8 rounded-full bg-[color:var(--color-cyan)] px-6 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:brightness-110"
      >
        Back to pricing
      </Link>
    </main>
  );
}
