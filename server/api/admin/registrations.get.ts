import { requireAdminSession } from '../../utils/adminAuth'
import { listRegistrationSubmissions } from '../../utils/registrationStorage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  return {
    items: await listRegistrationSubmissions()
  }
})
