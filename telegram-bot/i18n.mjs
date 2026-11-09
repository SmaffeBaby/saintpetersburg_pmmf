import { defaultBotContent, messageDefinitions } from '../shared/config/telegram-defaults.mjs';
const defaults = defaultBotContent();
const patterns = messageDefinitions.filter(d => d.ru.includes('{{')).map(def => {
  const names = [];
  const parts = def.ru.split(/(\{\{\w+\}\})/g).map(part => {
    if (/^\{\{\w+\}\}$/.test(part)) { names.push(part.slice(2, -2)); return '([\\s\\S]+?)'; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  return { def, names, regex: new RegExp(`^${parts.join('')}$`) };
});
export function translate(text, lang, config = defaults) {
  if (typeof text !== 'string') return text;
  const locale = lang === 'en' ? 'en' : 'ru';
  const exact = messageDefinitions.find(def => def.ru === text);
  if (exact) return config.messages[exact.id]?.[locale] ?? exact[locale];
  for (const { def, names, regex } of patterns) {
    const match = regex.exec(text);
    if (!match) continue;
    let result = config.messages[def.id]?.[locale] ?? def[locale];
    names.forEach((name, i) => {
      let value = match[i + 1];
      if (name === 'counts') value = value.split('\n').map(line => translate(line, locale, config)).join('\n');
      result = result.replaceAll(`{{${name}}}`, value);
    });
    return result;
  }
  return text;
}
export function localizeMarkup(markup, lang, config = defaults) {
  if (!markup) return markup;
  const key = markup.inline_keyboard ? 'inline_keyboard' : 'keyboard';
  if (!markup[key]) return markup;
  return { ...markup, [key]: markup[key].map(row => row.map(item => typeof item === 'string' ? translate(item, lang, config) : { ...item, text: translate(item.text, lang, config) })) };
}
export const russianMenuText = (text, config = defaults) => messageDefinitions.find(def => def.button && [def.ru, def.en, config.messages[def.id]?.ru, config.messages[def.id]?.en].includes(text))?.ru ?? text;
export const languagePrompt = { inline_keyboard: [[{ text: 'Русский', callback_data: 'language:ru' }, { text: 'English', callback_data: 'language:en' }]] };
export function participantMenu(config = defaults) {
  return { keyboard: [['📄 Программа'], ...config.pages.map(page => [page.title.ru]), ['🔔 Подписаться', '🔕 Отписаться'], ['🌐 Язык / Language']], resize_keyboard: true };
}
