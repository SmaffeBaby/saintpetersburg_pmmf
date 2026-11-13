import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';

// Read the saved admin selection on each request so replacements take effect immediately.
export function readProgramPdf(path, locale) {
  if (!existsSync(path)) return null;
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    db.exec('PRAGMA busy_timeout=5000');
    const row = db.prepare("SELECT content FROM site_content WHERE section='program'").get();
    const href = row && JSON.parse(row.content).button?.href?.[locale];
    const id = typeof href === 'string' && /^\/api\/program-files\/([0-9a-f-]{36})$/.exec(href)?.[1];
    if (!id) return null;
    const pdf = db.prepare("SELECT data FROM media WHERE id=? AND mimeType='application/pdf'").get(id);
    if (!pdf) return null;
    return new File([pdf.data], locale === 'en' ? 'SPIYF_Programme_EN.pdf' : 'ПММФ_Программа_RU.pdf', { type: 'application/pdf' });
  } finally {
    db.close();
  }
}
