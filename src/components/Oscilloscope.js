import React from 'react'
import PropTypes from 'prop-types'

class Oscilloscope extends React.Component {
  state = {
    canvas: React.createRef()
  }

  componentDidMount () {
    const { oscilloscope } = this.props
    const canvas = this.state.canvas.current

    const update = () => {
      const nodes = oscilloscope.update()
      const bufferLength = oscilloscope.bufferLength
      const context = canvas.getContext('2d')

      context.fillStyle = 'rgb(255, 255, 255)'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)

      context.lineWidth = 2
      context.strokeStyle = 'rgb(0, 0, 0)'
      context.beginPath()

      const sliceWidth = context.canvas.width * 1.0 / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const y = nodes[i] * context.canvas.height / 2

        if (i === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }

        x += sliceWidth
      }

      context.lineTo(context.canvas.width, context.canvas.height / 2)
      context.stroke()

      requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }

  render () {
    return (
      <canvas
        ref={this.state.canvas}
        className="oscilloscope"
      />
    )
  }
}

Oscilloscope.propTypes = {
  oscilloscope: PropTypes.object.isRequired
}

export default Oscilloscope
