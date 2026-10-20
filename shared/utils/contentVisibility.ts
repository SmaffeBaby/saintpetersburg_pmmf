import type { ContentSection, SectionVisibility } from '../config/content'

const anchorSections: Record<string, ContentSection> = {
  about: 'about', 'loft-hall': 'loft-hall', schedule: 'schedule',
  program: 'program', topics: 'program', speakers: 'speakers',
  'information-partners': 'information-partners', registration: 'registration-form',
  contacts: 'footer'
}
export const isContentLinkVisible = (href: string, visibility: Partial<SectionVisibility>) => {
  const anchor = href.startsWith('/#') ? href.slice(2) : href.startsWith('#') ? href.slice(1) : ''
  const section = anchorSections[anchor]
  return !section || visibility[section] !== false
}
