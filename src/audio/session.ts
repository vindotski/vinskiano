/**
 * Ask the browser to treat the synth's sound as media playback, not as ambient sound.
 *
 * On iPhones, Web Audio counts as "ambient" by default, so the ring/silent switch mutes it:
 * the synth seems broken on a phone that's on silent. Safari's Audio Session API
 * (`navigator.audioSession`, Safari 16.4+) lets a page say it plays media, which the switch
 * doesn't mute. Other browsers don't have the API, so this does nothing there.
 *
 * Call it before creating the AudioContext. Returns whether the session was set.
 */
export function preferPlayback(nav: object = navigator): boolean {
  // Not in TypeScript's DOM types yet, so narrow step by step instead of casting.
  if (!('audioSession' in nav)) return false
  const session = nav.audioSession
  if (typeof session !== 'object' || session === null || !('type' in session)) return false
  session.type = 'playback'
  return true
}
