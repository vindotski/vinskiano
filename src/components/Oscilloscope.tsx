import React from 'react'
import type { Oscilloscope as AudioOscilloscope } from '@/audio'

interface OscilloscopeProps {
  oscilloscope: AudioOscilloscope
}

/** Draws the master output. Colors come from the canvas's CSS (theme tokens), so dark mode just works. */
class Oscilloscope extends React.Component<OscilloscopeProps> {
  canvas = React.createRef<HTMLCanvasElement>()
  frame = 0

  override componentDidMount() {
    const { oscilloscope } = this.props
    const canvas = this.canvas.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return
    }

    const update = () => {
      // Match the drawing buffer to the displayed size for a crisp line.
      const ratio = window.devicePixelRatio || 1
      const width = Math.round(canvas.clientWidth * ratio)
      const height = Math.round(canvas.clientHeight * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const style = getComputedStyle(canvas)
      const nodes = oscilloscope.update()

      context.fillStyle = style.backgroundColor
      context.fillRect(0, 0, width, height)

      context.lineWidth = 2 * ratio
      context.lineJoin = 'round'
      context.strokeStyle = style.color
      context.beginPath()

      const sliceWidth = width / nodes.length
      for (const [i, node] of nodes.entries()) {
        const x = i * sliceWidth
        const y = (node * height) / 2
        if (i === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      }

      context.lineTo(width, height / 2)
      context.stroke()

      this.frame = requestAnimationFrame(update)
    }

    this.frame = requestAnimationFrame(update)
  }

  override componentWillUnmount() {
    cancelAnimationFrame(this.frame)
  }

  override render() {
    // `oscilloscope` is a hook for tests.
    return (
      <canvas
        ref={this.canvas}
        className="oscilloscope h-28 w-full short:h-20 rounded-2xl bg-muted text-primary"
        aria-label="Oscilloscope showing the master output"
        role="img"
      />
    )
  }
}

export default Oscilloscope
