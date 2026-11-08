import { useCallback, useRef, useState } from 'react'
import type { Preset, PresetSettings } from './preset'
import { deletePreset, listPresets, savePreset } from './presets.functions'

/** The visitor's presets, loaded on demand (the first time the menu opens), and what to say. */
export interface Presets {
  /** null until loaded. */
  presets: Preset[] | null
  /** A request is running. */
  pending: boolean
  /** The outcome of the last action, for a live region (errors included). */
  message: string | null
  /** Loads the list the first time it's needed; later calls do nothing. */
  load: () => void
  /** Resolves true once saved. */
  save: (name: string, settings: PresetSettings) => Promise<boolean>
  remove: (preset: Preset) => Promise<void>
  /** Shows a message, e.g. after loading a preset into the synth. */
  announce: (message: string) => void
}

const byName = (a: Preset, b: Preset) => a.name.localeCompare(b.name)
const reason = (error: unknown) =>
  error instanceof Error && error.message ? error.message : 'Something went wrong; try again'

export function usePresets(): Presets {
  const [presets, setPresets] = useState<Preset[] | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const loading = useRef(false)

  /** Runs a request, with `pending` set and any error turned into the message. */
  const run = useCallback(async (request: () => Promise<string>) => {
    setPending(true)
    try {
      setMessage(await request())
      return true
    } catch (error) {
      setMessage(reason(error))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  const load = useCallback(() => {
    if (loading.current) return
    loading.current = true
    void run(async () => {
      try {
        setPresets(await listPresets())
        return ''
      } catch (error) {
        loading.current = false // let the next open try again
        throw error
      }
    })
  }, [run])

  const save = useCallback(
    (name: string, settings: PresetSettings) =>
      run(async () => {
        const saved = await savePreset({ data: { name, settings } })
        const replaced = presets?.some((p) => p.id === saved.id) ?? false
        setPresets((current) =>
          [...(current ?? []).filter((p) => p.id !== saved.id), saved].sort(byName),
        )
        return `${replaced ? 'Updated' : 'Saved'} “${saved.name}”`
      }),
    [run, presets],
  )

  const remove = useCallback(
    async (preset: Preset) => {
      await run(async () => {
        await deletePreset({ data: { id: preset.id } })
        setPresets((current) => current?.filter((p) => p.id !== preset.id) ?? null)
        return `Deleted “${preset.name}”`
      })
    },
    [run],
  )

  return { presets, pending, message, load, save, remove, announce: setMessage }
}
