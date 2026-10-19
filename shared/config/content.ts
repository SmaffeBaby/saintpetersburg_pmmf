import { z } from 'zod'

const text = z.string().max(20000)
const localized = z.object({ ru: text, en: text }).strict()
const safeHref = z.string().max(2048).refine(value => /^(https?:\/\/|\/(?!\/)|#[\w-])/.test(value), 'Укажите http(s), локальный путь или якорь')
const link = z.object({ label: localized, href: safeHref }).strict()
const fieldNames = ['lastName', 'firstName', 'middleName', 'birthDate', 'region', 'email', 'phone'] as const
const field = z.object({
  id: z.enum(fieldNames), name: z.enum(fieldNames),
  type: z.enum(['text', 'date', 'email', 'tel']), label: localized, placeholder: localized,
  autocomplete: z.string().max(80).optional(), layout: z.enum(['third', 'half'])
}).strict()

export const contentSchemas = {
  header: z.object({
    logo: z.object({ src: z.string().regex(/^\/(?!\/)/).max(2048), alt: localized }).strict(),
    nav: z.array(link).max(12), registration: link,
    languages: z.array(z.object({ code: z.enum(['ru', 'en']), label: z.string().min(1).max(20) }).strict()).min(1).max(2)
      .refine(rows => new Set(rows.map(row => row.code)).size === rows.length)
  }).strict(),
  hero: z.object({ title: localized, date: localized, place: localized }).strict(),
  about: z.object({ title: localized, firstParagraph: localized, secondParagraph: localized }).strict(),
  'loft-hall': z.object({
    title: localized, city: localized, subtitle: localized, description: localized, date: localized,
    mapLabel: localized, registration: link,
    image: z.object({ src: z.string().regex(/^\/(?!\/)/).max(2048), alt: localized }).strict()
  }).strict(),
  schedule: z.object({
    title: localized, description: localized,
    button: z.object({ label: localized, href: safeHref.or(z.literal('')) }).strict()
  }).strict(),
  program: z.object({ title: localized, description: localized }).strict(),
  'information-partners': z.object({
    title: localized,
    partners: z.array(z.object({
      src: z.string().regex(/^\/(?!\/)/).max(2048),
      alt: localized
    }).strict()).max(12)
  }).strict(),
  'registration-form': z.object({
    title: localized, agreement: localized, submitLabel: localized,
    fields: z.array(field).length(7).refine(rows =>
      fieldNames.every(name => rows.filter(row => row.name === name && row.id === name).length === 1)
      && rows.every(row => row.type === (row.name === 'birthDate' ? 'date' : row.name === 'email' ? 'email' : row.name === 'phone' ? 'tel' : 'text')),
    'Все семь полей должны присутствовать с исходными именами и типами')
  }).strict(),
  'alternative-forum': z.object({ title: localized, description: localized, button: link, image: z.object({ alt: localized }).strict() }).strict(),
  footer: z.object({
    email: z.email().max(254), address: localized, contacts: localized,
    legal: localized, privacy: link
  }).strict()
}
export type ContentSection = keyof typeof contentSchemas
export const contentSections: { id: ContentSection; label: string; icon: string }[] = [
  { id: 'header', label: 'Шапка сайта', icon: 'i-lucide-panel-top' },
  { id: 'hero', label: 'Первый экран', icon: 'i-lucide-layout-template' },
  { id: 'about', label: 'О форуме', icon: 'i-lucide-info' },
  { id: 'loft-hall', label: 'LoftHall / Площадка', icon: 'i-lucide-map-pin' },
  { id: 'schedule', label: 'Расписание', icon: 'i-lucide-calendar-days' },
  { id: 'program', label: 'Программа', icon: 'i-lucide-list' },
  { id: 'information-partners', label: 'Информационные партнеры', icon: 'i-lucide-handshake' },
  { id: 'registration-form', label: 'Форма регистрации', icon: 'i-lucide-clipboard-list' },
  { id: 'alternative-forum', label: 'Альтернативная регистрация', icon: 'i-lucide-external-link' },
  { id: 'footer', label: 'Подвал', icon: 'i-lucide-panel-bottom' }
]
export const isContentSection = (value: string): value is ContentSection => Object.hasOwn(contentSchemas, value)
