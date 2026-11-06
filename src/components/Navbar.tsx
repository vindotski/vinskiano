import { Link } from '@tanstack/react-router'
import Logo from './icons/Logo'
import SelectionPill from './SelectionPill'

const linkClass =
  'relative isolate rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 [&.active]:text-foreground'

const Navbar = () => {
  return (
    <nav className="flex h-12 shrink-0 short:h-10 items-center justify-between border-b bg-card px-4">
      <Link
        to="/"
        className="flex items-center gap-2 rounded-full font-heading text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <Logo className="size-6" />
        Vinskiano
      </Link>

      <ul className="flex items-center gap-1">
        <li>
          {/* Link adds the `active` class itself; "/app" must match exactly. */}
          <Link to="/app" className={linkClass} activeOptions={{ exact: true }}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <SelectionPill layoutId="nav-active" className="rounded-full bg-muted" />
                )}
                Piano Roll
              </>
            )}
          </Link>
        </li>

        <li>
          <Link to="/app/oscillators" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <SelectionPill layoutId="nav-active" className="rounded-full bg-muted" />
                )}
                Oscillators
              </>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
