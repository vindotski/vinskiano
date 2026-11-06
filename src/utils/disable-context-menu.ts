/** Block the context menu (long-press on touch screens would open it over the keys). Returns a cleanup. */
export function disableContextMenu(): () => void {
  const block = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }
  window.addEventListener('contextmenu', block)
  return () => window.removeEventListener('contextmenu', block)
}
