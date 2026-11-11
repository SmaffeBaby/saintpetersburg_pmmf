import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'
import { localizedImageSource } from '#shared/utils/localizedImage'

export interface FooterContent {
  image: { src: string; srcEn: string; alt: LocalizedText }
  email: string
  address: LocalizedText
  contacts: LocalizedText
  legal: LocalizedText
  privacy: { label: LocalizedText; href: string }
}

export const useFooter = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('footer-content', () => $fetch<FooterContent>('/api/content/footer'))
  const content = computed<FooterContent>(() => ({ ...defaults.footer, ...data.value }))
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    image: computed(() => ({
      src: localizedImageSource(content.value.image, languageStore.locale),
      alt: localize(content.value.image.alt)
    })),
    email: computed(() => content.value.email),
    address: computed(() => localize(content.value.address)),
    contacts: computed(() => localize(content.value.contacts)),
    privacyLink: computed(() => ({
      href: content.value.privacy.href,
      label: localize(content.value.privacy.label)
    }))
  }
}
