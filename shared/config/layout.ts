export const pageBlocks = ['hero', 'about', 'loft-hall', 'schedule', 'program', 'speakers', 'packages', 'information-partners', 'registration-form', 'alternative-forum'] as const
export type PageBlock = typeof pageBlocks[number]
