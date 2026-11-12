const SiteFooter = () => (
  <footer className="border-t">
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
      <p>
        © 2020–2026{' '}
        <a
          className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          href="https://www.vin.ski"
        >
          Ivan Vinski
        </a>
        . Apache-2.0.
      </p>
      <a
        className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
        href="https://github.com/vindotski/vinskiano"
      >
        Source on GitHub
      </a>
    </div>
  </footer>
)

export default SiteFooter
