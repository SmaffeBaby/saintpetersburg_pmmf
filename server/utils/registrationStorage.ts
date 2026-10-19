import { randomUUID } from 'node:crypto'
import { getDatabase } from './database'
import type { RegistrationSubmission, RegistrationSubmissionInput } from '../../shared/types/registration'

export const listRegistrationSubmissions = async () => getDatabase()
  .prepare('SELECT * FROM registrations ORDER BY createdAt DESC, id DESC').all() as unknown as RegistrationSubmission[]

export const saveRegistrationSubmission = async (input: RegistrationSubmissionInput) => {
  const submission: RegistrationSubmission = { ...input, id: randomUUID(), createdAt: new Date().toISOString() }
  getDatabase().prepare('INSERT INTO registrations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    submission.id, submission.createdAt, input.lastName, input.firstName, input.middleName,
    input.birthDate, input.region, input.email, input.phone
  )
  return submission
}

export const deleteRegistrationSubmission = async (id: string) =>
  Number(getDatabase().prepare('DELETE FROM registrations WHERE id = ?').run(id).changes) > 0
