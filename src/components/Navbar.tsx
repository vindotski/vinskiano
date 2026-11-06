import { Link } from '@tanstack/react-router'

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Vinskiano
      </Link>

      <ul className="navbar-content">
        <li className="navbar-item">
          {/* Link adds the `active` class itself; "/" must match exactly. */}
          <Link to="/" className="navbar-link" activeOptions={{ exact: true }}>
            Piano Roll
          </Link>
        </li>

        <li className="navbar-item">
          <Link to="/oscillators" className="navbar-link">
            Oscillators
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
