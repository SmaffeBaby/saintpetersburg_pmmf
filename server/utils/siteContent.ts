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
    if (section === 'header') {
      const row = db.prepare('SELECT content FROM site_content WHERE section = ?').get(section) as { content: string }
      const stored = JSON.parse(row.content)
      if (stored.logo.src === '/images/header-logo.svg' && stored.logo.alt.ru === 'Комитет по молодежной политике' && stored.logo.alt.en === 'Committee for Youth Policy') {
        stored.logo.alt = defaults.header.logo.alt
        db.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updatedAt = ? WHERE section = ?')
          .run(JSON.stringify(contentSchemas.header.parse(stored)), new Date().toISOString(), section)
      }
    }
    if (section === 'footer') {
      const row = db.prepare('SELECT content FROM site_content WHERE section = ?').get(section) as { content: string }
      const stored = JSON.parse(row.content)
      if (['email', 'address', 'contacts'].some(key => !Object.hasOwn(stored, key))) {
        const content = contentSchemas.footer.parse({ ...defaults.footer, ...stored })
        db.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updatedAt = ? WHERE section = ?')
          .run(JSON.stringify(content), new Date().toISOString(), section)
      }
    }
    initialized.add(section)
  }
  return db
}
export const getContentRecord = (section: ContentSection) => {
  const row = ensureContent(section).prepare('SELECT * FROM site_content WHERE section = ?').get(section) as {
    section: string; content: string; revision: number; updatedAt: string
  }
  return { ...row, content: JSON.stringify(contentSchemas[section].parse(JSON.parse(row.content))) }
}
export const getPublicContent = async (section: ContentSection) => {
  const db = ensureContent(section)
  const row = db.prepare('SELECT revision, updatedAt FROM site_content WHERE section = ?').get(section)!
  return cachedContent(`saint-mmf:content:v2:${section}:${row.revision}:${row.updatedAt}`, () => JSON.parse(getContentRecord(section).content))
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
