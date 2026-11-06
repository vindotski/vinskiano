import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        Vinskiano
      </NavLink>

      <ul className="navbar-content">
        <li className="navbar-item">
          <NavLink to="/" className="navbar-link" activeClassName="active" exact>
            Piano Roll
          </NavLink>
        </li>

        <li className="navbar-item">
          <NavLink to="/oscillators" className="navbar-link" activeClassName="active">
            Oscillators
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
