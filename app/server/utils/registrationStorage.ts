import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface RegistrationSubmissionInput {
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  region: string
  email: string
  phone: string
}

export interface RegistrationSubmission extends RegistrationSubmissionInput {
  id: string
  createdAt: string
}

const storagePath = join(process.cwd(), 'data', 'registrations.json')

const readSubmissionsFile = async () => {
  try {
    const content = await readFile(storagePath, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed as RegistrationSubmission[] : []
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export const listRegistrationSubmissions = async () => readSubmissionsFile()

export const saveRegistrationSubmission = async (input: RegistrationSubmissionInput) => {
  const submission: RegistrationSubmission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input
  }

  const submissions = await readSubmissionsFile()
  submissions.unshift(submission)

  await mkdir(dirname(storagePath), { recursive: true })
  const tempPath = `${storagePath}.${process.pid}.tmp`
  await writeFile(tempPath, `${JSON.stringify(submissions, null, 2)}\n`, 'utf8')
  await rename(tempPath, storagePath)

  return submission
}
