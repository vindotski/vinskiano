import { Link } from '@tanstack/react-router'
import SiteFooter from '@/components/site/SiteFooter'
import SiteHeader from '@/components/site/SiteHeader'
import { buttonVariants } from '@/components/ui/button-variants'

/** Rendered by the root route for unknown URLs, so it brings the site's header and footer itself. */
const NotFound = () => {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 [view-transition-name:page]">
        <h1 className="font-heading text-2xl font-semibold">404 - Not Found</h1>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          Return to homepage
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}

export default NotFound
