import { describe, expect, test } from 'vitest'
import { mixesFromLevels, mixLevels } from './mix'

const levels = (mix2: number, mix3: number) =>
  mixLevels([{ id: 1 }, { id: 2, mix: mix2 }, { id: 3, mix: mix3 }])

describe('mixLevels (3x Osc’s mix: the levels always add up to 100%)', () => {
  test('with both mixes at zero, oscillator 1 is all you hear', () => {
    expect(levels(0, 0)).toEqual([1, 0, 0])
  })

  test('oscillator 2’s mix takes its share from oscillator 1', () => {
    expect(levels(0.5, 0)).toEqual([0.5, 0.5, 0])
    expect(levels(1, 0)).toEqual([0, 1, 0])
  })

  test('oscillator 3’s mix takes its share from 1 and 2 together, keeping their ratio', () => {
    expect(levels(0.5, 0.5)).toEqual([0.25, 0.25, 0.5])
    expect(levels(0.25, 1)).toEqual([0, 0, 1])
  })

  test('2 at 50% and 3 at a third is an equal mix (the manual’s example)', () => {
    const [one = 0, two = 0, three = 0] = levels(0.5, 1 / 3)
    expect(one).toBeCloseTo(1 / 3)
    expect(two).toBeCloseTo(1 / 3)
    expect(three).toBeCloseTo(1 / 3)
  })

  test('the levels add up to one, whatever the mixes', () => {
    for (const mix2 of [0, 0.1, 0.37, 0.5, 0.9, 1]) {
      for (const mix3 of [0, 0.2, 0.5, 0.8, 1]) {
        const sum = levels(mix2, mix3).reduce((total, level) => total + level, 0)
        expect(sum).toBeCloseTo(1)
      }
    }
  })
})

describe('mixesFromLevels', () => {
  test('finds the mixes that give these levels', () => {
    const [mix2 = 0, mix3 = 0] = mixesFromLevels([1 / 3, 1 / 6, 1 / 2])
    expect(mix2).toBeCloseTo(1 / 3)
    expect(mix3).toBeCloseTo(1 / 2)
    expect(levels(mix2, mix3).map((l) => Number(l.toFixed(6)))).toEqual(
      [1 / 3, 1 / 6, 1 / 2].map((l) => Number(l.toFixed(6))),
    )
  })

  test('levels that don’t add up to one are taken as a balance', () => {
    expect(mixesFromLevels([0.5, 0.25, 0.75]).map((m) => Number(m.toFixed(6)))).toEqual([
      Number((1 / 3).toFixed(6)),
      0.5,
    ])
  })

  test('everything off, or all on the last one, gives sensible mixes', () => {
    expect(mixesFromLevels([0, 0, 0])).toEqual([0, 0])
    expect(mixesFromLevels([0, 0, 1])).toEqual([0, 1])
  })
})
