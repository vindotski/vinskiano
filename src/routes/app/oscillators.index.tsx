import { createFileRoute, redirect } from '@tanstack/react-router'

/** /app/oscillators on its own: the first oscillator. */
export const Route = createFileRoute('/app/oscillators/')({
  beforeLoad: () => {
    throw redirect({ to: '/app/oscillators/$id', params: { id: '1' } })
  },
})
