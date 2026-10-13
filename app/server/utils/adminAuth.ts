import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { getCookie, getRequestProtocol, setCookie, createError, type H3Event } from 'h3'

const cookieName = 'saint_mmf_admin'
const ttlMs = 1000 * 60 * 60 * 8

const getSecret = () => {
  const config = useRuntimeConfig()
  return config.adminSessionSecret || config.adminPassword || randomBytes(32).toString('hex')
}

const sign = (value: string) => createHmac('sha256', getSecret()).update(value).digest('hex')

export const createAdminSession = (event: H3Event) => {
  const expiresAt = Date.now() + ttlMs
  const payload = String(expiresAt)
  const token = `${payload}.${sign(payload)}`
  const isHttps = getRequestProtocol(event, { xForwardedProto: true }) === 'https'

  setCookie(event, cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: Math.floor(ttlMs / 1000)
  })
}

export const requireAdminSession = (event: H3Event) => {
  const token = getCookie(event, cookieName)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const [payload, signature] = token.split('.')
  if (!payload || !signature || Number(payload) < Date.now()) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const expected = sign(payload)
  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
