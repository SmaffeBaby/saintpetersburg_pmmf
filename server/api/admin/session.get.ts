import { requireAdminSession } from '../../utils/adminAuth'
export default defineEventHandler(event => {
  requireAdminSession(event)
  return { authenticated: true }
})
