// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2024-09-03',
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#8F3CF0' },
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
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || ''
  },
  experimental: {
    appManifest: false
  },
  srcDir: 'app/',
  css: ['~/assets/css/main.css'],
  modules: ['nuxt-security', '@nuxt/content', '@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/i18n'],
  security: {
    headers: {
      contentSecurityPolicy: {
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
  content: {
    sources: {
      rootContent: {
        driver: 'fs',
        name: 'root-content',
        prefix: '/',
        base: './content'
      }
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css'
  },
  i18n: {
    defaultLocale: 'ru',
    detectBrowserLanguage: false,
    locales: [
      { code: 'ru', name: 'RU', language: 'ru-RU' },
      { code: 'en', name: 'EN', language: 'en-US' }
    ],
    strategy: 'no_prefix',
    vueI18n: './i18n.config.ts'
  }
})
