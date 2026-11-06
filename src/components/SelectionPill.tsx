import * as m from 'motion/react-m'
import { cn } from '@/lib/utils'

/** Snappy, with a hint of overshoot; skipped entirely when the OS asks for reduced motion. */
const SLIDE = { type: 'spring', bounce: 0.15, duration: 0.35 } as const

/**
 * The highlight behind the selected item of a group. Render it inside the selected item only:
 * items sharing a `layoutId` hand the pill over, and Motion animates it gliding from the old
 * item to the new one. The parent needs `relative isolate`. Without Motion's features loaded,
 * it's a plain highlight in place, so selection is never hidden.
 */
const SelectionPill = ({ layoutId, className }: { layoutId: string; className?: string }) => (
  <m.span
    layoutId={layoutId}
    transition={SLIDE}
    data-selection-pill
    aria-hidden="true"
    className={cn('absolute inset-0 -z-10', className)}
  />
)

export default SelectionPill
