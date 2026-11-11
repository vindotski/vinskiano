import { createFileRoute, redirect } from '@tanstack/react-router'

/** The synth moved under /app; the old oscillators page is now oscillator 1's page there. */
export const Route = createFileRoute('/oscillators')({
  beforeLoad: () => {
    throw redirect({ to: '/app/oscillators/$id', params: { id: '1' }, statusCode: 301 })
  },
})
