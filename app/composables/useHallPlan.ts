import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'
import { localizedImageSource } from '#shared/utils/localizedImage'

interface HallPlanContent {
  title: LocalizedText
  description: LocalizedText
  placeholder: LocalizedText
  image: { src: string; srcEn: string; alt: LocalizedText }
}

export const useHallPlan = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('hall-plan-content', () => $fetch<HallPlanContent>('/api/content/hall-plan'))
  const content = computed(() => data.value || defaults['hall-plan'])
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru
  return {
    title: computed(() => localize(content.value.title)),
    description: computed(() => localize(content.value.description)),
    placeholder: computed(() => localize(content.value.placeholder)),
    image: computed(() => ({
      src: localizedImageSource(content.value.image, languageStore.locale),
      alt: localize(content.value.image.alt)
    }))
  }
}
