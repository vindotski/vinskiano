import { cva } from 'class-variance-authority'

// Split out of button.tsx so plain links (e.g. the 404 page) can look like buttons without
// pulling React Aria's Button into the main bundle.
//
// The look is Spotstrap's `btn` (styles.css sets it as a pill): it reads `data-pressed` and
// `data-focus-visible` from React Aria, and keeps a 44 × 44 hit area at every size.
const buttonStyles = cva('btn', {
  variants: {
    variant: {
      default: '',
      outline: 'btn-outline',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      destructive: 'btn-destructive',
      link: 'btn-link',
    },
    // Spotstrap has two heights: 44 px and a compact 36 px (still a 44 px hit area). The 48 px
    // `lg` buttons are 44 px now, like everything else.
    size: {
      default: '',
      sm: '',
      lg: '',
      xs: 'btn-compact',
      icon: 'btn-icon',
      'icon-sm': 'btn-icon',
      'icon-lg': 'btn-icon',
      'icon-xs': 'btn-compact btn-icon',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

/**
 * The button classes. No class merging (`cn`) needed: the variants only set Spotstrap's
 * variables, so nothing conflicts. Merging would pull its whole engine (about 11 kB gzip) into
 * the bundle every page loads, since the site's header and 404 page use these.
 */
export const buttonVariants = buttonStyles
