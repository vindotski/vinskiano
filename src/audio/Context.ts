/** An AudioContext with a master gain node that everything routes through. */
export type SynthContext = AudioContext & { master: GainNode }

function make(): SynthContext {
  const audioContext = new AudioContext()

  const master = audioContext.createGain()
  master.connect(audioContext.destination)

  return Object.assign(audioContext, { master })
}

export default { make }
