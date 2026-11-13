import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import defaults from '../shared/config/content-defaults.json' with { type: 'json' };

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
    return new File([pdf.data], locale === 'en' ? 'SPIYF_Program_EN.pdf' : 'ПММФ_Программа_RU.pdf', { type: 'application/pdf' });
  } finally {
    db.close();
  }
}

// Both bot languages share the primary image saved for the website section.
export function readSitePhoto(path, section, publicPath = './public') {
  if (!['hall-plan', 'footer'].includes(section) || !existsSync(path)) return null;
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    db.exec('PRAGMA busy_timeout=5000');
    const row = db.prepare('SELECT content FROM site_content WHERE section=?').get(section);
    const image = (row ? JSON.parse(row.content).image : undefined) ?? defaults[section].image;
    const src = image?.src;
    if (!src) return null;
    const id = /^\/api\/media\/([0-9a-f-]{36})$/.exec(src)?.[1];
    let data, mimeType;
    if (id) {
      const media = db.prepare('SELECT data, mimeType FROM media WHERE id=?').get(id);
      if (!media) return null;
      ({ data, mimeType } = media);
    } else {
      const root = resolve(publicPath);
      const filePath = resolve(root, `.${src}`);
      if (!src.startsWith('/images/') || !filePath.startsWith(root + sep) || !existsSync(filePath)) return null;
      data = readFileSync(filePath);
      mimeType = data[0] === 255 && data[1] === 216 ? 'image/jpeg'
        : data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'image/png' : null;
    }
    if (!['image/jpeg', 'image/png'].includes(mimeType)) return null;
    return new File([data], `${section}.${mimeType === 'image/jpeg' ? 'jpg' : 'png'}`, { type: mimeType });
  } finally {
    db.close();
  }
}
