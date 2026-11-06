import React, { type ChangeEvent } from 'react'

let nextId = 0

interface SliderProps {
  label: string
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  min: number
  max: number
}

class Slider extends React.Component<SliderProps> {
  static defaultProps = {
    label: '',
    onChange: () => {},
    min: 0,
    max: 100,
  }

  // React 17 has no useId, so each instance gets its own id for the label.
  id = `slider-${++nextId}`

  override render() {
    return (
      <div className="input-group">
        <label className="input-group-label" htmlFor={this.id}>
          <span>{this.props.label}</span>
          <strong>{this.props.value}</strong>
        </label>

        <input
          id={this.id}
          className="input-group-control"
          value={this.props.value}
          onChange={this.props.onChange}
          type="range"
          min={this.props.min}
          max={this.props.max}
        />
      </div>
    )
  }
}

export default Slider
