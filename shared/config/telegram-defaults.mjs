const staticTranslations = {
  '📄 Программа': '📄 Programme', '🔗 Ресурсы ПММФ': '🔗 SPIYF resources', '🤝 Партнёры': '🤝 Partners',
  '🔔 Подписаться': '🔔 Subscribe', '🔕 Отписаться': '🔕 Unsubscribe', '🌐 Язык / Language': '🌐 Язык / Language',
  '✍️ Создать пост': '✍️ Create post', '📅 Запланированные': '📅 Scheduled posts', '📄 Загрузить программу': '📄 Upload programme', '📊 Статистика': '📊 Statistics',
  'Сайт ПММФ': 'SPIYF website', 'Комитет: ВКонтакте': 'Committee: VK', 'Комитет: Telegram': 'Committee: Telegram', 'Сайт комитета': 'Committee website',
  'Росмолодёжь': 'Rosmolodezh', 'СПбГУ': 'St Petersburg University', 'Всемирный фестиваль молодёжи': 'World Youth Festival',
  '👁 Предпросмотр': '👁 Preview', '📤 Отправить сейчас': '📤 Publish now', '🕒 Запланировать': '🕒 Schedule', '🗑 Отменить пост': '🗑 Cancel post',
  'Отменить': 'Cancel', 'Да, отправить': 'Yes, publish', 'Вернуться': 'Back',
  'Доступ только для администраторов.': 'Administrators only.',
  'Пришлите текст, одно фото или одно видео с подписью. Для отмены — /cancel.': 'Send text, one photo or one video with a caption. To cancel: /cancel.',
  'Пришлите программу файлом PDF. Для отмены — /cancel.': 'Send the programme as a PDF document. To cancel: /cancel.',
  'Запланированных постов нет.': 'No scheduled posts.', 'Пост не найден.': 'Post not found.', 'Пост отменён.': 'Post cancelled.',
  'Рассылка уже началась или пост завершён.': 'The broadcast has already started or finished.',
  'Этот пост уже запланирован, отправлен или отменён.': 'This post has already been scheduled, sent or cancelled.',
  'Введите дату и время по Москве: ДД.ММ.ГГГГ ЧЧ:ММ. Например: 17.11.2026 09:00.': 'Enter the date and time in Moscow time: DD.MM.YYYY HH:MM. For example: 17.11.2026 09:00.',
  'Пост поставлен в очередь рассылки.': 'The post has been queued for delivery.',
  'Добро пожаловать в помощник ПММФ! Здесь будут программа, полезные ссылки и новости форума. Для получения новостей нажмите «Подписаться». Организаторы: /admin.': 'Welcome to the SPIYF assistant! Find the programme, useful links and forum news here. Tap Subscribe to receive updates. Organizers: /admin.',
  'Текущее действие отменено. Сохранённые посты доступны через /drafts и /admin.': 'Current action cancelled. Saved posts are available via /drafts and /admin.',
  'Вы подписались на новости. Отписаться: /unsubscribe.': 'You have subscribed to updates. To unsubscribe: /unsubscribe.',
  'Рассылка отключена.': 'You have unsubscribed from updates.', 'Актуальная программа ПММФ': 'Current SPIYF programme', 'Программа скоро появится.': 'The programme will be available soon.',
  'Ресурсы ПММФ и комитета:': 'SPIYF and committee resources:', 'Ресурсы партнёров:': 'Partner resources:', 'Выберите раздел меню.': 'Choose a menu item.',
  'Управление ботом. Черновики: /drafts. Время публикаций — московское.': 'Bot administration. Drafts: /drafts. All publication times use Moscow time.',
  'Черновиков нет.': 'No drafts.', 'Нужен документ в формате PDF.': 'Please send a PDF document.',
  'Программа обновлена. Участники получат её по кнопке «Программа».': 'Programme updated. Participants can access it using the Programme button.',
  'Пришлите текст, одно фото или одно видео с подписью. Альбомы пока не поддерживаются.': 'Send text, one photo or one video with a caption. Albums are not supported yet.',
  'Укажите существующую будущую дату: ДД.ММ.ГГГГ ЧЧ:ММ (Москва).': 'Enter a valid future date: DD.MM.YYYY HH:MM (Moscow time).',
  'Пост уже изменён. Откройте /admin.': 'The post has already changed. Open /admin.', 'Меню организатора: /admin': 'Organizer menu: /admin',
};

const dynamic = {
  telegram_id: { ru: 'Ваш Telegram ID: {{id}}', en: 'Your Telegram ID: {{id}}' },
  subscribers: { ru: 'Подписчиков: {{count}}', en: 'Subscribers: {{count}}' },
  scheduled_item: { ru: 'Пост №{{id}} • {{date}} МСК', en: 'Post #{{id}} • {{date}} MSK' },
  confirm: { ru: 'Отправить пост №{{id}} всем подписчикам?', en: 'Send post #{{id}} to all subscribers?' },
  draft_saved: { ru: 'Черновик №{{id}}. Проверьте пост перед рассылкой.', en: 'Draft #{{id}}. Review the post before broadcasting.' },
  draft: { ru: 'Черновик №{{id}}', en: 'Draft #{{id}}' },
  scheduled: { ru: 'Пост №{{id}} запланирован: {{date}} МСК.', en: 'Post #{{id}} scheduled: {{date}} MSK.' },
  report: { ru: 'Рассылка №{{id}} завершена.\n{{counts}}', en: 'Broadcast #{{id}} completed.\n{{counts}}' },
  delivered: { ru: 'Доставлено: {{count}}', en: 'Delivered: {{count}}' },
  failed: { ru: 'Ошибки: {{count}}', en: 'Failed: {{count}}' },
  unknown: { ru: 'Доставка не подтверждена: {{count}}', en: 'Delivery unconfirmed: {{count}}' },
  skipped: { ru: 'Пропущено: {{count}}', en: 'Skipped: {{count}}' },
  no_subscribers: { ru: 'Подписчиков нет.', en: 'No subscribers.' },
  language_prompt: { ru: 'Язык / Language', en: 'Язык / Language' },
  language_ru: { ru: 'Русский', en: 'Русский' },
  language_en: { ru: 'English', en: 'English' },
};
const pageTexts = ['🔗 Ресурсы ПММФ', '🤝 Партнёры', 'Сайт ПММФ', 'Комитет: ВКонтакте', 'Комитет: Telegram', 'Сайт комитета', 'Росмолодёжь', 'СПбГУ', 'Всемирный фестиваль молодёжи', 'Ресурсы ПММФ и комитета:', 'Ресурсы партнёров:'];
const buttonTexts = ['📄 Программа', '🔗 Ресурсы ПММФ', '🤝 Партнёры', '🔔 Подписаться', '🔕 Отписаться', '🌐 Язык / Language', '✍️ Создать пост', '📅 Запланированные', '📄 Загрузить программу', '📊 Статистика', '👁 Предпросмотр', '📤 Отправить сейчас', '🕒 Запланировать', '🗑 Отменить пост', 'Отменить', 'Да, отправить', 'Вернуться'];
export const messageDefinitions = [
  ...Object.entries(staticTranslations).map(([ru, en], i) => ({ id: `text_${String(i + 1).padStart(3, '0')}`, label: ru, ru, en, button: buttonTexts.includes(ru) })).filter(item => !pageTexts.includes(item.ru)),
  ...Object.entries(dynamic).map(([id, value]) => ({ id, label: value.ru, ...value, button: id === 'language_ru' || id === 'language_en' })),
];
export const defaultMessages = Object.fromEntries(messageDefinitions.map(({ id, ru, en }) => [id, { ru, en }]));
export const defaultPages = [
  { id: 'resources', title: { ru: '🔗 Ресурсы ПММФ', en: '🔗 SPIYF resources' }, body: { ru: 'Ресурсы ПММФ и комитета:', en: 'SPIYF and committee resources:' }, links: [
    { label: { ru: 'Сайт ПММФ', en: 'SPIYF website' }, url: 'https://spiyf.ru/' },
    { label: { ru: 'Комитет: ВКонтакте', en: 'Committee: VK' }, url: 'https://vk.com/spb_kpmp' },
    { label: { ru: 'Комитет: Telegram', en: 'Committee: Telegram' }, url: 'https://t.me/wearespb' },
    { label: { ru: 'Сайт комитета', en: 'Committee website' }, url: 'https://www.gov.spb.ru/gov/otrasl/kpmp/' },
  ] },
  { id: 'partners', title: { ru: '🤝 Партнёры', en: '🤝 Partners' }, body: { ru: 'Ресурсы партнёров:', en: 'Partner resources:' }, links: [
    { label: { ru: 'Росмолодёжь', en: 'Rosmolodezh' }, url: 'https://fadm.gov.ru/' },
    { label: { ru: 'СПбГУ', en: 'St Petersburg University' }, url: 'https://spbu.ru/' },
    { label: { ru: 'Всемирный фестиваль молодёжи', en: 'World Youth Festival' }, url: 'https://wyffest.com/' },
  ] },
];
export const defaultBotContent = () => structuredClone({ messages: defaultMessages, pages: defaultPages });
