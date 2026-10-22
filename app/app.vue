<script setup lang="ts">
import defaults from '#shared/config/content-defaults.json'

const { data: favicon } = await useAsyncData('favicon-content', () =>
  $fetch<{ image: { src: string } }>('/api/content/favicon'))
const faviconSrc = computed(() => favicon.value?.image.src || defaults.favicon.image.src)

const languageStore = useLanguageStore()
const { locale: i18nLocale, setLocale: setI18nLocale } = useI18n()

onMounted(() => {
  languageStore.initLocale()
  setI18nLocale(languageStore.locale)
})

watch(() => languageStore.locale, (locale) => {
  setI18nLocale(locale)
  i18nLocale.value = locale
})

const siteTitle = computed(() => languageStore.locale === 'en'
  ? 'St. Petersburg International Youth Forum'
  : 'Петербургский международный молодежный форум')

useHead({
  title: siteTitle,
  link: [
    { key: 'site-favicon', rel: 'icon', href: faviconSrc },
    { key: 'site-shortcut-icon', rel: 'shortcut icon', href: faviconSrc }
  ]
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
