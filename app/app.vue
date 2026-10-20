<script setup lang="ts">
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
  title: siteTitle
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
