import { useEffect, useRef } from 'react'
import type { Oscilloscope as AudioOscilloscope } from '@/audio'
import { cn } from '@/lib/utils'

interface OscilloscopeProps {
  /** The output analyser; null until the audio engine exists (then the canvas stays empty). */
  oscilloscope: AudioOscilloscope | null
  className?: string
}

/** Draws the master output. Colors come from the canvas's CSS (theme tokens), so dark mode just works. */
const Oscilloscope = ({ oscilloscope, className }: OscilloscopeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!oscilloscope || !canvas || !context) {
      return
    }

    let frame = 0
    const draw = () => {
      // Match the drawing buffer to the displayed size for a crisp line.
      const ratio = window.devicePixelRatio || 1
      const width = Math.round(canvas.clientWidth * ratio)
      const height = Math.round(canvas.clientHeight * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const style = getComputedStyle(canvas)
      const samples = oscilloscope.update()

      context.fillStyle = style.backgroundColor
      context.fillRect(0, 0, width, height)

      context.lineWidth = 2 * ratio
      context.lineJoin = 'round'
      context.strokeStyle = style.color
      context.beginPath()

      // Samples are -1..1; 0 (silence) is the middle line, positive is up.
      const step = width / (samples.length - 1)
      for (let i = 0; i < samples.length; i++) {
        const y = ((1 - (samples[i] ?? 0)) * height) / 2
        if (i === 0) context.moveTo(0, y)
        else context.lineTo(i * step, y)
      }
      context.stroke()

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
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
