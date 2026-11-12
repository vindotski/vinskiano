import { preferPlayback } from './session'

/**
 * An AudioContext with a master gain that everything routes through, and the output after it:
 * a limiter, so many notes at once (ten fingers) don't clip.
 */
export type SynthContext = AudioContext & { master: GainNode; output: AudioNode }

function make(): SynthContext {
  // Before the context exists, so iPhones play it even with the silent switch on.
  preferPlayback()
  const audioContext = new AudioContext()

  const master = audioContext.createGain()
  const output = audioContext.createDynamicsCompressor()
  // A gentle limiter: transparent until the sum nears full scale, then held just under it.
  output.threshold.value = -3
  output.knee.value = 0
  output.ratio.value = 20
  output.attack.value = 0.002
  output.release.value = 0.1
  master.connect(output)
  output.connect(audioContext.destination)

  return Object.assign(audioContext, { master, output })
}

export default { make }
