import { getDatabase } from '../../utils/database'

export default defineEventHandler(event => {
  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  const row = getDatabase().prepare('SELECT mimeType, data FROM media WHERE id = ?').get(id) as
    { mimeType: string; data: Uint8Array } | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  setHeaders(event, {
    'Content-Type': row.mimeType,
    'Content-Length': String(row.data.length),
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=31536000, immutable'
  })
  return Buffer.from(row.data)
})
