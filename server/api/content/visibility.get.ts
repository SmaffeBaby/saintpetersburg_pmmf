import { contentSections, type SectionVisibility } from '../../../shared/config/content'
import { getContentRecord } from '../../utils/siteContent'

export default defineEventHandler(event => {
  setHeader(event, 'Cache-Control', 'no-cache')
  return Object.fromEntries(contentSections.map(({ id }) => [
    id, JSON.parse(getContentRecord(id).content).visible
  ])) as SectionVisibility
})
