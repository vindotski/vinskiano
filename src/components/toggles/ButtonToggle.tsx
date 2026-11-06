import type { ReactNode } from 'react'

export interface ToggleOption<T extends string> {
  value: T
  label: string
}

export interface ToggleRenderProps<T extends string> {
  value: T
  option: ToggleOption<T>
  onChange: (value: T) => void
}

interface ButtonToggleProps<T extends string> {
  value: T
  options: ToggleOption<T>[]
  onChange?: (value: T) => void
  render?: (props: ToggleRenderProps<T>) => ReactNode
}

const renderText = <T extends string>({ value, option, onChange }: ToggleRenderProps<T>) => (
  <button
    type="button"
    key={option.value}
    className={`button-toggle-option ${value === option.value ? 'toggled' : ''}`}
    onClick={() => onChange(option.value)}
  >
    {option.label}
  </button>
)

const ButtonToggle = <T extends string>({
  value,
  options,
  onChange = () => {},
  render = renderText,
}: ButtonToggleProps<T>) => {
  return (
    <div className="button-toggle">
      <div className="button-toggle-options">
        {options.map((option) => render({ value, option, onChange }))}
      </div>
    </div>
  )
}

export default ButtonToggle
