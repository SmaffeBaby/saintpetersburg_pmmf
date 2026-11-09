export type Bilingual = { ru: string; en: string }
export type BotPage = { id: string; title: Bilingual; body: Bilingual; links: { label: Bilingual; url: string }[] }
export type BotContent = { messages: Record<string, Bilingual>; pages: BotPage[] }
export const messageDefinitions: { id: string; label: string; ru: string; en: string; button: boolean }[]
export const defaultMessages: Record<string, Bilingual>
export const defaultPages: BotPage[]
export function defaultBotContent(): BotContent
