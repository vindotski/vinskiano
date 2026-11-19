import { createFileRoute } from '@tanstack/react-router'
import screenshot from '@/assets/screenshots/app-light-1280.webp'
import Home from '../../pages/Home'

const SITE = 'https://vinskiano.app'
const TITLE = 'Vinskiano: pick a sound and make it yours'
const DESCRIPTION =
  'A free synth in your browser: start from a sound, play it on 88 keys or your computer keyboard, and shape it with three oscillators mixed like FL Studio’s 3x Osc.'

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
