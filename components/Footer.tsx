import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-ink-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <a
          href="#top"
          className="flex items-center gap-2"
          aria-label="NearoLeads home"
        >
          <Logo />
          <span className="font-display font-bold">GhostLeads</span>
        </a>
        <nav className="flex items-center justify-center gap-6 text-sm text-muted">
          <a
            href="mailto:dachimaisashvilidev@gmail.com?subject=GhostLeads%20enquiry"
            className="flex items-center gap-1.5 transition hover:text-warm"
            aria-label="Contact GhostLeads by email"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M24 4.5v15c0 .83-.67 1.5-1.5 1.5H21V7.39l-9 6.75-9-6.75V21H1.5C.67 21 0 20.33 0 19.5v-15c0-.42.17-.8.44-1.07C.71 3.16 1.09 3 1.5 3H2l10 7.5L22 3h.5c.41 0 .79.16 1.06.43.27.27.44.65.44 1.07z" />
            </svg>
            Contact
          </a>
          <a
            href="https://www.linkedin.com/company/ghosteleads/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition hover:text-warm"
            aria-label="GhostLeads on LinkedIn"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
            </svg>
            LinkedIn
          </a>
        </nav>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} GhostLeads
        </p>
      </div>
    </footer>
  );
}
