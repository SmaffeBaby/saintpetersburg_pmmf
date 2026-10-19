import Redis from 'ioredis'

let client: Redis | undefined
let retryAt = 0
const getClient = () => {
  const url = useRuntimeConfig().redisUrl
  if (!url || Date.now() < retryAt) return
  if (!client) {
    client = new Redis(url, { lazyConnect: true, connectTimeout: 500, commandTimeout: 500, maxRetriesPerRequest: 0, retryStrategy: () => null, enableOfflineQueue: false })
    client.on('error', () => {})
  }
  return client
}

// Revision is read from SQLite, so even an unavailable Redis cannot resurrect old content.
export const cachedContent = async <T>(key: string, load: () => T): Promise<T> => {
  const redis = getClient()
  if (!redis) return load()
  try {
    if (redis.status === 'wait') await redis.connect()
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached) as T
    const value = load()
    await redis.set(key, JSON.stringify(value), 'EX', 300)
    return value
  } catch {
    retryAt = Date.now() + 30000
    client?.disconnect()
    client = undefined
    return load()
  }
}
