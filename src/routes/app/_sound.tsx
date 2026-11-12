import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

/**
 * The sound pages (/app/oscillators, and the envelope next): a tab bar over the page. Tabs are
 * links, so each page has its own URL and the open one is marked aria-current="page".
 */
export const Route = createFileRoute('/app/_sound')({
  component: SoundLayout,
})

const TAB =
  'inline-flex h-11 items-center rounded-4xl px-4 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-sm'

function SoundLayout() {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 pt-3 short:px-2 short:pt-1.5">
        <nav aria-label="Sound" className="inline-flex gap-1 rounded-4xl bg-input/50 p-1">
          <Link to="/app/oscillators" className={TAB}>
            Oscillators
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground short:hidden">
          Changes apply right away. Go back to the keyboard to play.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4 short:p-2">
        <Outlet />
      </div>
    </>
  )
}
