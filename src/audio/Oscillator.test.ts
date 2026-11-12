import { describe, expect, test } from 'vitest'
import Oscillator from './Oscillator'

/** Records what the oscillator schedules: just enough of the Web Audio API for one voice. */
function fakeContext() {
  const events: string[] = []
  const param = (name: string, value = 0) => ({
    value,
    setValueAtTime: (v: number, t: number) => events.push(`${name} = ${v} at ${t}`),
    setTargetAtTime: (v: number, t: number) => events.push(`${name} → ${v} from ${t}`),
    cancelScheduledValues: (t: number) => events.push(`${name} cancel from ${t}`),
  })
  let gains = 0
  const noteGains: { gain: { value: number } }[] = []
  const context = {
    currentTime: 10,
    createGain: () => {
      const name = gains++ === 0 ? 'oscillator gain' : 'note gain'
      // A real GainNode starts at 1, like this one.
      const node = {
        gain: param(name, 1),
        connect() {},
        disconnect: () => events.push(`${name} off`),
      }
      if (name === 'note gain') noteGains.push(node)
      return node
    },
    createOscillator: () => ({
      type: 'sine',
      detune: param('detune'),
      frequency: param('frequency'),
      onended: null as (() => void) | null,
      connect() {},
      disconnect: () => events.push('signal off'),
      start: (t?: number) => events.push(`start at ${t ?? 'now'}`),
      stop(this: { onended: (() => void) | null }, t: number) {
        events.push(`stop at ${t}`)
        this.onended?.()
      },
    }),
  }
  return { context: context as unknown as BaseAudioContext, events, noteGains }
}

describe('Oscillator', () => {
  test('a note fades in and out over a few milliseconds instead of clicking', () => {
    const { context, events } = fakeContext()
    const oscillator = new Oscillator({ context, destination: {} as AudioNode })
    const sound = oscillator.emit(440)
    sound.start()
    expect(events).toEqual(['note gain = 0 at 10', 'note gain → 1 from 10', 'start at now'])

    events.length = 0
    sound.stop()
    expect(events[0]).toBe('note gain → 0 from 10')
    // The signal stops once the fade has died away, then its nodes are let go.
    const stop = events.find((event) => event.startsWith('stop at'))
    expect(Number(stop?.split(' ').pop())).toBeGreaterThan(10.02)
    expect(events).toEqual(expect.arrayContaining(['signal off', 'note gain off']))
  })

  // BUG (Bugbot on #42): cancelling the scheduled values when a note was let go in the instant it
  // started also cancelled its fade-in, so the gain jumped to the node's own value (1) first.
  test('a note let go the instant it starts never jumps to full volume', () => {
    const { context, events, noteGains } = fakeContext()
    const sound = new Oscillator({ context, destination: {} as AudioNode }).emit(440)
    sound.start()
    sound.stop() // same currentTime: a very fast tap
    // Nothing scheduled is cancelled (the fade-out takes over from wherever the gain is), and
    // the gain's own value, which anything cancelled would fall back to, is silence.
    expect(events.some((event) => event.includes('cancel'))).toBe(false)
    expect(noteGains[0]?.gain.value).toBe(0)
  })

  test('stopping a note twice only stops it once', () => {
    const { context, events } = fakeContext()
    const sound = new Oscillator({ context, destination: {} as AudioNode }).emit(440)
    sound.start()
    sound.stop()
    const count = events.length
    sound.stop()
    expect(events).toHaveLength(count)
  })
})
