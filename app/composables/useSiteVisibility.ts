import type { ContentSection, SectionVisibility } from '#shared/config/content'
import { isContentLinkVisible } from '#shared/utils/contentVisibility'

export const useSiteVisibility = () => {
  const { data } = useNuxtData<SectionVisibility>('site-visibility')
  const isVisible = (section: ContentSection) => data.value?.[section] !== false
  const isLinkVisible = (href: string) => isContentLinkVisible(href, data.value || {})
  return { isVisible, isLinkVisible }
}
