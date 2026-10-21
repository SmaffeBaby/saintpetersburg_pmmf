import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { z } from 'zod'

const legacySubmission = z.object({
  id: z.string().min(1), createdAt: z.iso.datetime(),
  lastName: z.string(), firstName: z.string(), middleName: z.string(),
  birthDate: z.string(), region: z.string(), email: z.string(), phone: z.string()
})

export const openDatabase = (path: string) => {
  const absolutePath = resolve(path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  const db = new DatabaseSync(absolutePath)
  try {
    db.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY) STRICT;
      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY, createdAt TEXT NOT NULL,
        lastName TEXT NOT NULL, firstName TEXT NOT NULL, middleName TEXT NOT NULL,
        birthDate TEXT NOT NULL, region TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS registrations_created_at ON registrations(createdAt DESC);
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY, mimeType TEXT NOT NULL, data BLOB NOT NULL, createdAt TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS site_content (
        section TEXT PRIMARY KEY, content TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1, updatedAt TEXT NOT NULL
      ) STRICT;
    `)
    // Import once, transactionally. Keep the source file intact for recovery.
    db.exec('BEGIN IMMEDIATE')
    try {
      if (!db.prepare('SELECT name FROM migrations WHERE name = ?').get('registrations-json-v1')) {
        let raw: string | undefined
        try { raw = readFileSync(join(dirname(absolutePath), 'registrations.json'), 'utf8') }
        catch (error: any) { if (error.code !== 'ENOENT') throw error }
        if (raw !== undefined) {
          const entries = z.array(legacySubmission).parse(JSON.parse(raw))
          const insert = db.prepare('INSERT INTO registrations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          for (const row of entries) insert.run(row.id, row.createdAt, row.lastName, row.firstName, row.middleName, row.birthDate, row.region, row.email, row.phone)
        }
        db.prepare('INSERT INTO migrations VALUES (?)').run('registrations-json-v1')
      }
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
    return db
  } catch (error) { db.close(); throw error }
}
