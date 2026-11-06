class Oscilloscope {
  analyzer: AnalyserNode
  bufferLength: number
  buffer: Uint8Array<ArrayBuffer>
  /** Latest waveform, one value per sample, 1 = silence (0..2). */
  graph: number[]

  constructor(context: BaseAudioContext, source: AudioNode) {
    const analyzer = context.createAnalyser()
    analyzer.fftSize = 2048
    source.connect(analyzer)

    this.analyzer = analyzer
    this.bufferLength = analyzer.frequencyBinCount
    this.buffer = new Uint8Array(this.bufferLength)
    this.graph = []
  }

  update(): number[] {
    this.analyzer.getByteTimeDomainData(this.buffer)
    this.graph = Array.from(this.buffer, (sample) => sample / 128.0)
    return this.graph
  }
}

export default Oscilloscope
