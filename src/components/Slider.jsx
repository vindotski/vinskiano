import PropTypes from 'prop-types'
import React from 'react'

let nextId = 0

class Slider extends React.Component {
  // React 17 has no useId, so each instance gets its own id for the label.
  id = `slider-${++nextId}`

  render() {
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

Slider.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  min: PropTypes.any,
  max: PropTypes.any,
}

Slider.defaultProps = {
  label: '',
  onChange: () => {},
  min: 0,
  max: 100,
}

export default Slider
