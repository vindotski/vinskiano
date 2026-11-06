/** Lets keyboard users jump past the header; visible only while focused. */
const SkipLink = () => (
  <a
    href="#content"
    className="sr-only rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
  >
    Skip to content
  </a>
)

export default SkipLink
