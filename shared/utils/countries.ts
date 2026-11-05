// ISO 3166-1 countries and territories; England is also selectable separately.
export const countryCodes = ("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split(' ').concat('GB-ENG')
const names = { ru: new Intl.DisplayNames(['ru'], { type: 'region' }), en: new Intl.DisplayNames(['en'], { type: 'region' }) }
export const countryName = (code: string, locale: 'ru' | 'en' = 'ru') => code === 'GB-ENG'
  ? (locale === 'ru' ? 'Англия' : 'England') : names[locale].of(code) || code
export const countryFlag = (code: string) => code === 'GB-ENG'
  ? '🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}'
  : String.fromCodePoint(...[...code].map(letter => 127397 + letter.charCodeAt(0)))
export const countryItems = (locale: 'ru' | 'en' = 'ru') => countryCodes.map(code => ({
  code, label: countryName(code, locale), flag: countryFlag(code),
  search: `${countryName(code, 'ru')} ${countryName(code, 'en')} ${code}`
})).sort((a, b) => a.label.localeCompare(b.label, locale))
// Accept names for compatibility with existing clients, but resolve rules to a stable code.
export const resolveCountryCode = (value: string) => {
  const normalized = value.trim().toLocaleLowerCase()
  return countryCodes.find(code => [code, countryName(code, 'ru'), countryName(code, 'en')]
    .some(name => name.toLocaleLowerCase() === normalized))
}
export interface RegistrationDeliveryPolicy {
  participantEmailMode: 'all' | 'except' | 'only'
  excludedCountries: string[]
  includedCountries: string[]
}
export const shouldSendParticipantEmail = (region: string, policy: RegistrationDeliveryPolicy) => {
  const code = resolveCountryCode(region)
  if (policy.participantEmailMode === 'all') return true
  if (policy.participantEmailMode === 'only') return !!code && policy.includedCountries.includes(code)
  return !code || !policy.excludedCountries.includes(code)
}
