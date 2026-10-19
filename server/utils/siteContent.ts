import defaults from '../../shared/config/content-defaults.json'
import { contentSchemas, type ContentSection } from '../../shared/config/content'
import { getDatabase } from './database'
import { cachedContent } from './contentCache'

const initialized = new Set<ContentSection>()
const ensureContent = (section: ContentSection) => {
  const db = getDatabase()
  if (!initialized.has(section)) {
    db.prepare('INSERT OR IGNORE INTO site_content(section, content, updatedAt) VALUES (?, ?, ?)')
      .run(section, JSON.stringify(contentSchemas[section].parse(defaults[section])), new Date().toISOString())
    initialized.add(section)
  }
  return db
}
export const getContentRecord = (section: ContentSection) => {
  return ensureContent(section).prepare('SELECT * FROM site_content WHERE section = ?').get(section) as {
    section: string; content: string; revision: number; updatedAt: string
  }
}
export const getPublicContent = async (section: ContentSection) => {
  const db = ensureContent(section)
  const row = db.prepare('SELECT revision, updatedAt FROM site_content WHERE section = ?').get(section)!
  return cachedContent(`saint-mmf:content:${section}:${row.revision}:${row.updatedAt}`, () => JSON.parse(getContentRecord(section).content))
}
export const updateContent = (section: ContentSection, content: unknown, revision: number) => {
  const result = contentSchemas[section].safeParse(content)
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'Invalid content', data: result.error.flatten() })
  const changed = getDatabase().prepare('UPDATE site_content SET content = ?, revision = revision + 1, updatedAt = ? WHERE section = ? AND revision = ?')
    .run(JSON.stringify(result.data), new Date().toISOString(), section, revision)
  if (!changed.changes) throw createError({ statusCode: 409, statusMessage: 'Content changed. Reload before saving.' })
  const row = getContentRecord(section)
  return { content: JSON.parse(row.content), revision: row.revision, updatedAt: row.updatedAt }
}
