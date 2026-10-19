<script setup lang="ts">
const languageStore = useLanguageStore()

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
