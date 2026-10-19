import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

interface SpeakersContent {
  title: LocalizedText
  speakers: {
    fullName: LocalizedText
    role: LocalizedText
    image: { src: string; alt: LocalizedText }
  }[]
}

export const useSpeakers = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('speakers-content', () => $fetch<SpeakersContent>('/api/content/speakers'))
  const content = computed(() => data.value || defaults.speakers)
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    title: computed(() => localize(content.value.title)),
    speakers: computed(() => content.value.speakers.map(speaker => ({
      fullName: localize(speaker.fullName),
      role: localize(speaker.role),
      image: { src: speaker.image.src, alt: localize(speaker.image.alt) || localize(speaker.fullName) }
    })))
  }
}
