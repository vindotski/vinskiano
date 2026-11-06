import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MixerSectionProps {
  title: string
  className?: string
  children?: ReactNode
}

const MixerSection = ({ title, className, children }: MixerSectionProps) => {
  return (
    <Card className={cn('min-h-0 overflow-auto short:gap-2 short:py-3', className)} size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 short:gap-2">{children}</CardContent>
    </Card>
  )
}

export default MixerSection
