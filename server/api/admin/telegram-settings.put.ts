import { requireAdminSession } from '../../utils/adminAuth'
import { getTelegramSettings } from '../../utils/telegramSettings'
import { validateBotContent, validToken } from '../../../shared/utils/telegramSettings.mjs'
export default defineEventHandler(async event => {
  requireAdminSession(event)
  const body = await readBody(event)
  const store = getTelegramSettings()
  let content
  const token = body?.token
  try {
    content = validateBotContent(body?.content)
    if (!Number.isSafeInteger(body?.revision) || body.revision < 1 || (token !== undefined && !validToken(token))) throw new Error()
  } catch { throw createError({ statusCode: 400, statusMessage: 'Check both languages, placeholders, unique menu names and HTTPS links' }) }
  if (token !== undefined) {
    if (store.read().botId && token.split(':')[0] !== store.read().botId) throw createError({ statusCode: 400, statusMessage: 'Use a token for the same bot' })
    try {
      const result = await $fetch<{ ok: boolean; result?: { id: number } }>(`https://api.telegram.org/bot${token}/getMe`, { timeout: 10000, retry: 0 })
      if (!result.ok || String(result.result?.id) !== token.split(':')[0]) throw new Error()
    } catch { throw createError({ statusCode: 400, statusMessage: 'Token verification failed. Check the token and Telegram connectivity.' }) }
  }
  try { return store.write(content, body.revision, token) }
  catch (error) {
    if ((error as { conflict?: boolean }).conflict) throw createError({ statusCode: 409, statusMessage: 'Settings changed. Reload before saving.' })
    throw createError({ statusCode: 500, statusMessage: 'Could not save bot settings' })
  }
})
