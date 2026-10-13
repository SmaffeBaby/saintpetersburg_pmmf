import * as XLSX from 'xlsx'
import { requireAdminSession } from '../../../utils/adminAuth'
import { listRegistrationSubmissions, type RegistrationSubmission } from '../../../utils/registrationStorage'

const matchesQuery = (submission: RegistrationSubmission, query: Record<string, any>) => {
  const search = String(query.search || '').trim().toLowerCase()
  const region = String(query.region || '').trim().toLowerCase()
  const dateFrom = String(query.dateFrom || '').trim()
  const dateTo = String(query.dateTo || '').trim()

  if (search) {
    const haystack = [
      submission.lastName,
      submission.firstName,
      submission.middleName,
      submission.email,
      submission.phone,
      submission.region
    ].join(' ').toLowerCase()

    if (!haystack.includes(search)) {
      return false
    }
  }

  if (region && !submission.region.toLowerCase().includes(region)) {
    return false
  }

  if (dateFrom && submission.createdAt < `${dateFrom}T00:00:00.000Z`) {
    return false
  }

  if (dateTo && submission.createdAt > `${dateTo}T23:59:59.999Z`) {
    return false
  }

  return true
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)
  const submissions = (await listRegistrationSubmissions()).filter((submission) => matchesQuery(submission, query))
  const rows = submissions.map((submission) => ({
    'Дата заявки': new Date(submission.createdAt).toLocaleString('ru-RU'),
    'Фамилия': submission.lastName,
    'Имя': submission.firstName,
    'Отчество': submission.middleName,
    'Дата рождения': submission.birthDate,
    'Регион': submission.region,
    'Email': submission.email,
    'Телефон': submission.phone,
    'ID': submission.id
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations')

  const exportedAt = new Date().toISOString().slice(0, 10)
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="pmmf-registrations-${exportedAt}.xlsx"`)

  return buffer
})
