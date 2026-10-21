import { requireAdminSession } from '../../../utils/adminAuth'
import { saveImage } from '../../../utils/mediaStorage'

export default defineEventHandler(async event => {
  requireAdminSession(event)
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length !== 1 || parts[0]?.name !== 'file' || !parts[0].filename) {
    throw createError({ statusCode: 400, statusMessage: 'Provide one image in the file field' })
  }
  setResponseStatus(event, 201)
  return saveImage(parts[0].data)
})
