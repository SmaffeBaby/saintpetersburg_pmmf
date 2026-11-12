import { requireAdminSession } from '../../../utils/adminAuth'
import { importSpeakers, maxSpeakersTransferBytes } from '../../../utils/speakersTransfer'

export default defineEventHandler(async event => {
  requireAdminSession(event)
  const raw = await readRawBody(event, 'utf8')
  if (!raw) throw createError({ statusCode: 400, statusMessage: 'Provide a speakers export file' })
  if (Buffer.byteLength(raw) > maxSpeakersTransferBytes) throw createError({ statusCode: 413, statusMessage: 'Import exceeds 300 MB' })
  let input: unknown
  try { input = JSON.parse(raw) }
  catch { throw createError({ statusCode: 400, statusMessage: 'Invalid JSON file' }) }
  return { content: importSpeakers(input) }
})
