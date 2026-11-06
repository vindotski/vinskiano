import { NavLink } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found">
      <h2>404 - Not Found</h2>

      <NavLink to="/">Return to homepage</NavLink>
    </div>
  )
}

export default NotFound
