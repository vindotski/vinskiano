import type { Waveform } from '@/audio'

// Hand-drawn in 2020 (viewBox 0 0 12.7 12.7); stroked with currentColor so they follow the theme.
const PATHS: Record<Waveform, string> = {
  sine: 'm0.40979 7.3989s1.522-6.4516 3.9632-6.2034c3.6739 0.37358 0.29623 9.9086 3.9632 10.345 2.3132 0.27554 3.9632-5.7563 3.9632-5.7563',
  square:
    'm0.77442 12.12-0.0055943-11.275 5.7044 0.051345 0.32813 10.956 5.1212-0.08712-0.06602-11.066',
  triangle: 'm0.40979 7.3989 3.9632-6.2034 3.9632 10.345 3.9632-5.7563',
  sawtooth: 'm0.40979 7.3989 8.0264-6.2034-0.10009 10.345 4.1994-3.5357',
}

const WaveformIcon = ({ waveform, className }: { waveform: Waveform; className?: string }) => (
  <svg viewBox="0 0 12.7 12.7" className={className} aria-hidden="true">
    <path
      d={PATHS[waveform]}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
)

export default WaveformIcon
