import PropTypes from 'prop-types'

const ButtonToggle = ({ value, options, onChange, label, render }) => {
  return (
    <div className="button-toggle">
      <div className="button-toggle-options">
        {options.map((option) => render({ value, option, onChange }))}
      </div>
    </div>
  )
}

ButtonToggle.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  render: PropTypes.func,
}

ButtonToggle.defaultProps = {
  onChange: () => {},
  render: ({ value, option, onChange }) => (
    <button
      key={option.value}
      className={`button-toggle-option ${value === option.value ? 'toggled' : ''}`}
      onClick={() => onChange(option.value)}
    >
      {option.label}
    </button>
  ),
}

export default ButtonToggle
