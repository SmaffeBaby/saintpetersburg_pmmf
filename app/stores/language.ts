import { defineStore } from 'pinia'

export type AppLocale = 'ru' | 'en'

const availableLocales: AppLocale[] = ['ru', 'en']
const storageKey = 'saint-mmf-locale'

export const useLanguageStore = defineStore('language', () => {
  const locale = ref<AppLocale>('ru')
  const initialized = ref(false)

  const setLocale = (value: string) => {
    if (!availableLocales.includes(value as AppLocale)) {
      return
    }

    locale.value = value as AppLocale

    if (import.meta.client) {
      localStorage.setItem(storageKey, locale.value)
    }
  }

  const initLocale = () => {
    if (!import.meta.client || initialized.value) {
      return
    }

    const savedLocale = localStorage.getItem(storageKey)

    if (savedLocale) {
      setLocale(savedLocale)
    }

    initialized.value = true
  }

  return {
    locale,
    initLocale,
    setLocale
  }
})
