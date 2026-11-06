import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App'
import { Context } from './audio'
import { ChromaticScaleStrategy, Note, ScaleBuilder } from './music'
import './utils/disable-context-menu'

const updateViewportVars = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

window.addEventListener('resize', () => {
  updateViewportVars()
})

updateViewportVars()

const context = Context.make()
context.master.gain.value = 0.5

const scaleOptions = {
  rootNote: new Note({ name: 'C', octave: 4 }),
  strategy: new ChromaticScaleStrategy(),
}
const scale = new ScaleBuilder(scaleOptions).build()
scale.push(
  new Note({
    name: scaleOptions.rootNote.name,
    octave: scaleOptions.rootNote.octave + 1,
  }),
)

const root = document.getElementById('root')
if (!root) {
  throw new Error('Missing #root element in index.html')
}

createRoot(root).render(
  <React.StrictMode>
    <App context={context} scale={scale} />
  </React.StrictMode>,
)
