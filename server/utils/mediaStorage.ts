import { randomUUID } from 'node:crypto'
import { getDatabase } from './database'

export const maxImageBytes = 5 * 1024 * 1024

// SVGs stay external images. Reject active content and external resources;
// the media response also isolates direct navigation with a sandboxed CSP.
const isPassiveSvg = (data: Buffer) => {
  const source = data.toString('utf8').replace(/^\uFEFF/, '').trim()
  if (!/^(?:<\?xml\s[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b[^>]*\bxmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(source)
    || !/<\/svg>\s*$/i.test(source)) return false
  return !/<!\s*(?:DOCTYPE|ENTITY)|<\?(?!xml\s)|<\s*\/?\s*(?:[\w.-]+:)?(?:script|foreignObject|iframe|object|embed|a|animate\w*|set|discard)\b|\s(?:[\w.-]+:)?on[\w.-]+\s*=|\sxml:base\s*=|\s(?:[\w.-]+:)?href\s*=\s*(?!["']#)["']|@import|url\(\s*(?!["']?#)/i.test(source)
}

// Determine the type from the file contents rather than trusting the filename.
export const detectImageType = (data: Buffer): string | undefined => {
  if (data.length >= 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && data.toString('ascii', 12, 16) === 'IHDR') return 'image/png'
  if (data.length >= 4 && data[0] === 255 && data[1] === 216 && data[2] === 255) return 'image/jpeg'
  if (data.length >= 12 && ['GIF87a', 'GIF89a'].includes(data.toString('ascii', 0, 6))) return 'image/gif'
  if (data.length >= 16 && data.toString('ascii', 0, 4) === 'RIFF'
    && data.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (isPassiveSvg(data)) return 'image/svg+xml'
}

export const saveImage = (data: Buffer) => {
  if (!data.length || data.length > maxImageBytes) throw createError({ statusCode: 413, statusMessage: 'Image must be between 1 byte and 5 MB' })
  const mimeType = detectImageType(data)
  if (!mimeType) throw createError({ statusCode: 415, statusMessage: 'Only passive SVG, JPEG, PNG, WebP and GIF images are supported' })
  const id = randomUUID()
  getDatabase().prepare('INSERT INTO media (id, mimeType, data, createdAt) VALUES (?, ?, ?, ?)')
    .run(id, mimeType, data, new Date().toISOString())
  return { id, src: `/api/media/${id}` }
}
