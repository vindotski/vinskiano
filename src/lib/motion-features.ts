import { domAnimation } from 'motion/react'

// Motion's animation features, loaded lazily by <LazyMotion> in the app layout so they stay
// out of the initial bundle. domAnimation covers `animate`/transitions; switch to domMax only
// if shared layout animations (layout, layoutId) are needed.
export default domAnimation
