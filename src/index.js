import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import App from './App';
import './App.css'
import { Context } from './audio'
import { Note, ScaleBuilder, ChromaticScaleStrategy } from './music'
import './utils/disable-context-menu'

const updateViewportVars = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

window.addEventListener('resize', () => {
  updateViewportVars()
})

const context = Context.make()
context.master.gain.value = 0.7

const scaleOptions = {
  rootNote: new Note({ name: 'C', octave: 4 }),
  strategy: new ChromaticScaleStrategy()
}
const scale = new ScaleBuilder(scaleOptions).build()
scale.push(new Note({
  name: scaleOptions.rootNote.name,
  octave: scaleOptions.rootNote.octave + 1
}))

ReactDOM.render(
  <React.StrictMode>
    <App
      context={context}
      scale={scale}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
