/**
 * Counting the product loop's steps (docs/product.md, ADR 0028). Spotcraft's proxy adds Umami's
 * script to every page; this sends one event per step through it. Without Umami (locally, in
 * tests, after an opt-out, a blocked script) nothing happens.
 *
 * Event data never holds ids, preset names or settings: only which step, and where or how.
 */

/** How a note was played. */
export type PlayedBy = 'pointer' | 'touch' | 'keyboard'

/** What changed in the sound. */
export type ShapeControl = 'waveform' | 'pitch' | 'mix'

export type LoopEvent =
  | { name: 'start'; data: { from: 'new' | 'factory' | 'preset' | 'shared' } }
  | { name: 'play'; data: { where: 'app' | 'home'; by: PlayedBy } }
  | { name: 'shape'; data: { control: ShapeControl } }
  | { name: 'keep' }
  | { name: 'send'; data: { via: 'copy' | 'share-sheet' } }

declare global {
  interface Window {
    /** Umami's tracker, when Spotcraft's proxy added it to the page. */
    umami?: { track: (name: string, data?: Readonly<Record<string, string>>) => unknown }
  }
}

/**
 * Hands the event to Umami, if it's there. Never throws and is never waited on: counting must
 * not delay or break playing. Returns whether Umami took it.
 */
export function track(event: LoopEvent): boolean {
  if (typeof window === 'undefined') return false
  const umami = window.umami
  if (!umami) return false
  try {
    const sent = 'data' in event ? umami.track(event.name, event.data) : umami.track(event.name)
    // A failed send must not become an unhandled rejection.
    Promise.resolve(sent).catch(() => {})
    return true
  } catch {
    return false
  }
}

/** Keys of the events already counted on this page load. */
const counted = new Set<string>()

/**
 * Sends an event once per page load (per `key`, the event's name by default), so the numbers
 * count visitors who reached a step, not every note or knob turn. An event Umami didn't take
 * (its script not there yet) may be sent again later.
 */
export function trackOnce(event: LoopEvent, key: string = event.name): void {
  if (counted.has(key)) return
  if (track(event)) counted.add(key)
}
