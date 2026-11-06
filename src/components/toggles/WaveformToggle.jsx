import PropTypes from 'prop-types'
import SawtoothIcon from '../../waveform-sawtooth.svg'
import SineIcon from '../../waveform-sine.svg'
import SquareIcon from '../../waveform-square.svg'
import TriangleIcon from '../../waveform-triangle.svg'
import ButtonToggle from './ButtonToggle'

const WaveformToggle = ({ value, onChange, label }) => {
  const getIcon = (value) => {
    switch (value) {
      case 'sine':
        return SineIcon
      case 'square':
        return SquareIcon
      case 'triangle':
        return TriangleIcon
      case 'sawtooth':
        return SawtoothIcon
      default:
        return null
    }
  }

  const render = ({ value, option, onChange }) => (
    <button
      type="button"
      key={option.value}
      className={`button-toggle-option ${value === option.value ? 'toggled' : ''}`}
      onClick={() => onChange(option.value)}
    >
      <img src={getIcon(option.value)} alt={`${option.label} icon`} />
    </button>
  )

  return (
    <ButtonToggle
      value={value}
      onChange={onChange}
      label={label}
      options={[
        {
          value: 'sine',
          label: 'Sine',
        },
        {
          value: 'square',
          label: 'Square',
        },
        {
          value: 'triangle',
          label: 'Triangle',
        },
        {
          value: 'sawtooth',
          label: 'Sawtooth',
        },
      ]}
      render={render}
    />
  )
}

ButtonToggle.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string,
}

ButtonToggle.defaultProps = {
  onChange: () => {},
  label: 'Waveform',
}

export default WaveformToggle
