// Signature element: an "activity meter" that flat-lines with a red "dead"
// pulse — a visual shorthand for a business whose social page has no activity.

export function ActivityMeter({ label = "No activity" }: { label?: string }) {
  return (
    <div
      className="inline-flex items-center gap-3 rounded-full border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)]/70 px-4 py-2"
      role="img"
      aria-label={`Activity meter: ${label}`}
    >
      <span className="dead-dot inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--color-danger)]" />
      <svg
        width="120"
        height="24"
        viewBox="0 0 120 24"
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* baseline */}
        <line x1="0" y1="12" x2="120" y2="12" stroke="var(--color-ink-line)" strokeWidth="1" />
        {/* flat-line trace with one dying blip */}
        <path
          className="flatline-path"
          d="M0 12 H46 l4 -7 l4 14 l4 -7 H120"
          stroke="var(--color-danger)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="text-xs font-medium text-[color:var(--color-danger)]">{label}</span>
    </div>
  );
}
