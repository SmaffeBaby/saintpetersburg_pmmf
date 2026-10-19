import { saveRegistrationSubmission } from '../../utils/registrationStorage'
import type { RegistrationSubmissionInput } from '../../../shared/types/registration'
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
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  const locale = normalizeLocale(body.locale)
  const input = fields.reduce((acc, field) => {
    acc[field] = normalizeValue(body[field])
    return acc
  }, {} as RegistrationSubmissionInput)

  if (fields.some(field => input[field].length > 500)) throw createError({ statusCode: 400, statusMessage: 'Field is too long' })

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
