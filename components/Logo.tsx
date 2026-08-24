// Small inline mark — a signal blip inside a ring.
export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="var(--color-cyan)" strokeWidth="2" />
      <path
        d="M6 14 h5 l2 -5 l3 10 l2 -5 h4"
        stroke="var(--color-lime)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
