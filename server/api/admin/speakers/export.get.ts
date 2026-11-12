import { requireAdminSession } from '../../../utils/adminAuth'
import { exportSpeakers } from '../../../utils/speakersTransfer'

export default defineEventHandler(async event => {
  requireAdminSession(event)
  const json = await exportSpeakers(async src => Buffer.from(await event.$fetch<ArrayBuffer>(src, { responseType: 'arrayBuffer' })))
  setHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="speakers-${new Date().toISOString().slice(0, 10)}.json"`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  })
  return json
})
