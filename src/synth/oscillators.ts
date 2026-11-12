/** The synth's three oscillators, by id. */
export const OSCILLATOR_IDS = [1, 2, 3] as const

export type OscillatorId = (typeof OSCILLATOR_IDS)[number]

/** An oscillator id from outside (a URL's `?osc=2` or `/oscillators/2`), or undefined if it isn't one. */
export function toOscillatorId(value: unknown): OscillatorId | undefined {
  const number = typeof value === 'string' && /^\d$/.test(value) ? Number(value) : value
  return OSCILLATOR_IDS.find((id) => id === number)
}
