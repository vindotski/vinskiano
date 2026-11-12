import { Link } from '@tanstack/react-router'
import Logo from '@/components/icons/Logo'
import { buttonVariants } from '@/components/ui/button-variants'

const SiteHeader = () => (
  <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
    <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
      <Link
        to="/"
        className="flex min-h-11 items-center gap-2 rounded-full font-heading text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <Logo className="size-6" />
        Vinskiano
      </Link>
      <Link to="/app" className={buttonVariants({ size: 'sm' })}>
        Open the synth
      </Link>
    </div>
  </header>
)

export default SiteHeader
