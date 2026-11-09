import { openTelegramSettings } from '../../shared/utils/telegramSettings.mjs'
let store: ReturnType<typeof openTelegramSettings> | undefined
export const getTelegramSettings = () => store ||= openTelegramSettings(useRuntimeConfig().telegramAccessPath)
