import { describe, expect, test } from 'vitest'
import { FACTORY_SOUNDS } from './factory'
import { parsePresetName, parsePresetSettings } from './preset'

describe('factory sounds', () => {
  test.each(FACTORY_SOUNDS.map((sound) => [sound.name, sound] as const))(
    '%s is a valid preset',
    (_, sound) => {
      expect(parsePresetName(sound.name)).toBe(sound.name)
      expect(parsePresetSettings(sound.settings)).toEqual(sound.settings)
    },
  )

  test('have different names', () => {
    const names = FACTORY_SOUNDS.map((sound) => sound.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
