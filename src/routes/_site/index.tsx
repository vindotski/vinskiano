import { createFileRoute } from '@tanstack/react-router'
import screenshot from '@/assets/screenshots/app-light-1280.webp'
import Home from '../../pages/Home'

const SITE = 'https://vinskiano.app'
const TITLE = 'Vinskiano: a synth that plays in your browser'
const DESCRIPTION =
  'Three oscillators mixed like FL Studio’s 3x Osc, 88 keys, and your computer keyboard as a piano. Free, open source, no install.'

export const Route = createFileRoute('/_site/')({
  // What links to the home page show (chat apps, social sites) and its one canonical address.
  head: () => ({
    meta: [
      { title: TITLE },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE}/` },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:image', content: `${SITE}${screenshot}` },
      { property: 'og:image:width', content: '1280' },
      { property: 'og:image:height', content: '720' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: `${SITE}/` }],
  }),
  component: Home,
})
