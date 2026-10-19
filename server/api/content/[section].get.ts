import { isContentSection } from '../../../shared/config/content'
import { getPublicContent } from '../../utils/siteContent'
export default defineEventHandler(async event => {
  const section = getRouterParam(event, 'section') || ''
  if (!isContentSection(section)) throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  setHeader(event, 'Cache-Control', 'no-cache')
  return getPublicContent(section)
})
