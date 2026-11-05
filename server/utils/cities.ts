import { gunzipSync } from 'node:zlib'
import type { CityOption } from '../../shared/types/city'

// Compact GeoNames rows: ID, original name, aliases, region, admin code, population, RU city/region, EN city/region.
type CityRow = [string, string, string, string, string, number, string, string, string, string]
const cache = new Map<string, Promise<{ row: CityRow; search: string }[]>>()
export const normalizeCitySearch = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/ё/g, 'е')
const loadCountryCities = (country: string) => {
  let promise = cache.get(country)
  if (promise) { cache.delete(country); cache.set(country, promise); return promise }
  promise = (async () => {
    const data = await useStorage('assets:server').getItemRaw<Buffer>(`cities/${country}.json.gz`)
    if (!data) return []
    const rows = JSON.parse(gunzipSync(data).toString('utf8')) as CityRow[]
    return rows.map(row => ({ row, search: normalizeCitySearch(`${row[1]},${row[2]},${row[6]},${row[8]}`) }))
  })()
  cache.set(country, promise)
  promise.catch(() => cache.delete(country))
  // Bound memory across countries; datasets remain bundled with the server.
  if (cache.size > 8) cache.delete(cache.keys().next().value!)
  return promise
}
export const searchCities = async (country: string, query: string, locale: 'ru' | 'en' = 'ru'): Promise<CityOption[]> => {
  const rows = await loadCountryCities(country === 'GB-ENG' ? 'GB' : country)
  const search = normalizeCitySearch(query.trim())
  const results: CityOption[] = []
  for (const { row, search: searchableNames } of rows) {
    if (country === 'GB-ENG' && row[4] !== 'ENG') continue
    if (search && !searchableNames.includes(search)) continue
    const region = row[3] === row[1] ? '' : row[3]
    const cityNames = { ru: row[6] || row[1], en: row[8] || row[1] }
    const regionNames = { ru: row[7] || '', en: row[9] || row[3] }
    const names = Object.fromEntries((['ru', 'en'] as const).map(language => {
      const area = regionNames[language]
      return [language, area && area !== cityNames[language] ? `${cityNames[language]}, ${area}` : cityNames[language]]
    })) as { ru: string; en: string }
    const description = regionNames[locale] === cityNames[locale] ? '' : regionNames[locale]
    results.push({ id: row[0], label: cityNames[locale], value: region ? `${row[1]}, ${region}` : row[1], description, names })
    if (results.length === 50) break
  }
  return results
}
