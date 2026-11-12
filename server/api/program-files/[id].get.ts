import { getDatabase } from '../../utils/database'

export default defineEventHandler(event => {
  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'PDF not found' })
  const row = getDatabase().prepare("SELECT data FROM media WHERE id = ? AND mimeType = 'application/pdf'").get(id) as
    { data: Uint8Array } | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'PDF not found' })
  const filename = getQuery(event).lang === 'en' ? 'SPIYF_Programme_EN.pdf' : 'ПММФ_Программа.pdf'
  setHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Length': String(row.data.length),
    'Content-Disposition': `inline; filename="SPIYF_Programme.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'",
    'Cache-Control': 'public, max-age=31536000, immutable'
  })
  return Buffer.from(row.data)
})
