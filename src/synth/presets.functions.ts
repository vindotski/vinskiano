import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { database } from '../server/backend.server'
import { currentGuestId, guestId } from '../server/guest.server'
import * as store from '../server/presets.server'
import { parsePresetName, parsePresetSettings } from './preset'

/*
 * The presets API. Server functions: the browser gets RPC stubs, the bodies run on the server
 * (and the server-only imports above go with them). Presets belong to the visitor's guest account.
 * Start's CSRF middleware only lets same-origin pages call these.
 */

/** The visitor's presets; none for a visitor who never saved one. */
export const listPresets = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await currentGuestId()
  return userId ? store.listPresets(await database(), userId) : []
})

export const savePreset = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const input = typeof data === 'object' && data !== null ? data : {}
    return {
      name: parsePresetName('name' in input ? input.name : undefined),
      settings: parsePresetSettings('settings' in input ? input.settings : undefined),
    }
  })
  .handler(async ({ data }) => {
    const db = await database()
    try {
      return await store.savePreset(db, await guestId(), data.name, data.settings)
    } catch (error) {
      if (error instanceof store.PresetLimitError) setResponseStatus(409)
      throw error
    }
  })

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const deletePreset = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const id = typeof data === 'object' && data !== null && 'id' in data ? data.id : undefined
    if (typeof id !== 'string' || !UUID.test(id)) throw new Error('Invalid preset id')
    return { id }
  })
  .handler(async ({ data }) => {
    // Deleting needs no new guest: a visitor without one has nothing to delete.
    const userId = await currentGuestId()
    if (userId) await store.deletePreset(await database(), userId, data.id)
  })
