import { type PointerEvent, useRef } from 'react'
import {
  mergeProps,
  useFocusRing,
  useNumberFormatter,
  useSlider,
  useSliderThumb,
  VisuallyHidden,
} from 'react-aria'
import { useSliderState } from 'react-stately'
import { cn } from '@/lib/utils'

/** The knob turns through 270°, from 7:30 to 4:30, with a dead zone at the bottom. */
const SWEEP = 270
const START = -SWEEP / 2
const END = SWEEP / 2

const SIZE = 65
const STROKE = 5
const RADIUS = (SIZE - 2 * STROKE) / 2
const CENTER = SIZE / 2

type FormatOptions = Parameters<typeof useNumberFormatter>[0]

/** Point on the knob's circle; 0° is 12 o'clock, positive is clockwise. */
const point = (degrees: number) => {
  const radians = (degrees * Math.PI) / 180
  return { x: CENTER + RADIUS * Math.sin(radians), y: CENTER - RADIUS * Math.cos(radians) }
}

const arc = (from: number, to: number) => {
  const start = point(Math.min(from, to))
  const end = point(Math.max(from, to))
  const largeArc = Math.abs(to - from) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export interface KnobProps {
  /** Accessible name, e.g. "Oscillator 1 pitch". */
  label: string
  value: number
  min?: number
  max?: number
  /** Draw the value arc from the center (for values around zero, like pitch). */
  bipolar?: boolean
  /** How screen readers announce the value. */
  formatOptions?: FormatOptions
  onChange?: (value: number) => void
}

/**
 * A rotary knob. Keyboard and screen readers get a native range input (via React
 * Aria): arrows, Page Up/Down, Home/End. Pointers turn it by angle around its center.
 */
const Knob = ({
  label,
  value,
  min = 0,
  max = 100,
  bipolar = false,
  formatOptions,
  onChange = () => {},
}: KnobProps) => {
  const trackRef = useRef<SVGSVGElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const numberFormatter = useNumberFormatter(formatOptions)

  const sliderProps = {
    'aria-label': label,
    value,
    minValue: min,
    maxValue: max,
    step: 1,
    onChange: (next: number | number[]) =>
      onChange(Array.isArray(next) ? (next[0] ?? value) : next),
  }
  const state = useSliderState({ ...sliderProps, numberFormatter })
  const { groupProps } = useSlider(sliderProps, state, trackRef)
  const { inputProps } = useSliderThumb(
    { index: 0, trackRef, inputRef, 'aria-label': label },
    state,
  )
  const { focusProps, isFocusVisible } = useFocusRing()

  const current = state.getThumbValue(0)
  const percent = (current - min) / (max - min)
  const angle = START + percent * SWEEP
  const arcFrom = bipolar ? START + SWEEP / 2 : START

  const turnTo = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - (box.left + box.width / 2)
    const dy = event.clientY - (box.top + box.height / 2)
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI

    if (Math.abs(degrees) > END) {
      // In the dead zone: stick to the end we're closest to instead of jumping across.
      state.setThumbValue(0, current >= (min + max) / 2 ? max : min)
      return
    }
    state.setThumbValue(0, min + ((degrees - START) / SWEEP) * (max - min))
  }

  return (
    <div
      {...groupProps}
      // `knob*` classes are hooks for tests; the rest is styling.
      className={cn(
        'knob inline-flex rounded-full',
        isFocusVisible && 'knob--focus-visible ring-3 ring-ring/50 ring-offset-2 ring-offset-card',
      )}
    >
      <svg
        ref={trackRef}
        className="knob-dial cursor-grab touch-none active:cursor-grabbing short:size-12"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        onPointerDown={(event) => {
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          inputRef.current?.focus({ preventScroll: true })
          state.setThumbDragging(0, true)
          turnTo(event)
        }}
        onPointerMove={(event) => {
          if (state.isThumbDragging(0)) turnTo(event)
        }}
        onPointerUp={() => state.setThumbDragging(0, false)}
        onPointerCancel={() => state.setThumbDragging(0, false)}
      >
        <path
          className="knob-track fill-none stroke-input"
          strokeWidth={STROKE}
          strokeLinecap="round"
          d={arc(START, END)}
        />
        {current !== (bipolar ? (min + max) / 2 : min) && (
          <path
            className="knob-value fill-none stroke-primary"
            strokeWidth={STROKE}
            strokeLinecap="round"
            d={arc(arcFrom, angle)}
          />
        )}
        <circle
          className="knob-pointer fill-primary"
          cx={point(angle).x}
          cy={point(angle).y}
          r={STROKE}
        />
        <text
          className="knob-text fill-foreground text-sm font-medium tabular-nums select-none"
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {Math.round(current)}
        </text>
      </svg>

      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </div>
  )
}

export default Knob
