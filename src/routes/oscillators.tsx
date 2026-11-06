import { createFileRoute, redirect } from '@tanstack/react-router'

/** The synth moved under /app; keep old links working. */
export const Route = createFileRoute('/oscillators')({
  beforeLoad: () => {
    throw redirect({ to: '/app/oscillators', statusCode: 301 })
  },
})
