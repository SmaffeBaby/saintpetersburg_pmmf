import { requireAdminSession } from '../../../utils/adminAuth'
import { deleteRegistrationSubmission } from '../../../utils/registrationStorage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')?.trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing registration id' })
  }

  const deleted = await deleteRegistrationSubmission(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  return { ok: true }
})
