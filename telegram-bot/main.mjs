import { createBot } from './bot.mjs';
import { openTelegramAccess } from '../shared/utils/telegramAccess.mjs';
import { openTelegramSettings, validToken } from '../shared/utils/telegramSettings.mjs';
import { createTelegramApi } from './telegramApi.mjs';
import { setTimeout as delay } from 'node:timers/promises';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const bootstrapToken = process.env.TELEGRAM_BOT_TOKEN;
const adminIds = (process.env.TELEGRAM_ADMIN_IDS ?? '').split(',').filter(Boolean).map(Number);
if ((bootstrapToken && !validToken(bootstrapToken)) || adminIds.some(id => !Number.isSafeInteger(id) || id <= 0)) {
  console.error('Задайте TELEGRAM_BOT_TOKEN и корректные TELEGRAM_ADMIN_IDS в telegram-bot/.env.');
  process.exit(1);
}
const path = process.env.TELEGRAM_DATABASE_PATH ?? './telegram-bot/data/bot.sqlite';
mkdirSync(dirname(path), { recursive: true });
// An exclusive process lock prevents two pollers from duplicating deliveries.
let lock;
try {
  lock = new DatabaseSync(`${path}.process-lock.sqlite`);
  lock.exec('CREATE TABLE IF NOT EXISTS process_lock (id INTEGER); BEGIN EXCLUSIVE;');
} catch { console.error('База занята другим процессом бота. Остановите второй экземпляр.'); process.exit(1); }
let running = true;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { running = false; });
const access = openTelegramAccess(process.env.TELEGRAM_ACCESS_PATH ?? './data/telegram/access.sqlite', adminIds);
const settings = openTelegramSettings(process.env.TELEGRAM_ACCESS_PATH ?? './data/telegram/access.sqlite');
settings.bootstrap(bootstrapToken);
const api = createTelegramApi(() => settings.token());
const bot = createBot({ path, adminIds, isAdmin: id => access.read().adminIds.includes(String(id)), getContent: () => settings.read().content, api });
async function poll() {
  while (running) {
    try {
      const updates = await api('getUpdates', { offset: Number(bot.setting('offset') ?? 0), timeout: 30, allowed_updates: ['message', 'callback_query'] });
      for (const update of updates) {
        try { await bot.handle(update); }
        catch (error) { console.error('Не удалось обработать обновление; код:', error.code ?? 'internal'); }
        // Do not replay mutations after an ambiguous response from Telegram.
        bot.set('offset', update.update_id + 1);
      }
    } catch (error) {
      console.error('Ошибка получения обновлений; код:', error.code ?? 'internal');
      if (error.code === 409) { running = false; process.exitCode = 1; break; }
      await delay(5000);
    }
  }
}
async function worker() {
  while (running) {
    try { await bot.tick(); } catch { console.error('Ошибка очереди рассылки.'); }
    await delay(100);
  }
}
try {
  let ready = false;
  while (running && !ready) {
    try {
      const me = await api('getMe', {});
      const webhook = await api('getWebhookInfo', {});
      if (webhook.url) throw new Error('Webhook is configured');
      ready = true;
      console.log(`Бот @${me.username} запущен. Администраторов: ${access.read().adminIds.length}. Команда /id доступна без прав администратора.`);
    } catch { console.error('Ожидаем подключения: проверьте токен в админ-панели, сеть и отсутствие webhook.'); if (running) await delay(5000); }
  }
  if (ready && running) await Promise.all([poll(), worker()]);
} catch { console.error('Бот не запущен: проверьте токен, подключение и отсутствие webhook.'); process.exitCode = 1; }
finally { running = false; bot.db.close(); settings.db.close(); access.db.close(); lock.close(); }
