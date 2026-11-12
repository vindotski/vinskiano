import { useEffect, useRef } from 'react'
import type { Oscilloscope as AudioOscilloscope } from '@/audio'
import { cn } from '@/lib/utils'

interface OscilloscopeProps {
  /** The output analyser; null until the audio engine exists (then the canvas stays empty). */
  oscilloscope: AudioOscilloscope | null
  className?: string
}

/** Below this, a sample counts as silence. */
const SILENT = 1e-4

/**
 * Draws the master output. Colors come from the canvas's CSS (theme tokens), so dark mode just
 * works. Cheap when nothing happens: it reads its size and colors only when they change, draws
 * silence once rather than every frame, and stops while the canvas is off screen.
 */
const Oscilloscope = ({ oscilloscope, className }: OscilloscopeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!oscilloscope || !canvas || !context) {
      return
    }

    let ratio = 1
    let colors = { background: '', line: '' }
    /** Whether the last frame drawn was silence (then the next silent one needn't be drawn). */
    let drewSilence = false

    // Match the drawing buffer to the displayed size for a crisp line.
    const resize = () => {
      ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(canvas.clientWidth * ratio)
      canvas.height = Math.round(canvas.clientHeight * ratio)
      drewSilence = false
    }
    const readColors = () => {
      const style = getComputedStyle(canvas)
      colors = { background: style.backgroundColor, line: style.color }
      drewSilence = false
    }
    resize()
    readColors()

    const draw = () => {
      const samples = oscilloscope.update()
      const silent = samples.every((sample) => Math.abs(sample) < SILENT)
      if (silent && drewSilence) return
      drewSilence = silent

      const { width, height } = canvas
      context.fillStyle = colors.background
      context.fillRect(0, 0, width, height)
      context.lineWidth = 2 * ratio
      context.lineJoin = 'round'
      context.strokeStyle = colors.line
      context.beginPath()
      // Samples are -1..1; 0 (silence) is the middle line, positive is up.
      const step = width / (samples.length - 1)
      for (let i = 0; i < samples.length; i++) {
        const y = ((1 - (samples[i] ?? 0)) * height) / 2
        if (i === 0) context.moveTo(0, y)
        else context.lineTo(i * step, y)
      }
      context.stroke()
    }

    // Runs only while the canvas is on screen.
    let frame = 0
    const loop = () => {
      draw()
      frame = requestAnimationFrame(loop)
    }
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry?.isIntersecting) frame = requestAnimationFrame(loop)
    })
    visibility.observe(canvas)

    const size = new ResizeObserver(resize)
    size.observe(canvas)
    // The theme tokens change with the system's light or dark mode.
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', readColors)

    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      size.disconnect()
      scheme.removeEventListener('change', readColors)
    }
  }, [oscilloscope])

  // `oscilloscope` is a hook for tests.
  return (
    <canvas
      ref={canvasRef}
      className={cn('oscilloscope rounded-xl bg-muted text-primary', className)}
      aria-label="Oscilloscope showing the master output"
      role="img"
    />
  )
}

export default Oscilloscope
