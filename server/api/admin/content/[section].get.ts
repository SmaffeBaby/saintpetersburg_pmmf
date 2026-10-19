import { isContentSection } from '../../../../shared/config/content'
import { requireAdminSession } from '../../../utils/adminAuth'
import { getContentRecord } from '../../../utils/siteContent'
export default defineEventHandler(event => {
  requireAdminSession(event)
  const section = getRouterParam(event, 'section') || ''
  if (!isContentSection(section)) throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  const row = getContentRecord(section)
  return { content: JSON.parse(row.content), revision: row.revision, updatedAt: row.updatedAt }
})
