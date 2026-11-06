import { createFileRoute, Outlet } from '@tanstack/react-router'
import SiteFooter from '../components/site/SiteFooter'
import SiteHeader from '../components/site/SiteHeader'
import SkipLink from '../components/site/SkipLink'

/** The website around the synth (a pathless layout: it adds no URL segment). Scrolls normally. */
export const Route = createFileRoute('/_site')({
  component: SiteLayout,
})

function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="content" className="flex flex-1 flex-col [view-transition-name:page]">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
