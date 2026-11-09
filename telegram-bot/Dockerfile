FROM node:24-alpine
WORKDIR /app
COPY telegram-bot/bot.mjs telegram-bot/main.mjs telegram-bot/i18n.mjs telegram-bot/telegramApi.mjs ./telegram-bot/
COPY shared/utils/telegramAccess.mjs shared/utils/telegramSettings.mjs ./shared/utils/
COPY shared/config/telegram-defaults.mjs ./shared/config/
ENV TELEGRAM_DATABASE_PATH=/app/data/bot.sqlite
ENV TELEGRAM_ACCESS_PATH=/app/access/access.sqlite
CMD ["node", "telegram-bot/main.mjs"]
