import type { AppLocale } from '~/stores/language'
import type { LocalizedText } from '~/composables/useHeader'
import defaults from '#shared/config/content-defaults.json'
import { localizedImageSource } from '#shared/utils/localizedImage'
import defaultHeroLogo from '~/assets/images/hero-mmf-logo.png'

export interface HeroContent {
  title: LocalizedText
  date: LocalizedText
  place: LocalizedText
  logo: { src: string; srcEn: string }
  organizers: { src: string; srcEn: string; width: number; height: number; alt: LocalizedText }[]
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

export const useHero = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('hero-content', () => $fetch<HeroContent>('/api/content/hero'))

  const heroContent = computed<HeroContent>(() => data.value || defaults.hero)

  const title = computed(() => getLocalizedText(heroContent.value.title, languageStore.locale))
  const date = computed(() => getLocalizedText(heroContent.value.date, languageStore.locale))
  const place = computed(() => getLocalizedText(heroContent.value.place, languageStore.locale))

  return {
    logo: computed(() => localizedImageSource(heroContent.value.logo || defaults.hero.logo, languageStore.locale) || defaultHeroLogo),
    organizerLogos: computed(() => (heroContent.value.organizers || defaults.hero.organizers).map(organizer => ({
      ...organizer,
      src: localizedImageSource(organizer, languageStore.locale),
      alt: getLocalizedText(organizer.alt, languageStore.locale)
    }))),
    date,
    place,
    title
  }
}
