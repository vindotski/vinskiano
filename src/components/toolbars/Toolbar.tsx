import type { ReactNode } from 'react'

const Toolbar = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex h-12 shrink-0 short:h-9 items-center gap-2 px-4 text-sm text-muted-foreground">
      {children}
    </div>
  )
}

export default Toolbar
