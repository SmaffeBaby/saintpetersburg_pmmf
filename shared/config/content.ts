import { z } from 'zod'
import defaults from './content-defaults.json'
import { pageBlocks } from './layout'
import { cityFormField } from './registration'
import { countryCodes } from '../utils/countries'

const text = z.string().max(20000)
const localized = z.object({ ru: text, en: text }).strict()
const imagePath = z.string().regex(/^\/(?!\/)/).max(2048)
const optionalImagePath = imagePath.or(z.literal(''))
const localizedImage = z.object({ src: imagePath, srcEn: optionalImagePath.default(''), alt: localized }).strict()
const safeHref = z.string().max(2048).refine(value => /^(https?:\/\/|\/(?!\/)|#[\w-])/.test(value), 'Укажите http(s), локальный путь или якорь')
const link = z.object({ label: localized, href: safeHref }).strict()
const fieldNames = ['lastName', 'firstName', 'middleName', 'birthDate', 'region', 'city', 'email', 'phone'] as const
const field = z.object({
  id: z.enum(fieldNames), name: z.enum(fieldNames),
  type: z.enum(['text', 'date', 'email', 'tel']), label: localized, placeholder: localized,
  autocomplete: z.string().max(80).optional(), layout: z.enum(['third', 'half'])
}).strict()

const emailTemplate = z.object({ subject: localized, title: localized, message: localized }).strict()

const visibility = { visible: z.boolean().default(true) }
const legalDocument = z.object({
  title: localized,
  body: z.object({ ru: z.string().max(100000), en: z.string().max(100000) }).strict()
}).strict()

export type LegalSection = 'privacy-policy' | 'personal-data-consent'
export type LegalContent = z.infer<typeof legalDocument>

export const contentSchemas = {
  'site-layout': z.object({ order: z.preprocess(value => {
    // Extend saved layouts while keeping their custom block order.
    if (!Array.isArray(value) || new Set(value).size !== value.length
      || !value.every(block => pageBlocks.includes(block))
      || !pageBlocks.filter(block => block !== 'packages' && block !== 'hall-plan').every(block => value.includes(block))) return value
    const order = [...value]
    if (!order.includes('packages')) order.splice(order.indexOf('speakers') + 1, 0, 'packages')
    if (!order.includes('hall-plan')) order.splice(order.indexOf('loft-hall') + 1, 0, 'hall-plan')
    return order
  }, z.array(z.enum(pageBlocks)).length(pageBlocks.length)
    .refine(order => new Set(order).size === pageBlocks.length, 'Каждый блок должен присутствовать ровно один раз')) }).strict(),
  'registration-delivery': z.object({
    organizerEmail: z.email().max(254),
    participantEmailMode: z.enum(['all', 'except', 'only']).default('except'),
    includedCountries: z.array(z.string().refine(code => countryCodes.includes(code), 'Неизвестная страна'))
      .max(countryCodes.length).refine(codes => new Set(codes).size === codes.length).default([]),
    excludedCountries: z.array(z.string().refine(code => countryCodes.includes(code), 'Неизвестная страна'))
      .max(countryCodes.length).refine(codes => new Set(codes).size === codes.length)
  }).strict(),
  'privacy-policy': legalDocument,
  'personal-data-consent': legalDocument,
  favicon: z.object({ image: z.object({ src: imagePath }).strict() }).strict(),
  header: z.object({
    ...visibility,
    logo: localizedImage.extend({ srcEn: optionalImagePath.default(defaults.header.logo.srcEn) }),
    nav: z.array(link.extend({ href: safeHref.or(z.literal('')) })).max(20), registration: link,
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
  'hall-plan': z.object({
    ...visibility,
    title: localized, description: localized, placeholder: localized,
    image: localizedImage.extend({ src: optionalImagePath })
  }).strict(),
  schedule: z.object({
    ...visibility,
    title: localized, description: localized,
    button: z.object({ label: localized, href: safeHref.or(z.literal('')) }).strict()
  }).strict(),
  program: z.preprocess(value => {
    // Replace the legacy placeholder while preserving the saved title and visibility.
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value
    const { description, ...content } = value as Record<string, any>
    if (content.button?.href && typeof content.button.href === 'object') {
      content.button = { ...content.button, href: { ...content.button.href }, label: { ...content.button.label } }
      for (const locale of ['ru', 'en'] as const) {
        if (/^https?:\/\//.test(content.button.href[locale])) content.button.href[locale] = ''
        if ([locale === 'ru' ? 'Открыть программу' : 'View program', locale === 'ru' ? 'Скачать программу' : 'Download program'].includes(content.button.label[locale])) {
          content.button.label[locale] = defaults.program.button.label[locale]
        }
      }
    }
    return content
  }, z.object({
    ...visibility, title: localized,
    button: z.object({
      label: localized,
      href: z.object({
        ru: z.string().regex(/^\/api\/program-files\/[0-9a-f-]{36}$/).or(z.literal('')),
        en: z.string().regex(/^\/api\/program-files\/[0-9a-f-]{36}$/).or(z.literal(''))
      }).strict()
    }).strict().default(defaults.program.button)
  }).strict()),
  speakers: z.object({
    ...visibility,
    title: localized,
    speakers: z.array(z.object({
      fullName: localized, role: localized,
      image: z.object({ src: z.string().regex(/^\/(?!\/)/).max(2048), alt: localized }).strict()
    }).strict())
  }).strict(),
  packages: z.object({
    ...visibility,
    title: localized.default(defaults.packages.title),
    packages: z.array(z.object({ title: localized, description: localized }).strict())
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
    fields: z.preprocess(value => {
      if (!Array.isArray(value) || value.length !== 7 || value.some(row => row?.name === 'city')) return value
      // Extend previously saved forms without discarding their edited labels.
      return value.flatMap(row => row?.name === 'region'
        ? [{ ...row, layout: 'third' }, cityFormField]
        : [row?.name === 'birthDate' ? { ...row, layout: 'third' } : row])
    }, z.array(field).length(8).refine(rows =>
      fieldNames.every(name => rows.filter(row => row.name === name && row.id === name).length === 1)
      && rows.every(row => row.type === (row.name === 'birthDate' ? 'date' : row.name === 'email' ? 'email' : row.name === 'phone' ? 'tel' : 'text')),
    'Все восемь полей должны присутствовать с исходными именами и типами'))
  }).strict(),
  'alternative-forum': z.object({ ...visibility, title: localized, description: localized, button: link, image: z.object({ alt: localized }).strict() }).strict(),
  footer: z.object({
    ...visibility,
    image: localizedImage.extend({ src: optionalImagePath }).default(defaults.footer.image),
    email: z.email().max(254), address: localized, contacts: localized,
    legal: localized, privacy: link
  }).strict()
}
export type ContentSection = keyof typeof contentSchemas
export type SectionVisibility = Record<ContentSection, boolean>

export const contentSections: { id: ContentSection; label: string; icon: string }[] = [
  { id: 'site-layout', label: 'Порядок блоков', icon: 'i-lucide-grip-vertical' },
  { id: 'registration-delivery', label: 'Отправка писем по странам', icon: 'i-lucide-mail-check' },
  { id: 'favicon', label: 'Favicon / Иконка сайта', icon: 'i-lucide-image' },
  { id: 'header', label: 'Шапка сайта', icon: 'i-lucide-panel-top' },
  { id: 'hero', label: 'Первый экран', icon: 'i-lucide-layout-template' },
  { id: 'about', label: 'О форуме', icon: 'i-lucide-info' },
  { id: 'loft-hall', label: 'LoftHall / Площадка', icon: 'i-lucide-map-pin' },
  { id: 'hall-plan', label: 'Схема зала', icon: 'i-lucide-map' },
  { id: 'schedule', label: 'Расписание', icon: 'i-lucide-calendar-days' },
  { id: 'program', label: 'Программа', icon: 'i-lucide-list' },
  { id: 'speakers', label: 'Наши спикеры', icon: 'i-lucide-users' },
  { id: 'packages', label: 'Пакеты', icon: 'i-lucide-package' },
  { id: 'information-partners', label: 'Информационные партнеры', icon: 'i-lucide-handshake' },
  { id: 'registration-messages', label: 'Уведомления и письма', icon: 'i-lucide-mail' },
  { id: 'registration-form', label: 'Форма регистрации', icon: 'i-lucide-clipboard-list' },
  { id: 'alternative-forum', label: 'Альтернативная регистрация', icon: 'i-lucide-external-link' },
  { id: 'privacy-policy', label: 'Политика в отношении персональных данных', icon: 'i-lucide-file-text' },
  { id: 'personal-data-consent', label: 'Согласие на обработку ПДн', icon: 'i-lucide-file-check' },
  { id: 'footer', label: 'Подвал', icon: 'i-lucide-panel-bottom' }
]
export const isContentSection = (value: string): value is ContentSection => Object.hasOwn(contentSchemas, value)
