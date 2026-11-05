import { countryCodes } from '../../../shared/utils/countries'
import { searchCities } from '../../utils/cities'

export default defineEventHandler(async event => {
  const params = getQuery(event)
  const country = typeof params.country === 'string' ? params.country : ''
  const locale = params.locale === 'en' ? 'en' : 'ru'
  const query = typeof params.q === 'string' ? params.q.trim() : ''
  if (!countryCodes.includes(country) || query.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid city search' })
  }
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return { items: await searchCities(country, query, locale) }
})
