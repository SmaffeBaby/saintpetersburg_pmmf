import { deleteCookie } from 'h3'
import { requireAdminSession } from '../../utils/adminAuth'
export default defineEventHandler(event => {
  requireAdminSession(event)
  deleteCookie(event, 'saint_mmf_admin', { path: '/' })
  return { ok: true }
})
