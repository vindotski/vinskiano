import { useCallback, useRef, useState } from 'react'
import type { Preset, PresetSettings } from './preset'
import { deletePreset, listPresets, savePreset } from './presets.functions'

/** The visitor's presets, loaded on demand (the first time the menu opens), and what to say. */
export interface Presets {
  /** null until loaded. */
  presets: Preset[] | null
  /**
   * The preset the sound was last loaded from or saved as; null for a new sound (and after that
   * preset is deleted). Kept in the browser only, like the sound itself.
   */
  current: Preset | null
  /** Makes a preset the current one, after it's loaded into the synth. */
  choose: (preset: Preset) => void
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

type Change = (list: Preset[]) => Preset[]

const byName = (a: Preset, b: Preset) => a.name.localeCompare(b.name)
const reason = (error: unknown) =>
  error instanceof Error && error.message ? error.message : 'Something went wrong; try again'

export function usePresets(): Presets {
  const [presets, setPresets] = useState<Preset[] | null>(null)
  const [current, setCurrent] = useState<Preset | null>(null)
  const [requests, setRequests] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const listed = useRef(false)
  /** Why the list last failed to load; a retry takes the message back. */
  const listError = useRef<string | null>(null)
  /** Changes saved while the list loads: the list may have been read before them. */
  const unlisted = useRef<Change[] | null>(null)

  /** Runs a request with `pending` set (requests can overlap). */
  const track = useCallback(async <T>(request: () => Promise<T>) => {
    setRequests((n) => n + 1)
    try {
      return await request()
    } finally {
      setRequests((n) => n - 1)
    }
  }, [])

  /** Runs an action; its outcome or error becomes the message. */
  const run = useCallback(
    (action: () => Promise<string>) =>
      track(async () => {
        try {
          setMessage(await action())
          return true
        } catch (error) {
          setMessage(reason(error))
          return false
        }
      }),
    [track],
  )

  const change = useCallback((apply: Change) => {
    unlisted.current?.push(apply)
    setPresets((current) => apply(current ?? []))
  }, [])

  const load = useCallback(() => {
    if (listed.current) return
    listed.current = true
    const failure = listError.current
    if (failure) setMessage((current) => (current === failure ? null : current))
    listError.current = null
    const changes: Change[] = []
    unlisted.current = changes
    void track(async () => {
      try {
        const list = await listPresets()
        setPresets(changes.reduce((result, apply) => apply(result), list))
      } catch (error) {
        listed.current = false // let the next open try again
        listError.current = reason(error)
        setMessage(listError.current)
      } finally {
        unlisted.current = null
      }
    })
  }, [track])

  const save = useCallback(
    (name: string, settings: PresetSettings) =>
      run(async () => {
        const saved = await savePreset({ data: { name, settings } })
        const replaced = presets?.some((p) => p.id === saved.id) ?? false
        change((list) => [...list.filter((p) => p.id !== saved.id), saved].sort(byName))
        setCurrent(saved)
        return `${replaced ? 'Updated' : 'Saved'} “${saved.name}”`
      }),
    [run, change, presets],
  )

  const remove = useCallback(
    async (preset: Preset) => {
      await run(async () => {
        await deletePreset({ data: { id: preset.id } })
        change((list) => list.filter((p) => p.id !== preset.id))
        setCurrent((chosen) => (chosen?.id === preset.id ? null : chosen))
        return `Deleted “${preset.name}”`
      })
    },
    [run, change],
  )

  return {
    presets,
    current,
    choose: setCurrent,
    pending: requests > 0,
    message,
    load,
    save,
    remove,
    announce: setMessage,
  }
}
