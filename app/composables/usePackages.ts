import defaults from '#shared/config/content-defaults.json'
import type { LocalizedText } from '~/composables/useHeader'

interface PackagesContent {
  packages: { title: LocalizedText; description: LocalizedText }[]
}

export const usePackages = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('packages-content', () => $fetch<PackagesContent>('/api/content/packages'))
  const content = computed(() => data.value || defaults.packages)
  const localize = (value: LocalizedText) => value[languageStore.locale] || value.ru

  return {
    packages: computed(() => content.value.packages.map(item => ({
      title: localize(item.title), description: localize(item.description)
    })))
  }
}
