import { Link } from '@tanstack/react-router'

const NotFound = () => {
  return (
    <div className="not-found">
      <h2>404 - Not Found</h2>
      <Link to="/">Return to homepage</Link>
    </div>
  )
}

export default NotFound
