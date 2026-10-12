import type { AppLocale } from '~/stores/language'
import type { LocalizedText } from '~/composables/useHeader'

export interface FooterContent {
  legal: LocalizedText
  privacy: {
    label: LocalizedText
    href: string
  }
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

const fallbackContent: FooterContent = {
  legal: {
    ru: 'ИНН 7812035151, ОГРН 1027810228368, Юр. Адрес: 191144, город Санкт-Петербург, Дегтярный пер., д. 9 стр. 1\nСчет банка плательщика № 40102810945370000005, Счет плательщика № 03221643400000007200, Северо-Западного ГУ Банка России//УФК по г. Санкт-Петербургу',
    en: 'TIN 7812035151, PSRN 1027810228368, Legal address: 9 building 1 Degtyarny lane, Saint Petersburg, 191144\nPayer bank account No. 40102810945370000005, payer account No. 03221643400000007200, North-West Main Branch of the Bank of Russia//Federal Treasury Department for Saint Petersburg'
  },
  privacy: {
    label: {
      ru: 'Политика конфиденциальности',
      en: 'Privacy policy'
    },
    href: '/privacy-policy'
  }
}

export const useFooter = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('footer-content', () => queryContent<FooterContent>('/settings/footer').findOne())

  const content = computed<FooterContent>(() => data.value || fallbackContent)
  const legal = computed(() => getLocalizedText(content.value.legal, languageStore.locale))
  const privacyLink = computed(() => ({
    href: content.value.privacy.href,
    label: getLocalizedText(content.value.privacy.label, languageStore.locale)
  }))

  return {
    legal,
    privacyLink
  }
}
