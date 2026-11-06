import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button-variants'

const NotFound = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h2 className="font-heading text-2xl font-semibold">404 - Not Found</h2>
      <Link to="/" className={buttonVariants({ variant: 'outline' })}>
        Return to homepage
      </Link>
    </div>
  )
}

export default NotFound
