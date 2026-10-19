import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

interface ProgramContent {
  title: LocalizedText
  description: LocalizedText
}

export const useProgram = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('program-content', () => $fetch<ProgramContent>('/api/content/program'))
  const content = computed(() => data.value || defaults.program)
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    title: computed(() => localize(content.value.title)),
    description: computed(() => localize(content.value.description))
  }
}
