import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-15',
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#8C64D8' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ]
    }
  },
  buildDir: isDev ? '.nuxt-dev' : '.nuxt',
  devtools: { enabled: false },
  runtimeConfig: {
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 465),
    smtpSecure: process.env.SMTP_SECURE !== 'false',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',
    projectRequestNotifyEmail: process.env.PROJECT_REQUEST_NOTIFY_EMAIL || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || '',
    databasePath: process.env.DATABASE_PATH || './data/saint-mmf.sqlite',
    redisUrl: process.env.REDIS_URL || ''
  },
  experimental: {
    appManifest: false
  },
  srcDir: 'app/',
  serverDir: 'server/',
  nitro: { rollupConfig: { external: ['node:sqlite'] } },
  ui: { fonts: false, colorMode: false },
  icon: { serverBundle: { collections: ['lucide'] } },
  vite: { plugins: [tailwindcss()] },
  routeRules: {
    '/admin': { ssr: false },
    '/api/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/_nuxt/**': { security: { rateLimiter: false } },
    '/images/**': { security: { rateLimiter: false } },
    '/api/admin/login': { security: { rateLimiter: { tokensPerInterval: 10, interval: 300000 } } }
  },
  css: ['~/assets/css/main.css'],
  modules: ['nuxt-security', '@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n'],
  security: {
    headers: {
      contentSecurityPolicy: {
        'frame-src': ['\'self\'', 'https://yandex.ru'],
        'img-src': ['\'self\'', 'data:'],
        'style-src': ['\'self\'', 'https:', '\'unsafe-inline\''],
        'script-src': ['\'self\'', 'https:', '\'unsafe-inline\'', '\'strict-dynamic\'', '\'nonce-{{nonce}}\''],
        'upgrade-insecure-requests': false
      },
      strictTransportSecurity: false,
      crossOriginOpenerPolicy: false,
      originAgentCluster: false
    },
    rateLimiter: {
      tokensPerInterval: 120,
      interval: 300000,
      headers: false,
      driver: {
        name: 'lruCache'
      }
    }
  },
  i18n: {
    defaultLocale: 'ru',
    detectBrowserLanguage: false,
    locales: [
      { code: 'ru', name: 'RU', language: 'ru-RU' },
      { code: 'en', name: 'EN', language: 'en-US' }
    ],
    strategy: 'no_prefix',
    vueI18n: '../i18n.config.ts'
  }
})
