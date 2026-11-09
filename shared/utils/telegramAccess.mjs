import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function validateAdminIds(value) {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid administrator list');
  const ids = value.map(id => {
    if (typeof id !== 'string' || !/^[1-9]\d{0,15}$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('Invalid Telegram ID');
    return String(Number(id));
  });
  return [...new Set(ids)];
}

export function openTelegramAccess(path, bootstrapIds) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS telegram_access (id INTEGER PRIMARY KEY CHECK(id=1), admins TEXT NOT NULL, revision INTEGER NOT NULL);');
  if (bootstrapIds !== undefined) {
    const ids = validateAdminIds(bootstrapIds.map(String));
    db.prepare('INSERT OR IGNORE INTO telegram_access VALUES (1,?,1)').run(JSON.stringify(ids));
  }
  return {
    db,
    read() {
      const row = db.prepare('SELECT admins,revision FROM telegram_access WHERE id=1').get();
      return row ? { adminIds: JSON.parse(row.admins), revision: row.revision } : { adminIds: [], revision: 0 };
    },
    write(adminIds, revision) {
      const ids = validateAdminIds(adminIds);
      if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Invalid revision');
      const result = revision === 0
        ? db.prepare('INSERT OR IGNORE INTO telegram_access VALUES (1,?,1)').run(JSON.stringify(ids))
        : db.prepare('UPDATE telegram_access SET admins=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(ids), revision);
      if (!result.changes) throw Object.assign(new Error('Settings changed. Reload before saving.'), { conflict: true });
      return { adminIds: ids, revision: revision + 1 };
    }
  };
}
