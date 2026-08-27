import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-ink-line)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <a
          href="#top"
          className="flex items-center gap-2"
          aria-label="NearoLeads home"
        >
          <Logo />
          <span className="font-display font-bold">GhostLeads</span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-[color:var(--color-muted)]">
          <a
            href="#pricing"
            className="transition hover:text-[color:var(--color-warm)]"
          >
            Pricing
          </a>
          <a
            href="dachimaisashvilidev@gmail.com"
            className="transition hover:text-[color:var(--color-warm)]"
          >
            Contact
          </a>
        </nav>
        <p className="text-xs text-[color:var(--color-muted)]">
          © {new Date().getFullYear()} GhostLeads
        </p>
      </div>
    </footer>
  );
}
