import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

interface LoftHallContent {
  title: LocalizedText
  city: LocalizedText
  subtitle: LocalizedText
  description: LocalizedText
  date: LocalizedText
  mapLabel: LocalizedText
  registration: { label: LocalizedText; href: string }
  image: { src: string; alt: LocalizedText }
}

export const useLoftHall = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('loft-hall-content', () => $fetch<LoftHallContent>('/api/content/loft-hall'))
  const content = computed(() => data.value || defaults['loft-hall'])
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    title: computed(() => localize(content.value.title)),
    city: computed(() => localize(content.value.city)),
    subtitle: computed(() => localize(content.value.subtitle)),
    description: computed(() => localize(content.value.description)),
    date: computed(() => localize(content.value.date)),
    mapLabel: computed(() => localize(content.value.mapLabel)),
    registration: computed(() => ({ href: content.value.registration.href, label: localize(content.value.registration.label) })),
    image: computed(() => ({ src: content.value.image.src, alt: localize(content.value.image.alt) }))
  }
}
