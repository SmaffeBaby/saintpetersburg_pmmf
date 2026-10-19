import type { AppLocale } from '~/stores/language'

export interface LocalizedText {
  ru: string
  en: string
}

export interface HeaderLink {
  label: string
  href: string
}

export interface HeaderContentLink {
  label: LocalizedText
  href: string
}

export interface HeaderLanguage {
  code: AppLocale
  label: string
}

export interface HeaderContent {
  logo: {
    src: string
    alt: LocalizedText
  }
  nav: HeaderContentLink[]
  registration: HeaderContentLink
  languages: HeaderLanguage[]
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

export const useHeader = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('header-content', () => $fetch<HeaderContent>('/api/content/header'))

  const headerContent = computed<HeaderContent>(() => data.value || {
    logo: {
      src: '/images/header-logo.svg',
      alt: {
        ru: 'Петербургский международный молодежный форум',
        en: 'Saint Petersburg International Youth Forum'
      }
    },
    nav: [],
    registration: {
      href: '#registration',
      label: {
        ru: 'Регистрация',
        en: 'Registration'
      }
    },
    languages: [
      { code: 'ru', label: 'RU' },
      { code: 'en', label: 'EN' }
    ]
  })

  const navItems = computed<HeaderLink[]>(() => headerContent.value.nav.map((item) => ({
    href: item.href,
    label: getLocalizedText(item.label, languageStore.locale)
  })))

  const registrationLink = computed<HeaderLink>(() => ({
    href: headerContent.value.registration.href,
    label: getLocalizedText(headerContent.value.registration.label, languageStore.locale)
  }))

  const logo = computed(() => ({
    src: headerContent.value.logo.src,
    alt: getLocalizedText(headerContent.value.logo.alt, languageStore.locale)
  }))

  const languages = computed(() => headerContent.value.languages)

  return {
    languages,
    logo,
    navItems,
    registrationLink
  }
}
