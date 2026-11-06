/**
 * Keep the --vh CSS variable at 1% of the real viewport height (mobile browser bars make
 * 100vh too tall). Until this runs, CSS falls back to 1vh. Returns a cleanup.
 */
export function trackViewportHeight(): () => void {
  const update = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
  }
  update()
  window.addEventListener('resize', update)
  return () => window.removeEventListener('resize', update)
}
