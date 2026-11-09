import { openTelegramAccess } from '../../shared/utils/telegramAccess.mjs'
let store: ReturnType<typeof openTelegramAccess> | undefined
export const getTelegramAccess = () => store ||= openTelegramAccess(useRuntimeConfig().telegramAccessPath)
