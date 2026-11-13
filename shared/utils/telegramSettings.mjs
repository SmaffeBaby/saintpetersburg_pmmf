import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { openTelegramAccess } from './telegramAccess.mjs';
import { defaultBotContent, messageDefinitions } from '../config/telegram-defaults.mjs';

export const validToken = token => typeof token === 'string' && /^\d{5,16}:[A-Za-z0-9_-]{20,100}$/.test(token);
export function validateBotContent(value) {
  if (!value || !value.messages || !Array.isArray(value.pages) || value.pages.length > 30) throw new Error('Invalid content');
  const pair = (value, max) => {
    if (!value || ['ru', 'en'].some(lang => typeof value[lang] !== 'string' || !value[lang].trim() || value[lang].length > max)) throw new Error('Fill in both languages and check text lengths');
    return { ru: value.ru.trim(), en: value.en.trim() };
  };
  const messages = {};
  for (const def of messageDefinitions) {
    const max = def.button ? 64 : def.ru === 'Актуальная программа ПММФ' ? 1024 : ['report', 'delivered', 'failed', 'unknown', 'skipped', 'no_subscribers'].includes(def.id) ? 500 : 3500;
    const entry = pair(value.messages[def.id], max);
    const vars = text => [...text.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort().join(',');
    for (const lang of ['ru', 'en']) if (vars(entry[lang]) !== vars(def[lang])) throw new Error(`Keep the placeholders in ${def.label}`);
    messages[def.id] = entry;
  }
  const ids = new Set();
  const pages = value.pages.map(page => {
    if (!page || typeof page.id !== 'string' || !/^[a-zA-Z0-9_-]{1,48}$/.test(page.id) || ids.has(page.id) || !Array.isArray(page.links) || page.links.length > 30) throw new Error('Invalid menu section');
    ids.add(page.id);
    return { id: page.id, title: pair(page.title, 64), body: pair(page.body, 3500), links: page.links.map(link => {
      if (typeof link.url !== 'string' || link.url.length > 2048) throw new Error('Invalid link');
      let url;
      try { url = new URL(link.url); } catch { throw new Error('Invalid link'); }
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) throw new Error('Use HTTPS links without credentials');
      return { label: pair(link.label, 64), url: url.href };
    }) };
  });
  // Reply keyboard buttons must route unambiguously, including translated labels.
  const routes = new Map();
  const reserve = (label, action) => {
    if (label.startsWith('/') || (routes.has(label) && routes.get(label) !== action)) throw new Error('Menu button names must be unique and cannot start with /');
    routes.set(label, action);
  };
  const systemButtons = ['🗺 Схема зала', '🅿️ Парковка', '📄 Программа', '🔔 Подписаться', '🔕 Отписаться', '🌐 Язык / Language'];
  for (const def of messageDefinitions.filter(d => systemButtons.includes(d.ru))) {
    for (const label of [def.ru, def.en, messages[def.id].ru, messages[def.id].en]) reserve(label, def.id);
  }
  for (const page of pages) for (const label of [page.title.ru, page.title.en]) reserve(label, `page:${page.id}`);
  return { messages, pages };
}

export function openTelegramSettings(path) {
  const access = openTelegramAccess(path);
  const db = access.db;
  db.exec('CREATE TABLE IF NOT EXISTS telegram_settings (id INTEGER PRIMARY KEY CHECK(id=1), content TEXT NOT NULL, token TEXT, revision INTEGER NOT NULL);');
  db.prepare('INSERT OR IGNORE INTO telegram_settings VALUES (1,?,NULL,1)').run(JSON.stringify(defaultBotContent()));
  const keyPath = join(dirname(path), 'settings.key');
  const key = () => {
    try { writeFileSync(keyPath, randomBytes(32), { flag: 'wx', mode: 0o600 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    const bytes = readFileSync(keyPath);
    if (bytes.length !== 32) throw new Error('Invalid settings encryption key');
    return bytes;
  };
  const encrypt = token => {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key(), iv);
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
  };
  const row = () => db.prepare('SELECT * FROM telegram_settings WHERE id=1').get();
  return {
    db,
    read() {
      const r = row();
      const content = JSON.parse(r.content);
      content.messages = { ...defaultBotContent().messages, ...content.messages };
      return { content, revision: r.revision, tokenConfigured: Boolean(r.token), botId: this.token()?.split(':')[0] ?? null };
    },
    token() {
      const r = row();
      if (!r.token) return null;
      const bytes = Buffer.from(r.token, 'base64');
      const decipher = createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12));
      decipher.setAuthTag(bytes.subarray(12, 28));
      return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8');
    },
    bootstrap(token) { if (validToken(token)) db.prepare('UPDATE telegram_settings SET token=? WHERE id=1 AND token IS NULL').run(encrypt(token)); },
    write(content, revision, token) {
      const validated = validateBotContent(content);
      if (!Number.isSafeInteger(revision) || revision < 1 || (token !== undefined && !validToken(token))) throw new Error('Invalid settings');
      if (token && this.token() && token.split(':')[0] !== this.token().split(':')[0]) throw new Error('Use a new token for the same bot');
      const result = token === undefined
        ? db.prepare('UPDATE telegram_settings SET content=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(validated), revision)
        : db.prepare('UPDATE telegram_settings SET content=?,token=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(validated), encrypt(token), revision);
      if (!result.changes) throw Object.assign(new Error('Settings changed. Reload before saving.'), { conflict: true });
      return this.read();
    }
  };
}
