import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

interface InformationPartnersContent {
  title: LocalizedText
  partners: { src: string; alt: LocalizedText }[]
}

export const useInformationPartners = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('information-partners-content', () =>
    $fetch<InformationPartnersContent>('/api/content/information-partners'))
  const content = computed(() => data.value || defaults['information-partners'])
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    title: computed(() => localize(content.value.title)),
    partners: computed(() => content.value.partners.map(partner => ({
      src: partner.src,
      alt: localize(partner.alt)
    })))
  }
}
