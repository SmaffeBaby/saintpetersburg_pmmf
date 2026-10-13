import nodemailer from 'nodemailer'
import type { RegistrationSubmission } from './registrationStorage'

const labels: Record<keyof Omit<RegistrationSubmission, 'id' | 'createdAt'>, string> = {
  lastName: 'Фамилия',
  firstName: 'Имя',
  middleName: 'Отчество',
  birthDate: 'Дата рождения',
  region: 'Регион',
  email: 'Email',
  phone: 'Телефон'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const renderSubmissionRows = (submission: RegistrationSubmission) => (Object.keys(labels) as Array<keyof typeof labels>)
  .map((key) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #ece6f8;color:#6b6175;">${labels[key]}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #ece6f8;color:#22172f;font-weight:600;">${escapeHtml(submission[key])}</td>
    </tr>
  `)
  .join('')

const createTransporter = () => {
  const config = useRuntimeConfig()
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    throw createError({ statusCode: 500, statusMessage: 'SMTP is not configured' })
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: Boolean(config.smtpSecure),
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })
}

export const sendRegistrationEmails = async (submission: RegistrationSubmission) => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()
  const from = config.smtpFrom || config.smtpUser
  const notifyEmail = config.projectRequestNotifyEmail || config.smtpUser

  const table = `
    <table style="border-collapse:collapse;width:100%;max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tbody>${renderSubmissionRows(submission)}</tbody>
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
        ${table}
      </div>
    `
  })

  await transporter.sendMail({
    from,
    to: submission.email,
    subject: 'Ваша заявка на PMMF отправлена',
    html: `
      <div style="font-family:Arial,sans-serif;background:#f7f2ff;padding:24px;">
        <h1 style="margin:0 0 16px;color:#892af0;">Спасибо за регистрацию!</h1>
        <p style="color:#4b4059;font-size:16px;line-height:1.5;">
          Мы получили вашу заявку и отправили данные организаторам на ${escapeHtml(String(notifyEmail))}.
        </p>
        ${table}
      </div>
    `
  })
}
