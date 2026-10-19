import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

interface ScheduleContent {
  title: LocalizedText
  description: LocalizedText
  button: { label: LocalizedText; href: string }
}

export const useSchedule = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('schedule-content', () => $fetch<ScheduleContent>('/api/content/schedule'))
  const content = computed(() => data.value || defaults.schedule)
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    title: computed(() => localize(content.value.title)),
    description: computed(() => localize(content.value.description)),
    button: computed(() => ({ label: localize(content.value.button.label), href: content.value.button.href }))
  }
}
