import { requireAdminSession } from '../../utils/adminAuth'
import { getTelegramSettings } from '../../utils/telegramSettings'
export default defineEventHandler(event => {
  requireAdminSession(event)
  return getTelegramSettings().read()
})
