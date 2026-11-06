// react-circle-slider is written in TypeScript but publishes no declarations.
// These props mirror its source (src/circle-slider/index.tsx, v1.6.2).
declare module 'react-circle-slider' {
  import type { Component } from 'react'

  export interface CircleSliderProps {
    size?: number
    circleWidth?: number
    progressWidth?: number
    knobRadius?: number
    value?: number
    stepSize?: number
    min?: number
    max?: number
    circleColor?: string
    progressColor?: string
    gradientColorFrom?: string
    gradientColorTo?: string
    knobColor?: string
    onChange: (value?: number) => void
    disabled?: boolean
    shadow?: boolean
    showTooltip?: boolean
    showPercentage?: boolean
    tooltipSize?: number
    tooltipColor?: string
  }

  export class CircleSlider extends Component<CircleSliderProps> {}
}
