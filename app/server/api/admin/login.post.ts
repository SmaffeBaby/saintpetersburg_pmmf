import { createAdminSession } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { password } = await readBody<{ password?: string }>(event)

  if (!config.adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'Admin password is not configured' })
  }

  if (!password || password !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  createAdminSession(event)

  return { ok: true }
})
