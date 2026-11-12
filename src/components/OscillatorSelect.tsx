import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OSCILLATOR_IDS, type OscillatorId, toOscillatorId } from '@/synth/oscillators'

/**
 * An oscillator's number in a circle, as the bar shows it. Its text colour is `!important`: a
 * highlighted list item recolours all its descendants' text, which made the number vanish.
 */
const Badge = ({ id }: { id: OscillatorId }) => (
  <span
    aria-hidden="true"
    className="grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background! xl:size-6 xl:text-xs"
  >
    {id}
  </span>
)

interface OscillatorSelectProps {
  value: OscillatorId
  onChange: (id: OscillatorId) => void
}

/**
 * Which oscillator the bar shows: the trigger is its number, the list names all three.
 * Only the view changes; every oscillator keeps sounding. Keyboard: arrows, Enter, Esc.
 */
const OscillatorSelect = ({ value, onChange }: OscillatorSelectProps) => (
  <Select
    aria-label="Shown oscillator"
    value={value}
    onChange={(key) => {
      const id = toOscillatorId(key)
      if (id) onChange(id)
    }}
  >
    <SelectTrigger size="sm" className="w-auto gap-1 pr-1.5 pl-1.5">
      <SelectValue>
        {() => (
          <>
            <Badge id={value} />
            <span className="sr-only">Oscillator {value}</span>
          </>
        )}
      </SelectValue>
    </SelectTrigger>
    <SelectContent className="min-w-40">
      {OSCILLATOR_IDS.map((id) => (
        <SelectItem key={id} id={id} textValue={`Oscillator ${id}`}>
          <Badge id={id} />
          Oscillator {id}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default OscillatorSelect
