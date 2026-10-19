import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

export interface FooterContent {
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
    email: computed(() => content.value.email),
    address: computed(() => localize(content.value.address)),
    contacts: computed(() => localize(content.value.contacts)),
    privacyLink: computed(() => ({
      href: content.value.privacy.href,
      label: localize(content.value.privacy.label)
    }))
  }
}
