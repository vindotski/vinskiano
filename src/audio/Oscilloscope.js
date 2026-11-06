class Oscilloscope {
  constructor(context, source) {
    const analyzer = context.createAnalyser()
    analyzer.fftSize = 2048
    source.connect(analyzer)

    this.analyzer = analyzer
    this.bufferLength = analyzer.frequencyBinCount
    this.buffer = new Uint8Array(this.bufferLength)
    this.graph = []
  }

  update() {
    this.analyzer.getByteTimeDomainData(this.buffer)
    this.graph = []

    for (let i = 0; i < this.bufferLength; i++) {
      this.graph.push(this.buffer[i] / 128.0)
    }

    return this.graph
  }
}

export default Oscilloscope
