import Note from './Note'
import Scale from './Scale'
import { ScaleStrategy } from './ScaleStrategy'

class ScaleBuilder {
  constructor (options = {}) {
    this.rootNote = options.rootNote || new Note()
    this.strategy = options.strategy || new ScaleStrategy()
  }

  build () {
    if (!(this.rootNote instanceof Note)) {
      throw new Error('ScaleBuilder.rootNote must be an instance of Note class')
    } else if (!(this.strategy instanceof ScaleStrategy)) {
      throw new Error('ScaleBuilder.strategy')
    }

    const notes = this.strategy.generate(this.rootNote);
    const scale = new Scale({ rootNote: this.rootNote });
    notes.forEach(note => { scale.push(note); });
    return scale;
  }
}

export default ScaleBuilder
