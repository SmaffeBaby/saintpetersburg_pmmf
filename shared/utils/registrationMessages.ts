import type { RegistrationSubmission } from '../types/registration'

type Localized = { ru: string; en: string }
type EmailTemplate = { subject: Localized; title: Localized; message: Localized }

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]!)

export const renderEmailTemplate = (template: EmailTemplate, submission: RegistrationSubmission, locale: 'ru' | 'en') => {
  const values: Record<string, string> = {
    lastName: submission.lastName, firstName: submission.firstName, middleName: submission.middleName,
    birthDate: submission.birthDate, region: submission.region, email: submission.email, phone: submission.phone,
    createdAt: new Date(submission.createdAt).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-GB', { timeZone: 'Europe/Moscow' })
  }
  const interpolate = (value: Localized) => (value[locale] || value.ru)
    .replace(/\{\{(\w+)\}\}/g, (match, key: string) => Object.hasOwn(values, key) ? values[key]! : match)
  const subject = interpolate(template.subject).replace(/[\r\n]+/g, ' ')
  const title = interpolate(template.title)
  const message = interpolate(template.message)
  return {
    subject, title: escapeHtml(title), message: escapeHtml(message).replace(/\r?\n/g, '<br>'),
    text: `${title}\n\n${message}\n\n${Object.values(values).join('\n')}`
  }
}
