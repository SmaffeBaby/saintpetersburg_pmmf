import defaults from '../../shared/config/content-defaults.json'
import legalDefaults from '../../shared/config/legal-defaults.json'
import { contentSchemas, type ContentSection } from '../../shared/config/content'
import { getDatabase } from './database'
import { cachedContent } from './contentCache'

const initialized = new Set<ContentSection>()
const sectionDefaults = { ...defaults, ...legalDefaults }
const ensureContent = (section: ContentSection) => {
  const db = getDatabase()
  if (!initialized.has(section)) {
    db.prepare('INSERT OR IGNORE INTO site_content(section, content, updatedAt) VALUES (?, ?, ?)')
      .run(section, JSON.stringify(contentSchemas[section].parse(sectionDefaults[section])), new Date().toISOString())
    if (section === 'header') {
      const row = db.prepare('SELECT content FROM site_content WHERE section = ?').get(section) as { content: string }
      const stored = JSON.parse(row.content)
      // Apply the new navigation once; later admin edits must survive restarts.
      const navigationMigration = 'header-hall-plan-navigation-v1'
      db.exec('BEGIN IMMEDIATE')
      try {
        if (!db.prepare('SELECT name FROM migrations WHERE name = ?').get(navigationMigration)) {
          const topics = stored.nav.find((item: any) => item.href === '#topics' || item.label.ru === 'Тематики')
          if (topics) topics.href = ''
          else stored.nav.unshift(defaults.header.nav.find(item => item.label.ru === 'Тематики'))
          if (!stored.nav.some((item: any) => item.href === '#hall-plan')) {
            const scheduleIndex = stored.nav.findIndex((item: any) => item.href === '#schedule')
            stored.nav.splice(scheduleIndex < 0 ? 1 : scheduleIndex + 1, 0, defaults.header.nav.find(item => item.href === '#hall-plan'))
          }
          db.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updatedAt = ? WHERE section = ?')
            .run(JSON.stringify(contentSchemas.header.parse(stored)), new Date().toISOString(), section)
          db.prepare('INSERT INTO migrations VALUES (?)').run(navigationMigration)
        }
        db.exec('COMMIT')
      } catch (error) { db.exec('ROLLBACK'); throw error }
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
    if (section === 'privacy-policy' || section === 'footer') {
      const row = db.prepare('SELECT content FROM site_content WHERE section = ?').get(section) as { content: string }
      const stored = JSON.parse(row.content)
      const label = section === 'privacy-policy' ? stored.title : stored.privacy.label
      let renamed = false
      if (label.ru === 'Политика конфиденциальности') {
        label.ru = legalDefaults['privacy-policy'].title.ru
        renamed = true
      }
      if (/^privacy policy$/i.test(label.en)) {
        label.en = legalDefaults['privacy-policy'].title.en
        renamed = true
      }
      if (renamed) {
        db.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updatedAt = ? WHERE section = ?')
          .run(JSON.stringify(contentSchemas[section].parse(stored)), new Date().toISOString(), section)
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
  return cachedContent(`saint-mmf:content:v8:${section}:${row.revision}:${row.updatedAt}`, () => JSON.parse(getContentRecord(section).content))
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
