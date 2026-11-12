/**
 * Lets keyboard users jump past the header; visible only while focused. `not-sr-only` resets
 * padding, so its size comes from `min-h-11` (44 px, the minimum tap target) and `px-4` on focus.
 */
const SkipLink = () => (
  <a
    href="#content"
    className="sr-only rounded-full bg-primary text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:px-4"
  >
    Skip to content
  </a>
)

export default SkipLink
