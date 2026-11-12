/** An oscillator's place in the mix: oscillator 1 has no mix of its own, the others do. */
interface Mixed {
  id: number
  /** 0..1; absent on the first oscillator, which gets whatever the others leave. */
  mix?: number | undefined
}

/**
 * The oscillators' levels from their mixes, the way FL Studio's 3x Osc does it: the levels always
 * add up to one, so the balance changes but the overall volume doesn't. Going from the last
 * oscillator back, each takes its mix's share of what is left; the first gets the rest. So
 * oscillator 2's mix takes from 1, and oscillator 3's from 1 and 2 together (keeping their
 * ratio): 2 at 50% and 3 at a third is an equal mix of all three.
 */
export function mixLevels(oscillators: readonly Mixed[]): number[] {
  const levels = oscillators.map(() => 0)
  let left = 1
  for (let index = oscillators.length - 1; index > 0; index--) {
    const share = left * (oscillators[index]?.mix ?? 0)
    levels[index] = share
    left -= share
  }
  levels[0] = left
  return levels
}

/**
 * The mixes (of every oscillator but the first) that give these levels, taken as a balance
 * (they needn't add up to one). For reading presets saved before the mix, with a volume each.
 */
export function mixesFromLevels(levels: readonly number[]): number[] {
  const total = levels.reduce((sum, level) => sum + level, 0)
  const mixes = levels.slice(1).map(() => 0)
  if (total <= 0) return mixes
  let left = 1
  for (let index = levels.length - 1; index > 0; index--) {
    const level = (levels[index] ?? 0) / total
    mixes[index - 1] = left > 0 ? Math.min(1, level / left) : 0
    left -= level
  }
  return mixes
}
