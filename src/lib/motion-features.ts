import { domMax } from 'motion/react'

// Motion's animation features, loaded lazily by <LazyMotion> in the root layout so they stay
// out of the initial bundle. domMax (not the smaller domAnimation) because shared layout
// animations (layoutId) need it.
export default domMax
