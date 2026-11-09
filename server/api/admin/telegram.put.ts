import { requireAdminSession } from '../../utils/adminAuth'
import { getTelegramAccess } from '../../utils/telegramAccess'
import { validateAdminIds } from '../../../shared/utils/telegramAccess.mjs'
export default defineEventHandler(async event => {
  requireAdminSession(event)
  const body = await readBody(event)
  let ids: string[]
  try {
    ids = validateAdminIds(body?.adminIds)
    if (!Number.isSafeInteger(body?.revision) || body.revision < 0) throw new Error()
  } catch { throw createError({ statusCode: 400, statusMessage: 'Invalid Telegram IDs or revision' }) }
  try { return getTelegramAccess().write(ids, body.revision) }
  catch (error) {
    if ((error as { conflict?: boolean }).conflict) throw createError({ statusCode: 409, statusMessage: 'Settings changed. Reload before saving.' })
    throw error
  }
})
