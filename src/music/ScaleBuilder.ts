import Note from './Note'
import Scale from './Scale'
import { ScaleStrategy } from './ScaleStrategy'

export interface ScaleBuilderOptions {
  rootNote?: Note
  strategy?: ScaleStrategy
}

class ScaleBuilder {
  rootNote: Note
  strategy: ScaleStrategy

  constructor(options: ScaleBuilderOptions = {}) {
    this.rootNote = options.rootNote || new Note()
    this.strategy = options.strategy || new ScaleStrategy()
  }

  build(): Scale {
    if (!(this.rootNote instanceof Note)) {
      throw new Error('ScaleBuilder.rootNote must be an instance of Note class')
    } else if (!(this.strategy instanceof ScaleStrategy)) {
      throw new Error('ScaleBuilder.strategy')
    }

    const notes = this.strategy.generate(this.rootNote)
    const scale = new Scale({ rootNote: this.rootNote })
    for (const note of notes) {
      scale.push(note)
    }
    return scale
  }
}

export default ScaleBuilder
