import { createFileRoute, redirect } from '@tanstack/react-router'

/** The synth moved under /app; the old oscillators page is the app's Oscillators page now. */
export const Route = createFileRoute('/oscillators')({
  beforeLoad: () => {
    throw redirect({ to: '/app/oscillators', statusCode: 301 })
  },
})
