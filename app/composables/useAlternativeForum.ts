import type { AppLocale } from '~/stores/language'
import type { LocalizedText } from '~/composables/useHeader'

export interface AlternativeForumContent {
  title: LocalizedText
  description: LocalizedText
  button: {
    label: LocalizedText
    href: string
  }
  image: {
    alt: LocalizedText
  }
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

const fallbackContent: AlternativeForumContent = {
  title: {
    ru: 'Альтернативная регистрация',
    en: 'Alternative registration'
  },
  description: {
    ru: 'Также регистрация на форум «Мы граждане России» возможна через официальную платформу ФГАИС «Молодежь России».\n\nЗаполните анкету, выберите интересующие треки и станьте частью главного гражданского события года!',
    en: 'Registration for the We Are Citizens of Russia forum is also available through the official FGAIS Youth of Russia platform.\n\nFill out the form, choose the tracks you are interested in and become part of the main civic event of the year!'
  },
  button: {
    label: {
      ru: 'Зарегистрироваться',
      en: 'Register'
    },
    href: 'https://fadm.gov.ru/'
  },
  image: {
    alt: {
      ru: 'Росмолодежь Форумы',
      en: 'Rosmolodezh Forums'
    }
  }
}

export const useAlternativeForum = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('alternative-forum-content', () => $fetch<AlternativeForumContent>('/api/content/alternative-forum'))

  const content = computed<AlternativeForumContent>(() => data.value || fallbackContent)

  const title = computed(() => getLocalizedText(content.value.title, languageStore.locale))
  const description = computed(() => getLocalizedText(content.value.description, languageStore.locale))
  const button = computed(() => ({
    href: content.value.button.href,
    label: getLocalizedText(content.value.button.label, languageStore.locale)
  }))
  const imageAlt = computed(() => getLocalizedText(content.value.image.alt, languageStore.locale))

  return {
    button,
    description,
    imageAlt,
    title
  }
}
