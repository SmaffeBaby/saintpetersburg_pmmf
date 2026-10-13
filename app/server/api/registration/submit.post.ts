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

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
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
  await sendRegistrationEmails(submission)

  return {
    ok: true,
    submissionId: submission.id
  }
})
