import React, { type ReactNode } from 'react'

interface MixerSectionProps {
  title: string
  className?: string
  children?: ReactNode
}

class MixerSection extends React.Component<MixerSectionProps> {
  static defaultProps = {
    className: '',
  }

  override render() {
    return (
      <div className={`mixer-section ${this.props.className}`}>
        <div className="mixer-section-body">{this.props.children}</div>
      </div>
    )
  }
}

export default MixerSection
