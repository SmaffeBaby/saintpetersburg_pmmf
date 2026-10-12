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
  experimental: {
    appManifest: false
  },
  srcDir: 'app/',
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/i18n'],
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
