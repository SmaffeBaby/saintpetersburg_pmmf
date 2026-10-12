import type { AppLocale } from '~/stores/language'
import type { LocalizedText } from '~/composables/useHeader'

export interface HeroContent {
  title: LocalizedText
  date: LocalizedText
  place: LocalizedText
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

export const useHero = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('hero-content', () => queryContent<HeroContent>('/settings/hero').findOne())

  const heroContent = computed<HeroContent>(() => data.value || {
    title: {
      ru: 'Петербургский международный молодежный форум',
      en: 'Saint Petersburg International Youth Forum'
    },
    date: {
      ru: '17 ноября / 2026',
      en: 'November 17 / 2026'
    },
    place: {
      ru: 'Санкт‑Петербург, Арсенальная наб, 1',
      en: 'Saint Petersburg, Arsenalnaya Emb, 1'
    }
  })

  const title = computed(() => getLocalizedText(heroContent.value.title, languageStore.locale))
  const date = computed(() => getLocalizedText(heroContent.value.date, languageStore.locale))
  const place = computed(() => getLocalizedText(heroContent.value.place, languageStore.locale))

  return {
    date,
    place,
    title
  }
}
