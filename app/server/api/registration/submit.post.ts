import { saveRegistrationSubmission, type RegistrationSubmissionInput } from '../../utils/registrationStorage'
import { sendRegistrationEmails } from '../../utils/registrationMailer'

const fields: Array<keyof RegistrationSubmissionInput> = [
  'lastName',
  'firstName',
  'middleName',
  'birthDate',
  'region',
  'email',
  'phone'
]

const normalizeValue = (value: unknown) => typeof value === 'string' ? value.trim() : ''

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const normalizeLocale = (value: unknown) => value === 'en' ? 'en' : 'ru'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const locale = normalizeLocale(body.locale)
  const input = fields.reduce((acc, field) => {
    acc[field] = normalizeValue(body[field])
    return acc
  }, {} as RegistrationSubmissionInput)

  const missingFields = fields.filter((field) => !input[field])
  if (missingFields.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please fill all required fields'
    })
  }

  if (!isValidEmail(input.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please enter a valid email'
    })
  }

  const submission = await saveRegistrationSubmission(input)
  let emailSent = true

  try {
    await sendRegistrationEmails(submission, locale)
  } catch (error) {
    emailSent = false
    console.error('[registration] Failed to send registration emails', error)
  }

  return {
    ok: true,
    submissionId: submission.id,
    emailSent
  }
})
