import React from 'react'
import PropTypes from 'prop-types'

class MixerSection extends React.Component {
  render () {
    return (
      <div className={`mixer-section ${this.props.className}`}>
        <div className="mixer-section-body">
          {this.props.children}
        </div>
      </div>
    )
  }
}

MixerSection.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string
}

MixerSection.defaultProps = {
  className: ''
}

export default MixerSection
