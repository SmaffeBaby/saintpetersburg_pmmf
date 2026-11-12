import { requireAdminSession } from '../../../utils/adminAuth'
import { saveProgramPdf } from '../../../utils/programStorage'

export default defineEventHandler(async event => {
  requireAdminSession(event)
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length !== 1 || parts[0]?.name !== 'file' || !parts[0].filename) {
    throw createError({ statusCode: 400, statusMessage: 'Provide one PDF in the file field' })
  }
  const result = saveProgramPdf(parts[0].data)
  setResponseStatus(event, 201)
  return result
})
