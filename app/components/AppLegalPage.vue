<script setup lang="ts">
import defaults from '#shared/config/legal-defaults.json'
import type { LegalContent, LegalSection, SectionVisibility } from '#shared/config/content'

const props = defineProps<{ section: LegalSection }>()
const languageStore = useLanguageStore()
await useAsyncData('site-visibility', () => $fetch<SectionVisibility>('/api/content/visibility'))
const { isVisible } = useSiteVisibility()
const { data } = await useAsyncData(`${props.section}-content`, () =>
  $fetch<LegalContent>(`/api/content/${props.section}`))
const content = computed(() => data.value || defaults[props.section])
const title = computed(() => content.value.title[languageStore.locale] || content.value.title.ru)
const body = computed(() => content.value.body[languageStore.locale] || content.value.body.ru)
const isEnglish = computed(() => languageStore.locale === 'en')

useHead({ title, htmlAttrs: { lang: computed(() => languageStore.locale) } })
</script>

<template>
  <main class="min-h-screen bg-[#8C64D8] px-4 pb-5 pt-32 sm:px-8 sm:pb-8 sm:pt-40 xl:pt-44">
    <AppHeader v-if="isVisible('header')" />
    <div class="mx-auto max-w-[1120px]">
      <article class="rounded-[28px] bg-white px-5 py-8 sm:rounded-[40px] sm:p-12 lg:p-16">
        <NuxtLink to="/" class="inline-block text-sm font-semibold text-[#7650BD] underline underline-offset-4">{{ isEnglish ? 'Back to the main page' : 'На главную' }}</NuxtLink>
        <h1 class="mb-8 mt-6 break-words font-days-one text-[28px] leading-tight text-[#7650BD] [overflow-wrap:anywhere] sm:text-[40px]">{{ title }}</h1>
        <LegalContent :text="body" />
      </article>

      <nav :aria-label="isEnglish ? 'Legal documents' : 'Правовые документы'" class="flex flex-wrap gap-x-6 gap-y-3 px-2 py-6 font-montserrat text-sm text-white">
        <NuxtLink to="/privacy-policy" class="underline underline-offset-4">{{ isEnglish ? 'Personal Data Policy' : 'Политика в отношении персональных данных' }}</NuxtLink>
        <NuxtLink to="/personal-data-consent" class="underline underline-offset-4">{{ isEnglish ? 'Consent to Personal Data Processing' : 'Согласие на обработку персональных данных' }}</NuxtLink>
        <NuxtLink to="/#registration" class="underline underline-offset-4">{{ isEnglish ? 'Back to registration' : 'Вернуться к регистрации' }}</NuxtLink>
      </nav>
    </div>
  </main>
</template>
