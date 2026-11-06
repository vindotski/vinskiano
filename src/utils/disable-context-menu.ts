window.oncontextmenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  return false
}
