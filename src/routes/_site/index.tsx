import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button-variants'

export const Route = createFileRoute('/_site/')({
  component: Home,
})

/** Temporary home page; the real one (hero, how it works) replaces it. */
function Home() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Vinskiano</h1>
      <p className="text-lg text-muted-foreground">A subtractive synthesizer in your browser.</p>
      <Link to="/app" className={buttonVariants({ size: 'lg' })}>
        Open the synth
      </Link>
    </section>
  )
}
