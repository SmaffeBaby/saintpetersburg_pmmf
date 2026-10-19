import { isContentSection } from '../../../../shared/config/content'
import { requireAdminSession } from '../../../utils/adminAuth'
import { updateContent } from '../../../utils/siteContent'
export default defineEventHandler(async event => {
  requireAdminSession(event)
  const section = getRouterParam(event, 'section') || ''
  if (!isContentSection(section)) throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  const body = await readBody(event)
  if (!Number.isSafeInteger(body?.revision) || body.revision < 1) throw createError({ statusCode: 400, statusMessage: 'Invalid revision' })
  return updateContent(section, body.content, body.revision)
})
