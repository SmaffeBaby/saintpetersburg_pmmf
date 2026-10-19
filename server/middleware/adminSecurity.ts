import { getRequestHeader, getRequestURL } from 'h3'
export default defineEventHandler(event => {
  if (!event.path.startsWith('/api/admin/')) return
  setHeader(event, 'Cache-Control', 'no-store')
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method)) return
  const origin = getRequestHeader(event, 'origin')
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  let invalidOrigin = false
  if (origin) {
    try { invalidOrigin = new URL(origin).host !== getRequestURL(event).host }
    catch { invalidOrigin = true }
  }
  if (fetchSite === 'cross-site' || invalidOrigin) {
    throw createError({ statusCode: 403, statusMessage: 'Cross-origin request denied' })
  }
})
