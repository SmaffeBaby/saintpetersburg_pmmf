import { randomUUID } from 'node:crypto'
import { getDatabase } from './database'

export const maxProgramBytes = 5 * 1024 * 1024

export const saveProgramPdf = (data: Buffer) => {
  if (!data.length || data.length > maxProgramBytes) {
    throw createError({ statusCode: 413, statusMessage: 'PDF must be between 1 byte and 5 MB' })
  }
  if (!/^%PDF-[12]\.\d/.test(data.toString('ascii', 0, 8))
    || !/%%EOF\s*$/.test(data.subarray(-1024).toString('latin1'))) {
    throw createError({ statusCode: 415, statusMessage: 'Upload a PDF document' })
  }
  const id = randomUUID()
  getDatabase().prepare('INSERT INTO media(id, mimeType, data, createdAt) VALUES (?, ?, ?, ?)')
    .run(id, 'application/pdf', data, new Date().toISOString())
  return { id, src: `/api/program-files/${id}` }
}
