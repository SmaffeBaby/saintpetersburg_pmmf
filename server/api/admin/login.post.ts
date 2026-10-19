import { timingSafeEqual } from 'node:crypto'
import { createAdminSession } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ password?: unknown }>(event)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!config.adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'Admin password is not configured' })
  }

  if (!password || Buffer.byteLength(password) !== Buffer.byteLength(config.adminPassword) || !timingSafeEqual(Buffer.from(password), Buffer.from(config.adminPassword))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  createAdminSession(event)

  return { ok: true }
})
