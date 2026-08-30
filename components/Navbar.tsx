import { Logo } from "./Logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a
          href="#top"
          className="flex items-center gap-2"
          aria-label="NearoLeads home"
        >
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight">
            GhostLeads
          </span>
        </a>
        <a
          href="#pricing"
          className="rounded-full bg-cyan px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          Buy Leads
        </a>
      </nav>
    </header>
  );
}
