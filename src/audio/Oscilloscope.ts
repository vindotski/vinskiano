/** Reads what the output looks like, for drawing. */
class Oscilloscope {
  private readonly analyzer: AnalyserNode
  /** The latest waveform, -1..1, 0 = silence; reused on every read. */
  private readonly samples: Float32Array<ArrayBuffer>

  constructor(context: BaseAudioContext, source: AudioNode) {
    this.analyzer = context.createAnalyser()
    this.analyzer.fftSize = 2048
    source.connect(this.analyzer)
    this.samples = new Float32Array(this.analyzer.fftSize)
  }

  /** The latest waveform. The same array every time, overwritten: read it before the next call. */
  update(): Float32Array {
    this.analyzer.getFloatTimeDomainData(this.samples)
    return this.samples
  }
}

export default Oscilloscope
