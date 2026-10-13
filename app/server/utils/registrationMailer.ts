import nodemailer from 'nodemailer'
import type { RegistrationSubmission } from './registrationStorage'

type RegistrationLocale = 'ru' | 'en'
type RegistrationField = keyof Omit<RegistrationSubmission, 'id' | 'createdAt'>

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const labels: Record<RegistrationLocale, Record<RegistrationField, string>> = {
  ru: {
    lastName: 'Фамилия',
    firstName: 'Имя',
    middleName: 'Отчество',
    birthDate: 'Дата рождения',
    region: 'Регион',
    email: 'Email',
    phone: 'Телефон'
  },
  en: {
    lastName: 'Last name',
    firstName: 'First name',
    middleName: 'Middle name',
    birthDate: 'Date of birth',
    region: 'Region',
    email: 'Email',
    phone: 'Phone'
  }
}

const submitterEmailContent: Record<RegistrationLocale, {
  subject: string
  title: string
  message: (notifyEmail: string) => string
}> = {
  ru: {
    subject: 'Ваша заявка на PMMF отправлена',
    title: 'Спасибо за регистрацию!',
    message: (notifyEmail) => `Мы получили вашу заявку и отправили данные организаторам на ${escapeHtml(notifyEmail)}.`
  },
  en: {
    subject: 'Your PMMF application has been sent',
    title: 'Thank you for registering!',
    message: (notifyEmail) => `We have received your application and sent the details to the organizers at ${escapeHtml(notifyEmail)}.`
  }
}

const adminLabels = labels.ru

const renderSubmissionRows = (submission: RegistrationSubmission, rowLabels: Record<RegistrationField, string>) => (Object.keys(rowLabels) as RegistrationField[])
  .map((key) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #ece6f8;color:#6b6175;">${rowLabels[key]}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #ece6f8;color:#22172f;font-weight:600;">${escapeHtml(submission[key])}</td>
    </tr>
  `)
  .join('')

const createTransporter = () => {
  const config = useRuntimeConfig()
  const host = String(config.smtpHost).trim()
  const user = String(config.smtpUser).trim()
  const pass = String(config.smtpPass).trim()

  if (!host || !user || !pass) {
    throw createError({ statusCode: 500, statusMessage: 'SMTP is not configured' })
  }

  return nodemailer.createTransport({
    host,
    port: Number(config.smtpPort),
    secure: (config.smtpSecure as unknown) === true || String(config.smtpSecure).trim() === 'true',
    auth: {
      user,
      pass
    }
  })
}

export const sendRegistrationEmails = async (submission: RegistrationSubmission, locale: RegistrationLocale = 'ru') => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()
  const from = String(config.smtpFrom || config.smtpUser).trim()
  const notifyEmail = String(config.projectRequestNotifyEmail || config.smtpUser).trim()
  const submitterContent = submitterEmailContent[locale]

  const adminTable = `
    <table style="border-collapse:collapse;width:100%;max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tbody>${renderSubmissionRows(submission, adminLabels)}</tbody>
    </table>
  `
  const submitterTable = `
    <table style="border-collapse:collapse;width:100%;max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tbody>${renderSubmissionRows(submission, labels[locale])}</tbody>
    </table>
  `

  await transporter.sendMail({
    from,
    to: notifyEmail,
    replyTo: submission.email,
    subject: `Новая регистрация PMMF: ${submission.lastName} ${submission.firstName}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f7f2ff;padding:24px;">
        <h1 style="margin:0 0 16px;color:#892af0;">Новая заявка на регистрацию</h1>
        <p style="color:#4b4059;">Дата отправки: ${new Date(submission.createdAt).toLocaleString('ru-RU')}</p>
        ${adminTable}
      </div>
    `
  })

  await transporter.sendMail({
    from,
    to: submission.email,
    subject: submitterContent.subject,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f7f2ff;padding:24px;">
        <h1 style="margin:0 0 16px;color:#892af0;">${submitterContent.title}</h1>
        <p style="color:#4b4059;font-size:16px;line-height:1.5;">
          ${submitterContent.message(notifyEmail)}
        </p>
        ${submitterTable}
      </div>
    `
  })
}
