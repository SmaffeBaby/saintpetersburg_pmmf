import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { contentSchemas } from '../../shared/config/content'
import { getDatabase } from './database'
import { getContentRecord } from './siteContent'
import { detectImageType, maxImageBytes } from './mediaStorage'

export const maxSpeakersTransferBytes = 300 * 1024 * 1024
const assetSource = z.string().max(2048).refine(value =>
  /^\/api\/media\/[0-9a-f-]{36}$/.test(value)
  || (/^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.split('/').includes('..')))
const bundleSchema = z.object({
  format: z.literal('saint-mmf-speakers'),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  content: contentSchemas.speakers,
  assets: z.array(z.object({
    src: assetSource,
    mimeType: z.string().max(100),
    data: z.string().max(Math.ceil(maxImageBytes / 3) * 4)
  }).strict()).max(1000)
}).strict()

export const exportSpeakers = async (loadStatic: (src: string) => Promise<Buffer>) => {
  const content = contentSchemas.speakers.parse(JSON.parse(getContentRecord('speakers').content))
  const sources = [...new Set(content.speakers.map(speaker => speaker.image.src))]
  const assets = []
  let bytes = 0
  for (const src of sources) {
    if (!assetSource.safeParse(src).success) throw createError({ statusCode: 422, statusMessage: 'Unsupported speaker image path' })
    let data: Buffer
    if (src.startsWith('/api/media/')) {
      const row = getDatabase().prepare('SELECT data FROM media WHERE id = ?').get(src.split('/').pop()!) as
        { data: Uint8Array } | undefined
      if (!row) throw createError({ statusCode: 422, statusMessage: 'Speaker image is missing' })
      data = Buffer.from(row.data)
    } else {
      try { data = await loadStatic(src) }
      catch { throw createError({ statusCode: 422, statusMessage: 'Speaker image is missing' }) }
    }
    const mimeType = detectImageType(data)
    if (!mimeType || data.length > maxImageBytes) throw createError({ statusCode: 422, statusMessage: 'Invalid speaker image' })
    const encoded = data.toString('base64')
    bytes += encoded.length
    if (bytes > maxSpeakersTransferBytes) throw createError({ statusCode: 413, statusMessage: 'Speakers export exceeds 300 MB' })
    assets.push({ src, mimeType, data: encoded })
  }
  const bundle = { format: 'saint-mmf-speakers', version: 1, exportedAt: new Date().toISOString(), content, assets }
  const json = JSON.stringify(bundle)
  if (Buffer.byteLength(json) > maxSpeakersTransferBytes || assets.length > 1000) {
    throw createError({ statusCode: 413, statusMessage: 'Speakers export exceeds transfer limits' })
  }
  return json
}

export const importSpeakers = (input: unknown) => {
  const parsed = bundleSchema.safeParse(input)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid speakers export file' })
  const { content, assets } = parsed.data
  const sources = new Set(content.speakers.map(speaker => speaker.image.src))
  if (assets.length !== sources.size || new Set(assets.map(asset => asset.src)).size !== assets.length
    || assets.some(asset => !sources.has(asset.src))) {
    throw createError({ statusCode: 400, statusMessage: 'Include exactly one image for every referenced source' })
  }
  // Validate every image before writing anything; never fetch URLs from an import.
  const images = assets.map(asset => {
    const data = Buffer.from(asset.data, 'base64')
    const mimeType = detectImageType(data)
    if (!data.length || data.length > maxImageBytes || data.toString('base64') !== asset.data || !mimeType || mimeType !== asset.mimeType) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid image in speakers export' })
    }
    return { source: asset.src, id: randomUUID(), data, mimeType }
  })
  const db = getDatabase()
  const mapping = new Map(images.map(image => [image.source, `/api/media/${image.id}`]))
  const result = {
    ...content,
    speakers: content.speakers.map(speaker => ({ ...speaker, image: { ...speaker.image, src: mapping.get(speaker.image.src)! } }))
  }
  db.exec('BEGIN IMMEDIATE')
  try {
    const insert = db.prepare('INSERT INTO media(id, mimeType, data, createdAt) VALUES (?, ?, ?, ?)')
    for (const image of images) insert.run(image.id, image.mimeType, image.data, new Date().toISOString())
    db.exec('COMMIT')
  } catch (error) { db.exec('ROLLBACK'); throw error }
  return result
}
