import type { DatabaseSync } from 'node:sqlite'
export function validateAdminIds(value: unknown): string[]
export function openTelegramAccess(path: string, bootstrapIds?: number[]): {
  db: DatabaseSync
  read(): { adminIds: string[]; revision: number }
  write(adminIds: unknown, revision: number): { adminIds: string[]; revision: number }
}
