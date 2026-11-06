import React from 'react'
import type { Oscilloscope as AudioOscilloscope } from '../audio'

interface OscilloscopeProps {
  oscilloscope: AudioOscilloscope
}

class Oscilloscope extends React.Component<OscilloscopeProps> {
  canvas = React.createRef<HTMLCanvasElement>()
  frame = 0

  override componentDidMount() {
    const { oscilloscope } = this.props
    const context = this.canvas.current?.getContext('2d')
    if (!context) {
      return
    }

    const update = () => {
      const nodes = oscilloscope.update()
      const bufferLength = oscilloscope.bufferLength

      context.fillStyle = 'rgb(255, 255, 255)'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)

      context.lineWidth = 2
      context.strokeStyle = 'rgb(0, 0, 0)'
      context.beginPath()

      const sliceWidth = (context.canvas.width * 1.0) / bufferLength
      let x = 0

      for (const [i, node] of nodes.entries()) {
        const y = (node * context.canvas.height) / 2

        if (i === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }

        x += sliceWidth
      }

      context.lineTo(context.canvas.width, context.canvas.height / 2)
      context.stroke()

      this.frame = requestAnimationFrame(update)
    }

    this.frame = requestAnimationFrame(update)
  }

  override componentWillUnmount() {
    cancelAnimationFrame(this.frame)
  }

  override render() {
    return <canvas ref={this.canvas} className="oscilloscope" />
  }
}

export default Oscilloscope
