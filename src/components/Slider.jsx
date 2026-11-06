import React from 'react'
import PropTypes from 'prop-types'

class Slider extends React.Component {
  render () {
    return (
      <div className="input-group">
        <label className="input-group-label">
          <span>{this.props.label}</span>
          <strong>{this.props.value}</strong>
        </label>

        <input
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
  max: PropTypes.any
}

Slider.defaultProps = {
  label: '',
  onChange: () => {},
  min: 0,
  max: 100
}

export default Slider
