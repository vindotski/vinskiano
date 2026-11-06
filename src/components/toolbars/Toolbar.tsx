import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const Toolbar = ({ children, className }: { children?: ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        'flex h-12 shrink-0 items-center gap-2 px-4 text-sm text-muted-foreground short:h-9',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Toolbar
