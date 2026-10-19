import type { AppLocale } from '~/stores/language'
import type { LocalizedText } from '~/composables/useHeader'

export interface AboutContent {
  title: LocalizedText
  firstParagraph: LocalizedText
  secondParagraph: LocalizedText
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

export const useAbout = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('about-content', () => $fetch<AboutContent>('/api/content/about'))

  const aboutContent = computed<AboutContent>(() => data.value || {
    title: {
      ru: 'О форуме',
      en: 'About\nthe forum'
    },
    firstParagraph: {
      ru: 'Масштабная площадка для диалога о том, что важно сегодня и каким будет завтра. Здесь встретятся молодёжь, представители власти, эксперты и общественные лидеры, чтобы говорить о том, что волнует новое поколение, обмениваться мнениями и вместе искать решения',
      en: 'A large-scale platform for dialogue about what matters today and what tomorrow will look like. Young people, government representatives, experts and community leaders will meet here to discuss what matters to the new generation, exchange views and look for solutions together'
    },
    secondParagraph: {
      ru: 'Как найти работу, которая вдохновляет? Почему мы откладываем создание семьи? Кто на самом деле управляет твоей лентой? Что сегодня значит быть патриотом? Как превратить желание помочь в работающий проект - и какую роль во всём этом играешь именно ты? В программе - открытые дискуссии и мастер-классы, реальные истории и практические кейсы, искусственный интеллект, кино и встречи с людьми, которым есть что сказать.',
      en: 'How do you find work that inspires you? Why do we postpone starting a family? Who really controls your feed? What does it mean to be a patriot today? How can the desire to help become a working project, and what role do you play in all this? The program includes open discussions and workshops, real stories and practical cases, artificial intelligence, cinema and meetings with people who have something to say.'
    }
  })

  const title = computed(() => getLocalizedText(aboutContent.value.title, languageStore.locale))
  const firstParagraph = computed(() => getLocalizedText(aboutContent.value.firstParagraph, languageStore.locale))
  const secondParagraph = computed(() => getLocalizedText(aboutContent.value.secondParagraph, languageStore.locale))

  return {
    firstParagraph,
    secondParagraph,
    title
  }
}
