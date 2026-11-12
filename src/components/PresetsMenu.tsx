import { CheckIcon, ChevronDownIcon, Trash2Icon } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  Form,
  Heading,
  Input,
  Label,
  TextField,
} from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { SelectPopover } from '@/components/ui/select'
import { PRESET_NAME_MAX, type Preset } from '@/synth/preset'

interface PresetsMenuProps {
  /** null until loaded. */
  presets: Preset[] | null
  /** The name of the preset the sound was loaded from or saved as; null for a new sound. */
  current: string | null
  /** The sound has changed since that preset was loaded or saved. */
  edited: boolean
  pending: boolean
  /** The outcome of the last action (errors included), announced to screen readers. */
  message: string | null
  /** Called when the menu opens, to load the list. */
  onOpen: () => void
  /** Saves the current sound under the name; resolves true once saved. */
  onSave: (name: string) => Promise<boolean>
  onLoad: (preset: Preset) => void
  /** Resolves once the preset is gone (or deleting failed). */
  onDelete: (preset: Preset) => Promise<void>
}

/** The popover's width (w-72), so it stays on screen (with a margin) when the app is rotated. */
const WIDTH = 288

/**
 * Saved sounds in one dropdown that names the current one ("New sound" before any), with a dot
 * once it's been changed. It opens a popover to save the sound under a name (offering the
 * current one, so saving updates it) and to load or delete saved ones. Long names are cut off
 * with an ellipsis; hovering shows them whole. Presentational: everything comes from props.
 */
const PresetsMenu = ({
  presets,
  current,
  edited,
  pending,
  message,
  onOpen,
  onSave,
  onLoad,
  onDelete,
}: PresetsMenuProps) => {
  const [name, setName] = useState('')
  const shown = current ?? 'New sound'
  const input = useRef<HTMLInputElement>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (await onSave(name)) setName('')
  }

  // The focused row goes away: give focus to the name field, so it stays in the popover
  // (and Escape still closes it).
  const remove = async (preset: Preset) => {
    await onDelete(preset)
    input.current?.focus()
  }

  return (
    <DialogTrigger
      onOpenChange={(open) => {
        if (!open) return
        setName(current ?? '')
        onOpen()
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Presets: ${shown}${edited ? ', edited' : ''}`}
        className="gap-1 bg-input/50 pr-2 pl-3 hover:bg-input/80"
      >
        <span title={shown} className="max-w-24 truncate md:max-w-40 xl:max-w-56">
          {shown}
        </span>
        {edited ? (
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
        ) : null}
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </Button>
      <SelectPopover
        placement="bottom start"
        rotatedWidth={WIDTH + 8}
        className="w-72 bg-popover/90"
      >
        <Dialog
          aria-label="Presets"
          className="flex max-h-[inherit] flex-col gap-3 p-3 outline-hidden"
        >
          <Heading slot="title" className="px-1 text-sm font-semibold">
            Presets
          </Heading>

          <Form onSubmit={submit} className="flex items-end gap-2">
            <TextField
              value={name}
              onChange={setName}
              maxLength={PRESET_NAME_MAX}
              isRequired
              className="flex min-w-0 flex-1 flex-col gap-1"
            >
              <Label className="px-1 text-xs text-muted-foreground">Save this sound as</Label>
              <Input
                ref={input}
                placeholder="Name"
                className="h-11 rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </TextField>
            <Button type="submit" size="sm" isPending={pending}>
              Save
            </Button>
          </Form>

          {presets === null ? (
            <p className="px-1 text-sm text-muted-foreground">{pending ? 'Loading…' : null}</p>
          ) : presets.length === 0 ? (
            <p className="px-1 text-sm text-muted-foreground">No saved sounds yet.</p>
          ) : (
            <ul aria-label="Saved sounds" className="-mx-1 min-h-0 overflow-y-auto">
              {presets.map((preset) => (
                <li key={preset.id} className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Load ${preset.name}`}
                    aria-current={preset.name === current}
                    onPress={() => onLoad(preset)}
                    className="min-w-0 flex-1 justify-start"
                  >
                    <span className="truncate">{preset.name}</span>
                    {preset.name === current ? (
                      <CheckIcon aria-hidden="true" className="ml-auto text-primary" />
                    ) : null}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${preset.name}`}
                    isPending={pending}
                    onPress={() => remove(preset)}
                  >
                    <Trash2Icon className="text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <p role="status" className="px-1 text-xs text-muted-foreground empty:hidden">
            {message}
          </p>
        </Dialog>
      </SelectPopover>
    </DialogTrigger>
  )
}

export default PresetsMenu
