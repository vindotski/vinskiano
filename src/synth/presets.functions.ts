import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { database } from '../server/backend.server'
import { currentGuestId, guestId } from '../server/guest.server'
import * as store from '../server/presets.server'
import { badRequest, PublicError, toPublicError } from '../server/public-error'
import { parsePresetName, parsePresetSettings } from './preset'

/*
 * The presets API. Server functions: the browser gets RPC stubs, the bodies run on the server
 * (and the server-only imports above go with them). Presets belong to the visitor's guest account.
 * Start's CSRF middleware only lets same-origin pages call these.
 */

/**
 * Wraps each function (its validator too): errors meant for the visitor go out with their status;
 * anything else is logged and becomes a plain 500, so nothing about the server reaches the page.
 * (Start sends only an error's message, but a Postgres message can name an address or a
 * constraint. It answers an error thrown by a function with the response's status, not the
 * error's, hence setResponseStatus.)
 */
const publicErrors = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  try {
    return await next()
  } catch (caught) {
    const error = toPublicError(caught)
    setResponseStatus(error.status)
    throw error
  }
})

/** The visitor's presets; none for a visitor who never saved one. */
export const listPresets = createServerFn({ method: 'GET' })
  .middleware([publicErrors])
  .handler(async () => {
    const userId = await currentGuestId()
    return userId ? store.listPresets(await database(), userId) : []
  })

export const savePreset = createServerFn({ method: 'POST' })
  .middleware([publicErrors])
  .validator((data: unknown) => {
    const input = typeof data === 'object' && data !== null ? data : {}
    return badRequest(() => ({
      name: parsePresetName('name' in input ? input.name : undefined),
      settings: parsePresetSettings('settings' in input ? input.settings : undefined),
    }))
  })
  .handler(async ({ data }) =>
    store.savePreset(await database(), await guestId(), data.name, data.settings),
  )

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const deletePreset = createServerFn({ method: 'POST' })
  .middleware([publicErrors])
  .validator((data: unknown) => {
    const id = typeof data === 'object' && data !== null && 'id' in data ? data.id : undefined
    if (typeof id !== 'string' || !UUID.test(id)) throw new PublicError('Invalid preset id', 400)
    return { id }
  })
  .handler(async ({ data }) => {
    // Deleting needs no new guest: a visitor without one has nothing to delete.
    const userId = await currentGuestId()
    if (userId) await store.deletePreset(await database(), userId, data.id)
  })
