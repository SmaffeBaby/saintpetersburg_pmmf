import { requireAdminSession } from '../../utils/adminAuth'
import { getTelegramAccess } from '../../utils/telegramAccess'
export default defineEventHandler(event => {
  requireAdminSession(event)
  return getTelegramAccess().read()
})
