import type { DatabaseSync } from 'node:sqlite'
import type { BotContent } from '../config/telegram-defaults.mjs'
export function validToken(token: unknown): boolean
export function validateBotContent(value: unknown): BotContent
export function openTelegramSettings(path: string): {
  db: DatabaseSync
  read(): { content: BotContent; revision: number; tokenConfigured: boolean; botId: string | null }
  token(): string | null
  bootstrap(token: string): void
  write(content: unknown, revision: number, token?: string): ReturnType<ReturnType<typeof openTelegramSettings>['read']>
}
