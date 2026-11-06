/** The Vinskiano mark: one cycle of a sine wave in a rounded square (same as public/favicon.svg). */
const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="9" className="fill-primary" />
    <path
      d="M6 16c2.5-9 7.5-9 10 0s7.5 9 10 0"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      className="stroke-primary-foreground"
    />
  </svg>
)

export default Logo
