import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { defaultBotContent } from '../shared/config/telegram-defaults.mjs';
import { translate, localizeMarkup, russianMenuText, languagePrompt, participantMenu } from './i18n.mjs';

export const menu = { keyboard: [['📄 Программа', '🔗 Ресурсы ПММФ'], ['🤝 Партнёры'], ['🔔 Подписаться', '🔕 Отписаться'], ['🌐 Язык / Language']], resize_keyboard: true };
const buttons = rows => ({ inline_keyboard: rows.map(row => row.map(([text, callback_data]) => ({ text, callback_data }))) });
const adminMenu = buttons([[['✍️ Создать пост', 'new']], [['📅 Запланированные', 'queue']], [['📊 Статистика', 'stats']]]);
export function parseDate(text, now = Date.now()) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.exec(text);
  if (!m) return null;
  const [, d, mo, y, h, mi] = m;
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+03:00`);
  const local = new Date(date.getTime() + 3 * 3600000);
  if (!Number.isFinite(+date) || +date <= now || local.getUTCFullYear() !== +y || local.getUTCMonth() + 1 !== +mo || local.getUTCDate() !== +d || local.getUTCHours() !== +h || local.getUTCMinutes() !== +mi) return null;
  return +date;
}
export const formatDate = time => new Date(time).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

export function content(message) {
  if (message.media_group_id) return null;
  if (message.photo) return { method: 'sendPhoto', photo: message.photo.at(-1).file_id, caption: message.caption, caption_entities: message.caption_entities };
  if (message.video) return { method: 'sendVideo', video: message.video.file_id, caption: message.caption, caption_entities: message.caption_entities };
  if (message.text) return { method: 'sendMessage', text: message.text, entities: message.entities };
  return null;
}

export function createBot({ path = ':memory:', adminIds = [], isAdmin = id => adminIds.includes(id), api, getContent = defaultBotContent, getProgramPdf = () => null, now = Date.now }) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY, active INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS preferences (id INTEGER PRIMARY KEY, language TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, state TEXT NOT NULL, post INTEGER);
    CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, owner INTEGER NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', due INTEGER);
    CREATE TABLE IF NOT EXISTS deliveries (post INTEGER, chat INTEGER, status TEXT NOT NULL DEFAULT 'pending', next INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(post,chat));
    UPDATE deliveries SET status='unknown' WHERE status='sending';`);
  const get = (sql, ...args) => db.prepare(sql).get(...args);
  const all = (sql, ...args) => db.prepare(sql).all(...args);
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  const setting = key => get('SELECT value FROM settings WHERE key=?', key)?.value;
  const set = (key, value) => run('INSERT OR REPLACE INTO settings VALUES (?,?)', key, String(value));
  const language = id => get('SELECT language FROM preferences WHERE id=?', id)?.language ?? 'ru';
  const currentMenu = () => participantMenu(getContent());
  const markup = (value, id) => {
    const localized = localizeMarkup(value, language(id), getContent());
    if (value?.keyboard) return { ...localized, keyboard: value.keyboard.map(row => row.map(label => {
      const page = getContent().pages.find(page => page.title.ru === label);
      return page ? page.title[language(id)] : translate(label, language(id), getContent());
    })) };
    return localized;
  };
  const say = (id, text, reply_markup) => api('sendMessage', { chat_id: id, text: translate(text, language(id), getContent()), reply_markup: markup(reply_markup, id) });
  const send = (id, payload, reply_markup) => { const { method, ...data } = payload; return api(method, { ...data, chat_id: id, reply_markup: markup(reply_markup, id) }); };
  const session = (id, state, post = null) => run('INSERT OR REPLACE INTO sessions VALUES (?,?,?)', id, state, post);
  const clear = id => run('DELETE FROM sessions WHERE id=?', id);
  const draftButtons = id => buttons([[['👁 Предпросмотр', `preview:${id}`]], [['📤 Отправить сейчас', `confirm:${id}`], ['🕒 Запланировать', `schedule:${id}`]], [['🗑 Отменить пост', `cancel:${id}`]]]);

  async function handle(update) {
    const callback = update.callback_query;
    const m = update.message ?? callback?.message;
    const id = callback?.from.id ?? m?.from?.id;
    if (!m || m.chat.type !== 'private' || !id || m.chat.id !== id) return;
    if (callback) {
      await api('answerCallbackQuery', { callback_query_id: callback.id });
      const [action, raw] = callback.data.split(':');
      if (action === 'language' && ['ru', 'en'].includes(raw)) {
        run('INSERT OR REPLACE INTO preferences VALUES (?,?)', id, raw);
        clear(id);
        return say(id, 'Добро пожаловать в помощник ПММФ! Здесь будут программа, полезные ссылки и новости форума. Для получения новостей нажмите «Подписаться». Организаторы: /admin.', currentMenu());
      }
      if (!isAdmin(id)) return say(id, 'Доступ только для администраторов.');
      if (action === 'new') { session(id, 'post'); return say(id, 'Пришлите текст, одно фото или одно видео с подписью. Для отмены — /cancel.'); }
      if (action === 'pdf') { clear(id); return say(id, 'PDF программы загружаются на сайте: /admin?section=program. Сохраните отдельные файлы для RU и EN.'); }
      if (action === 'stats') return say(id, `Подписчиков: ${get('SELECT COUNT(*) AS n FROM subscribers WHERE active=1').n}`);
      if (action === 'queue') {
        const posts = all("SELECT * FROM posts WHERE status IN ('scheduled','queued') ORDER BY due LIMIT 30");
        if (!posts.length) return say(id, 'Запланированных постов нет.');
        for (const p of posts) await say(id, `Пост №${p.id} • ${formatDate(p.due)} МСК`, buttons([[['👁 Предпросмотр', `preview:${p.id}`], ['Отменить', `cancel:${p.id}`]]]));
        return;
      }
      const p = get('SELECT * FROM posts WHERE id=?', Number(raw));
      if (!p) return say(id, 'Пост не найден.');
      if (action === 'preview') return send(id, JSON.parse(p.payload));
      if (action === 'cancel') {
        const result = run("UPDATE posts SET status='cancelled' WHERE id=? AND status IN ('draft','scheduled','queued')", p.id);
        if (result.changes) { clear(id); return say(id, 'Пост отменён.'); }
        return say(id, 'Рассылка уже началась или пост завершён.');
      }
      if (p.status !== 'draft') return say(id, 'Этот пост уже запланирован, отправлен или отменён.');
      if (action === 'schedule') { session(id, 'schedule', p.id); return say(id, 'Введите дату и время по Москве: ДД.ММ.ГГГГ ЧЧ:ММ. Например: 17.11.2026 09:00.'); }
      if (action === 'confirm') return say(id, `Отправить пост №${p.id} всем подписчикам?`, buttons([[['Да, отправить', `publish:${p.id}`]], [['Вернуться', `preview:${p.id}`]]]));
      if (action === 'publish') { run("UPDATE posts SET status='queued',due=? WHERE id=? AND status='draft'", now(), p.id); clear(id); return say(id, 'Пост поставлен в очередь рассылки.'); }
      return;
    }
    const text = russianMenuText(m.text ?? '', getContent());
    const command = text.split(/\s/)[0].split('@')[0];
    if (command === '/id') return say(id, `Ваш Telegram ID: ${id}`);
    if (command === '/start' || command === '/language' || text === '🌐 Язык / Language') { clear(id); return say(id, 'Язык / Language', languagePrompt); }
    if (command === '/cancel') { clear(id); return say(id, 'Текущее действие отменено. Сохранённые посты доступны через /drafts и /admin.', currentMenu()); }
    if (text === '🔔 Подписаться' || command === '/subscribe') { run('INSERT OR REPLACE INTO subscribers VALUES (?,1)', id); return say(id, 'Вы подписались на новости. Отписаться: /unsubscribe.', currentMenu()); }
    if (text === '🔕 Отписаться' || command === '/unsubscribe' || command === '/stop') { run('UPDATE subscribers SET active=0 WHERE id=?', id); return say(id, 'Рассылка отключена.', currentMenu()); }
    if (text === '📄 Программа') {
      const pdf = await getProgramPdf(language(id));
      return pdf ? api('sendDocument', { chat_id: id, document: pdf, caption: translate('Актуальная программа ПММФ', language(id), getContent()) }) : say(id, 'Программа скоро появится.');
    }
    const page = getContent().pages.find(page => [page.title.ru, page.title.en].includes(m.text));
    if (page) return api('sendMessage', { chat_id: id, text: page.body[language(id)], reply_markup: { inline_keyboard: page.links.map(link => [{ text: link.label[language(id)], url: link.url }]) } });
    if (!isAdmin(id)) return say(id, 'Выберите раздел меню.', currentMenu());
    if (command === '/admin') { clear(id); return say(id, 'Управление ботом. Черновики: /drafts. Время публикаций — московское.', adminMenu); }
    if (command === '/drafts') {
      const posts = all("SELECT id FROM posts WHERE owner=? AND status='draft' ORDER BY id DESC LIMIT 20", id);
      if (!posts.length) return say(id, 'Черновиков нет.');
      for (const p of posts) await say(id, `Черновик №${p.id}`, draftButtons(p.id));
      return;
    }
    const s = get('SELECT * FROM sessions WHERE id=?', id);
    if (s?.state === 'pdf') {
      clear(id); return say(id, 'PDF программы загружаются на сайте: /admin?section=program. Сохраните отдельные файлы для RU и EN.');
    }
    if (s?.state === 'post') {
      const payload = content(m);
      if (!payload) return say(id, 'Пришлите текст, одно фото или одно видео с подписью. Альбомы пока не поддерживаются.');
      const p = run('INSERT INTO posts(owner,payload) VALUES (?,?)', id, JSON.stringify(payload));
      clear(id); await send(id, payload); return say(id, `Черновик №${p.lastInsertRowid}. Проверьте пост перед рассылкой.`, draftButtons(Number(p.lastInsertRowid)));
    }
    if (s?.state === 'schedule') {
      const due = parseDate(m.text ?? '', now());
      if (!due) return say(id, 'Укажите существующую будущую дату: ДД.ММ.ГГГГ ЧЧ:ММ (Москва).');
      const result = run("UPDATE posts SET status='scheduled',due=? WHERE id=? AND status='draft'", due, s.post);
      clear(id); return say(id, result.changes ? `Пост №${s.post} запланирован: ${formatDate(due)} МСК.` : 'Пост уже изменён. Откройте /admin.');
    }
    return say(id, 'Меню организатора: /admin', currentMenu());
  }

  async function tick() {
    if (Number(setting('broadcast_pause') ?? 0) > now()) return;
    const p = get("SELECT * FROM posts WHERE status IN ('queued','scheduled','sending') AND due<=? ORDER BY due,id LIMIT 1", now());
    if (!p) return;
    if (p.status !== 'sending') {
      db.exec('BEGIN IMMEDIATE');
      try {
        run("UPDATE posts SET status='sending' WHERE id=?", p.id);
        run("INSERT OR IGNORE INTO deliveries(post,chat) SELECT ?,id FROM subscribers WHERE active=1", p.id);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    const d = get("SELECT * FROM deliveries WHERE post=? AND status='pending' AND next<=? LIMIT 1", p.id, now());
    if (d) {
      if (!get('SELECT active FROM subscribers WHERE id=?', d.chat)?.active) { run("UPDATE deliveries SET status='skipped' WHERE post=? AND chat=?", p.id, d.chat); return; }
      run("UPDATE deliveries SET status='sending' WHERE post=? AND chat=?", p.id, d.chat);
      let state = 'sent';
      try { await send(d.chat, JSON.parse(p.payload)); }
      catch (error) {
        if ([401, 429].includes(error.code)) {
          const resume = now() + Math.max(1, error.retryAfter ?? (error.code === 401 ? 5 : 60)) * 1000;
          set('broadcast_pause', resume);
          run("UPDATE deliveries SET status='pending',next=? WHERE post=? AND chat=?", resume, p.id, d.chat); return;
        }
        if (error.code === 403) run('UPDATE subscribers SET active=0 WHERE id=?', d.chat);
        state = error.code >= 400 && error.code < 500 ? 'failed' : 'unknown';
      }
      run('UPDATE deliveries SET status=? WHERE post=? AND chat=?', state, p.id, d.chat);
      return;
    }
    if (get("SELECT COUNT(*) AS n FROM deliveries WHERE post=? AND status='pending'", p.id).n) return;
    run("UPDATE posts SET status='done' WHERE id=?", p.id);
    const counts = all('SELECT status,COUNT(*) AS n FROM deliveries WHERE post=? GROUP BY status', p.id).map(r => `${({sent:'Доставлено',failed:'Ошибки',unknown:'Доставка не подтверждена',skipped:'Пропущено'})[r.status] ?? r.status}: ${r.n}`).join('\n');
    try { await say(p.owner, `Рассылка №${p.id} завершена.\n${counts || 'Подписчиков нет.'}`); } catch { /* Delivery report must not restart a completed broadcast. */ }
  }
  return { db, handle, tick, setting, set };
}
