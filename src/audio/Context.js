function make() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  const master = audioContext.createGain()
  master.connect(audioContext.destination)
  audioContext.master = master

  return audioContext
}

export default { make }
