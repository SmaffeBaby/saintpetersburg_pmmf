import { z } from 'zod'
import defaults from './content-defaults.json'

const text = z.string().max(20000)
const localized = z.object({ ru: text, en: text }).strict()
const imagePath = z.string().regex(/^\/(?!\/)/).max(2048)
const optionalImagePath = imagePath.or(z.literal(''))
const localizedImage = z.object({ src: imagePath, srcEn: optionalImagePath.default(''), alt: localized }).strict()
const safeHref = z.string().max(2048).refine(value => /^(https?:\/\/|\/(?!\/)|#[\w-])/.test(value), 'Укажите http(s), локальный путь или якорь')
const link = z.object({ label: localized, href: safeHref }).strict()
const fieldNames = ['lastName', 'firstName', 'middleName', 'birthDate', 'region', 'email', 'phone'] as const
const field = z.object({
  id: z.enum(fieldNames), name: z.enum(fieldNames),
  type: z.enum(['text', 'date', 'email', 'tel']), label: localized, placeholder: localized,
  autocomplete: z.string().max(80).optional(), layout: z.enum(['third', 'half'])
}).strict()

const emailTemplate = z.object({ subject: localized, title: localized, message: localized }).strict()

const visibility = { visible: z.boolean().default(true) }

export const contentSchemas = {
  favicon: z.object({ image: z.object({ src: imagePath }).strict() }).strict(),
  header: z.object({
    ...visibility,
    logo: localizedImage.extend({ srcEn: optionalImagePath.default(defaults.header.logo.srcEn) }),
    nav: z.array(link).max(12), registration: link,
    languages: z.array(z.object({ code: z.enum(['ru', 'en']), label: z.string().min(1).max(20) }).strict()).min(1).max(2)
      .refine(rows => new Set(rows.map(row => row.code)).size === rows.length)
  }).strict(),
  hero: z.object({
    ...visibility, title: localized, date: localized, place: localized,
    logo: z.object({ src: optionalImagePath, srcEn: optionalImagePath }).strict().default(defaults.hero.logo),
    organizers: z.array(localizedImage.extend({
      width: z.number().int().min(1).max(2000), height: z.number().int().min(1).max(2000)
    })).max(12).default(defaults.hero.organizers)
  }).strict(),
  about: z.object({ ...visibility, title: localized, firstParagraph: localized, secondParagraph: localized }).strict(),
  'loft-hall': z.object({
    ...visibility,
    title: localized, city: localized, subtitle: localized, description: localized, date: localized,
    mapLabel: localized, registration: link,
    image: z.object({ src: z.string().regex(/^\/(?!\/)/).max(2048), alt: localized }).strict()
  }).strict(),
  schedule: z.object({
    ...visibility,
    title: localized, description: localized,
    button: z.object({ label: localized, href: safeHref.or(z.literal('')) }).strict()
  }).strict(),
  program: z.object({ ...visibility, title: localized, description: localized }).strict(),
  speakers: z.object({
    ...visibility,
    title: localized,
    speakers: z.array(z.object({
      fullName: localized, role: localized,
      image: z.object({ src: z.string().regex(/^\/(?!\/)/).max(2048), alt: localized }).strict()
    }).strict()).max(12)
  }).strict(),
  'information-partners': z.object({
    ...visibility,
    title: localized,
    partners: z.array(localizedImage).max(12)
  }).strict(),
  'registration-messages': z.object({
    successTitle: localized, successMessage: localized,
    savedTitle: localized, savedMessage: localized,
    errorTitle: localized, errorMessage: localized,
    submitterEmail: emailTemplate, organizerEmail: emailTemplate
  }).strict(),
  'registration-form': z.object({
    ...visibility,
    title: localized, agreement: localized, submitLabel: localized,
    fields: z.array(field).length(7).refine(rows =>
      fieldNames.every(name => rows.filter(row => row.name === name && row.id === name).length === 1)
      && rows.every(row => row.type === (row.name === 'birthDate' ? 'date' : row.name === 'email' ? 'email' : row.name === 'phone' ? 'tel' : 'text')),
    'Все семь полей должны присутствовать с исходными именами и типами')
  }).strict(),
  'alternative-forum': z.object({ ...visibility, title: localized, description: localized, button: link, image: z.object({ alt: localized }).strict() }).strict(),
  footer: z.object({
    ...visibility,
    email: z.email().max(254), address: localized, contacts: localized,
    legal: localized, privacy: link
  }).strict()
}
export type ContentSection = keyof typeof contentSchemas
export type SectionVisibility = Record<ContentSection, boolean>

export const contentSections: { id: ContentSection; label: string; icon: string }[] = [
  { id: 'favicon', label: 'Favicon / Иконка сайта', icon: 'i-lucide-image' },
  { id: 'header', label: 'Шапка сайта', icon: 'i-lucide-panel-top' },
  { id: 'hero', label: 'Первый экран', icon: 'i-lucide-layout-template' },
  { id: 'about', label: 'О форуме', icon: 'i-lucide-info' },
  { id: 'loft-hall', label: 'LoftHall / Площадка', icon: 'i-lucide-map-pin' },
  { id: 'schedule', label: 'Расписание', icon: 'i-lucide-calendar-days' },
  { id: 'program', label: 'Программа', icon: 'i-lucide-list' },
  { id: 'speakers', label: 'Наши спикеры', icon: 'i-lucide-users' },
  { id: 'information-partners', label: 'Информационные партнеры', icon: 'i-lucide-handshake' },
  { id: 'registration-messages', label: 'Уведомления и письма', icon: 'i-lucide-mail' },
  { id: 'registration-form', label: 'Форма регистрации', icon: 'i-lucide-clipboard-list' },
  { id: 'alternative-forum', label: 'Альтернативная регистрация', icon: 'i-lucide-external-link' },
  { id: 'footer', label: 'Подвал', icon: 'i-lucide-panel-bottom' }
]
export const isContentSection = (value: string): value is ContentSection => Object.hasOwn(contentSchemas, value)
