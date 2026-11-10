import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { DatabaseSync } from 'node:sqlite'
import * as XLSX from 'xlsx'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const directory = await mkdtemp(join(tmpdir(), 'mmf-http-test-'))
const base = 'http://127.0.0.1:3097'
let server
const deliveries = []
const messageBodies = []
// Local SMTP sink: verify the actual recipient envelopes without sending real mail.
const smtp = createServer(socket => {
  socket.setEncoding('utf8')
  socket.write('220 localhost test SMTP\r\n')
  let buffer = '', data = false, recipients = [], message = []
  socket.on('data', chunk => {
    buffer += chunk
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n')
      const line = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      if (data) {
        if (line === '.') { deliveries.push([...recipients]); messageBodies.push(message.join('\n')); data = false; socket.write('250 accepted\r\n') }
        else message.push(line)
      } else if (/^EHLO|^HELO/.test(line)) socket.write('250-localhost\r\n250 AUTH PLAIN\r\n')
      else if (/^AUTH/.test(line)) socket.write('235 authenticated\r\n')
      else if (/^MAIL FROM:/.test(line)) { recipients = []; socket.write('250 ok\r\n') }
      else if (/^RCPT TO:/.test(line)) { recipients.push(line.match(/<([^>]+)>/)[1]); socket.write('250 ok\r\n') }
      else if (line === 'DATA') { data = true; message = []; socket.write('354 send data\r\n') }
      else if (line === 'QUIT') socket.end('221 bye\r\n')
      else socket.write('250 ok\r\n')
    }
  })
})
await new Promise(resolve => smtp.listen(0, '127.0.0.1', resolve))
const start = async () => {
  server = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, NITRO_HOST: '127.0.0.1', NITRO_PORT: '3097',
      NUXT_DATABASE_PATH: join(directory, 'test.sqlite'), NUXT_REDIS_URL: '',
      NUXT_ADMIN_PASSWORD: 'integration-password', NUXT_ADMIN_SESSION_SECRET: 'integration-secret',
      NUXT_SMTP_HOST: '127.0.0.1', NUXT_SMTP_PORT: String(smtp.address().port), NUXT_SMTP_SECURE: 'false',
      NUXT_SMTP_USER: 'test@example.org', NUXT_SMTP_PASS: 'test', NUXT_SMTP_FROM: 'test@example.org' },
    stdio: 'ignore'
  })
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited with code ${server.exitCode}`)
    try { if ((await fetch(`${base}/api/content/registration-messages`)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Server did not start')
}
const stop = async () => {
  if (!server || server.exitCode !== null) return
  await new Promise(resolve => { server.once('exit', resolve); server.kill('SIGTERM') })
}
try {
  // Start from an actual pre-city database and pre-city saved form.
  const legacy = new DatabaseSync(join(directory, 'test.sqlite'))
  legacy.exec(`CREATE TABLE registrations (id TEXT PRIMARY KEY, createdAt TEXT NOT NULL, lastName TEXT NOT NULL, firstName TEXT NOT NULL, middleName TEXT NOT NULL, birthDate TEXT NOT NULL, region TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL) STRICT;
    CREATE TABLE site_content(section TEXT PRIMARY KEY, content TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updatedAt TEXT NOT NULL) STRICT;`)
  legacy.prepare('INSERT INTO registrations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('legacy-record', '2026-01-01T00:00:00.000Z', 'Legacy', 'Person', 'Test', '2000-01-01', 'Old region', 'old@example.org', '+70000000000')
  const defaults = JSON.parse(await readFile(new URL('../shared/config/content-defaults.json', import.meta.url), 'utf8'))
  const legacyForm = defaults['registration-form']
  legacyForm.fields = legacyForm.fields.filter(field => field.name !== 'city')
  legacyForm.fields.find(field => field.name === 'region').label.ru = 'Ваш регион (из админки)'
  legacy.prepare('INSERT INTO site_content(section, content, updatedAt) VALUES (?, ?, ?)').run('registration-form', JSON.stringify(legacyForm), '2026-01-01T00:00:00.000Z')
  const legacyOrder = defaults['site-layout'].order.filter(block => block !== 'packages')
  ;[legacyOrder[0], legacyOrder[1]] = [legacyOrder[1], legacyOrder[0]]
  legacy.prepare('INSERT INTO site_content(section, content, updatedAt) VALUES (?, ?, ?)').run('site-layout', JSON.stringify({ order: legacyOrder }), '2026-01-01T00:00:00.000Z')
  legacy.close()
  await start()
  assert.equal((await fetch(`${base}/api/admin/content/registration-messages`)).status, 401)
  const login = await fetch(`${base}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'integration-password' })
  })
  assert.equal(login.status, 200)
  const headers = { Cookie: login.headers.get('set-cookie').split(';')[0] }
  const record = await (await fetch(`${base}/api/admin/content/registration-messages`, { headers })).json()
  record.content.successTitle.ru = 'Тестовое подтверждение'
  const save = await fetch(`${base}/api/admin/content/registration-messages`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(record)
  })
  assert.equal(save.status, 200)
  const publicContent = await (await fetch(`${base}/api/content/registration-messages`)).json()
  assert.equal(publicContent.successTitle.ru, record.content.successTitle.ru)
  const putContent = (section, record) => fetch(`${base}/api/admin/content/${section}`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(record)
  })
  assert.equal((await fetch(`${base}/api/admin/content/site-layout`)).status, 401)
  const layout = await (await fetch(`${base}/api/admin/content/site-layout`, { headers })).json()
  const migratedOrder = [...legacyOrder]
  migratedOrder.splice(migratedOrder.indexOf('speakers') + 1, 0, 'packages')
  assert.deepEqual(layout.content.order, migratedOrder)
  const originalOrder = [...layout.content.order]
  const registrationIndex = layout.content.order.indexOf('registration-form')
  const alternativeIndex = layout.content.order.indexOf('alternative-forum')
  ;[layout.content.order[registrationIndex], layout.content.order[alternativeIndex]] = [layout.content.order[alternativeIndex], layout.content.order[registrationIndex]]
  assert.equal((await putContent('site-layout', { ...layout, content: { order: ['hero', ...originalOrder.slice(1, -1), 'hero'] } })).status, 400)
  const layoutSave = await putContent('site-layout', layout)
  assert.equal(layoutSave.status, 200)
  assert.equal((await putContent('site-layout', layout)).status, 409)
  const reordered = await (await fetch(`${base}/`)).text()
  assert.ok(reordered.indexOf('data-site-block="alternative-forum"') < reordered.indexOf('data-site-block="registration-form"'))
  assert.ok(reordered.indexOf('data-site-block="speakers"') < reordered.indexOf('data-site-block="packages"'))
  assert.ok(reordered.includes('Пакет «Участник»'))
  assert.ok(reordered.includes('Пакет «Гость»'))
  assert.equal((await fetch(`${base}/api/admin/content/packages`)).status, 401)
  let packages = await (await fetch(`${base}/api/admin/content/packages`, { headers })).json()
  packages.content.packages.reverse()
  packages.content.packages[0].title = { ru: 'Тестовый пакет', en: 'Test package' }
  packages.content.packages[0].description = { ru: 'Строка 1\nСтрока 2', en: 'Line 1\nLine 2' }
  const savedPackages = await putContent('packages', packages)
  assert.equal(savedPackages.status, 200)
  packages = await savedPackages.json()
  assert.deepEqual(await (await fetch(`${base}/api/content/packages`)).json(), packages.content)
  const packagePage = await (await fetch(`${base}/`)).text()
  assert.ok(packagePage.indexOf('Тестовый пакет') < packagePage.indexOf('Пакет «Участник»'))
  assert.ok(packagePage.includes('Строка 1\nСтрока 2'))
  packages.content.visible = false
  const hiddenPackages = await putContent('packages', packages)
  assert.equal(hiddenPackages.status, 200)
  packages = await hiddenPackages.json()
  assert.equal((await (await fetch(`${base}/api/content/visibility`)).json()).packages, false)
  assert.ok(!(await (await fetch(`${base}/`)).text()).includes('data-site-block="packages"'))
  packages.content.visible = true
  const visiblePackages = await putContent('packages', packages)
  assert.equal(visiblePackages.status, 200)
  packages = await visiblePackages.json()
  const delivery = await (await fetch(`${base}/api/admin/content/registration-delivery`, { headers })).json()
  delivery.content = { organizerEmail: 'info.crbi@mail.ru', participantEmailMode: 'except', includedCountries: [], excludedCountries: ['GB-ENG', 'DE'] }
  assert.equal((await putContent('registration-delivery', { ...delivery, content: { ...delivery.content, excludedCountries: ['INVALID'] } })).status, 400)
  assert.equal((await putContent('registration-delivery', delivery)).status, 200)
  const upgradedForm = await (await fetch(`${base}/api/content/registration-form`)).json()
  assert.equal(upgradedForm.fields.length, 8)
  assert.equal(upgradedForm.fields.find(field => field.name === 'city').label.ru, 'Ваш город')
  assert.equal(upgradedForm.fields.find(field => field.name === 'region').label.ru, 'Ваш регион (из админки)')
  const citySearch = async (country, q, locale = 'ru') => (await (await fetch(`${base}/api/locations/cities?${new URLSearchParams({ country, q, locale })}`)).json()).items
  const moscow = await citySearch('RU', 'Москва')
  assert.equal(moscow.find(city => city.id === '524901').label, 'Москва')
  assert.equal(moscow.find(city => city.id === '524901').names.ru, 'Москва')
  assert.equal((await citySearch('RU', 'Москва', 'en')).find(city => city.id === '524901').label, 'Moscow')
  assert.equal((await citySearch('GB-ENG', 'Лондон')).find(city => city.id === '2643743').label, 'Лондон')
  assert.equal((await citySearch('FR', 'Paris')).find(city => city.id === '2988507').label, 'Париж')
  assert.ok(moscow.length <= 50)
  assert.ok((await citySearch('GB-ENG', 'London')).some(city => city.id === '2643743'))
  assert.ok(!(await citySearch('GB-ENG', 'Edinburgh')).some(city => city.id === '2650225'))
  assert.ok((await citySearch('GB', 'Edinburgh')).some(city => city.id === '2650225'))
  assert.ok(!(await citySearch('FR', 'London')).some(city => city.id === '2643743'))
  assert.equal((await fetch(`${base}/api/locations/cities?country=../../etc/passwd`)).status, 400)
  assert.equal((await fetch(`${base}/api/locations/cities?country=RU&q=${'a'.repeat(201)}`)).status, 400)
  const applicant = { city: 'Test-City-123', lastName: 'Test', firstName: 'Participant', middleName: 'Test', birthDate: '2000-01-01', email: 'participant@example.org', phone: '+70000000000' }
  const submit = (region, locale = 'ru') => fetch(`${base}/api/registration/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...applicant, region, locale })
  })
  assert.equal((await submit('Invalid country')).status, 400)
  assert.equal((await fetch(`${base}/api/registration/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...applicant, region: 'RU', city: '' }) })).status, 400)
  for (const region of ['GB-ENG', 'England', 'Англия', 'DE']) {
    const result = await (await submit(region, 'en')).json()
    assert.equal(result.emailSent, true)
    assert.equal(result.participantEmailSuppressed, true)
    assert.deepEqual(deliveries.splice(0), [['info.crbi@mail.ru']])
  }
  for (const region of ['RU', 'GB']) {
    const result = await (await submit(region)).json()
    assert.equal(result.participantEmailSuppressed, false)
    assert.equal(result.emailSent, true)
    assert.deepEqual(deliveries.splice(0), [['info.crbi@mail.ru'], ['participant@example.org']])
  }
  let deliveryRecord = await (await fetch(`${base}/api/admin/content/registration-delivery`, { headers })).json()
  for (const includedCountries of [[], ['RU'], ['RU', 'DE']]) {
    deliveryRecord.content.participantEmailMode = 'only'
    deliveryRecord.content.includedCountries = includedCountries
    const savedDelivery = await putContent('registration-delivery', deliveryRecord)
    assert.equal(savedDelivery.status, 200)
    deliveryRecord = await savedDelivery.json()
    for (const region of ['RU', 'DE', 'GB-ENG']) {
      const result = await (await submit(region)).json()
      const allowed = includedCountries.includes(region)
      assert.equal(result.emailSent, true)
      assert.equal(result.participantEmailSuppressed, !allowed)
      assert.deepEqual(deliveries.splice(0), allowed ? [['info.crbi@mail.ru'], ['participant@example.org']] : [['info.crbi@mail.ru']])
    }
  }
  deliveryRecord.content.participantEmailMode = 'all'
  const allSave = await putContent('registration-delivery', deliveryRecord)
  assert.equal(allSave.status, 200)
  const allResult = await (await submit('GB-ENG')).json()
  assert.equal(allResult.participantEmailSuppressed, false)
  assert.deepEqual(deliveries.splice(0), [['info.crbi@mail.ru'], ['participant@example.org']])
  deliveryRecord = await allSave.json()
  deliveryRecord.content = delivery.content
  assert.equal((await putContent('registration-delivery', deliveryRecord)).status, 200)
  const registrations = await (await fetch(`${base}/api/admin/registrations`, { headers })).json()
  assert.equal(registrations.items.length, 17)
  assert.ok(registrations.items.some(row => row.region === 'Англия'))
  assert.equal(registrations.items.find(row => row.id === 'legacy-record').city, '')
  assert.ok(registrations.items.filter(row => row.id !== 'legacy-record').every(row => row.city === applicant.city))
  assert.ok(messageBodies.every(message => message.includes(applicant.city)))
  const exportResponse = await fetch(`${base}/api/admin/registrations/export?search=${applicant.city}`, { headers })
  assert.equal(exportResponse.status, 200)
  const workbook = XLSX.read(new Uint8Array(await exportResponse.arrayBuffer()), { type: 'array' })
  const exportedRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
  assert.equal(exportedRows.length, 16)
  assert.ok(exportedRows.every(row => row['Город'] === applicant.city))
  const initialPage = await (await fetch(`${base}/`)).text()
  assert.match(initialPage, /rel="icon"[^>]*href="\/images\/favicon\.svg"/)
  assert.doesNotMatch(initialPage, /href="\/Favicon\.svg"/)
  for (const route of ['privacy-policy', 'personal-data-consent']) {
    assert.match(initialPage, new RegExp(`href="/${route}"[^>]*target="_blank"`))
  }
  assert.match(initialPage, /href="\/personal-data-consent"[^>]*>[\s\S]*?персональных данных[\s\S]*?<\/a>/)
  assert.ok(initialPage.includes('Политика в отношении персональных данных'))
  const legalDefaults = JSON.parse(await readFile(new URL('../shared/config/legal-defaults.json', import.meta.url), 'utf8'))
  const savedLegal = {}
  for (const [section, expected] of Object.entries(legalDefaults)) {
    const contentRecord = await (await fetch(`${base}/api/admin/content/${section}`, { headers })).json()
    assert.deepEqual(contentRecord.content, expected)
    const page = await fetch(`${base}/${section}`)
    assert.equal(page.status, 200)
    const html = await page.text()
    assert.ok(html.includes(`<title>${expected.title.ru}</title>`))
    assert.match(html, /<header\b/)
    assert.match(html, /href="\/#registration"/)
    assert.match(html, /href="\/#schedule"/)
    assert.equal((html.match(/<h2\b/g) || []).length, section === 'privacy-policy' ? 17 : 12)
    contentRecord.content.title = { ru: `Обновлённый документ ${section}`, en: `Updated document ${section}` }
    contentRecord.content.body = {
      ru: `## Проверка сохранения\n\n<script>alert(1)</script>\n\n${expected.body.ru}`,
      en: `## Updated text\n\n${expected.body.en}`
    }
    assert.equal((await fetch(`${base}/api/admin/content/${section}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contentRecord)
    })).status, 401)
    const response = await fetch(`${base}/api/admin/content/${section}`, {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(contentRecord)
    })
    assert.equal(response.status, 200, await response.clone().text())
    savedLegal[section] = contentRecord.content
    const updated = await (await fetch(`${base}/${section}`)).text()
    assert.ok(updated.includes(`<title>${contentRecord.content.title.ru}</title>`))
    assert.ok(updated.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
    assert.ok(!updated.includes('<script>alert(1)</script>'))
  }
  const defaultFavicon = await fetch(`${base}/images/favicon.svg`)
  assert.equal(defaultFavicon.status, 200)
  assert.deepEqual(Buffer.from(await defaultFavicon.arrayBuffer()), await readFile(new URL('../public/images/favicon.svg', import.meta.url)))
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=', 'base64')
  const form = new FormData()
  form.append('file', new Blob([image], { type: 'image/png' }), 'test.png')
  assert.equal((await fetch(`${base}/api/admin/media`, { method: 'POST', body: form })).status, 401)
  const upload = await fetch(`${base}/api/admin/media`, { method: 'POST', headers, body: form })
  assert.equal(upload.status, 201, await upload.clone().text())
  const media = await upload.json()
  const downloaded = await fetch(`${base}${media.src}`)
  assert.equal(downloaded.headers.get('content-type'), 'image/png')
  assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), image)
  let svgMedia
  for (const filename of ['header-logo-en.svg', 'hero-logo-en.svg', 'favicon.svg']) {
    const svg = await readFile(new URL(`../public/images/${filename}`, import.meta.url))
    const svgForm = new FormData()
    svgForm.append('file', new Blob([svg], { type: 'image/svg+xml' }), filename)
    const response = await fetch(`${base}/api/admin/media`, { method: 'POST', headers, body: svgForm })
    assert.equal(response.status, 201, await response.clone().text())
    svgMedia = await response.json()
    const asset = await fetch(`${base}${svgMedia.src}`)
    assert.equal(asset.headers.get('content-type'), 'image/svg+xml')
    assert.match(asset.headers.get('content-security-policy'), /sandbox/)
    assert.deepEqual(Buffer.from(await asset.arrayBuffer()), svg)
  }
  const faviconRecord = await (await fetch(`${base}/api/admin/content/favicon`, { headers })).json()
  faviconRecord.content.image.src = svgMedia.src
  const saveFavicon = await fetch(`${base}/api/admin/content/favicon`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(faviconRecord)
  })
  assert.equal(saveFavicon.status, 200, await saveFavicon.clone().text())
  const updatedPage = await (await fetch(`${base}/`)).text()
  const iconLinks = updatedPage.match(/<link\b[^>]*rel="(?:icon|shortcut icon)"[^>]*>/g)
  assert.equal(iconLinks.length, 2)
  assert.ok(iconLinks.every(link => link.includes(`href="${svgMedia.src}"`)))
  const localizedSections = {
    header: content => [content.logo],
    hero: content => [content.logo, ...content.organizers],
    'information-partners': content => content.partners
  }
  for (const [section, images] of Object.entries(localizedSections)) {
    const current = await (await fetch(`${base}/api/admin/content/${section}`, { headers })).json()
    const originalSources = images(current.content).map(image => image.src)
    images(current.content).forEach(image => { image.srcEn = svgMedia.src })
    const response = await fetch(`${base}/api/admin/content/${section}`, {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(current)
    })
    assert.equal(response.status, 200, await response.clone().text())
    const published = await (await fetch(`${base}/api/content/${section}`)).json()
    assert.deepEqual(images(published).map(image => image.src), originalSources)
    assert.ok(images(published).every(image => image.srcEn === svgMedia.src))
  }
  for (const markup of [
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject /></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/a.png" /></svg>',
    '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg">&x;</svg>'
  ]) {
    const unsafe = new FormData()
    unsafe.append('file', new Blob([markup], { type: 'image/svg+xml' }), 'unsafe.svg')
    assert.equal((await fetch(`${base}/api/admin/media`, { method: 'POST', headers, body: unsafe })).status, 415)
  }
  const speakers = await (await fetch(`${base}/api/admin/content/speakers`, { headers })).json()
  speakers.content.speakers[0].image.src = media.src
  speakers.content.speakers = Array.from({ length: 25 }, (_, index) => ({
    ...speakers.content.speakers[0], fullName: { ru: `Тестовый спикер ${index + 1}`, en: `Test speaker ${index + 1}` }
  }))
  assert.equal((await fetch(`${base}/api/admin/content/speakers`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(speakers)
  })).status, 200)
  assert.equal((await (await fetch(`${base}/api/content/speakers`)).json()).speakers[0].image.src, media.src)
  assert.equal((await (await fetch(`${base}/api/content/speakers`)).json()).speakers.length, 25)
  assert.ok((await (await fetch(`${base}/`)).text()).includes('Тестовый спикер 25'))
  const largeImage = new FormData()
  largeImage.append('file', new Blob([image, Buffer.alloc(3 * 1024 * 1024)], { type: 'image/png' }), 'large.png')
  assert.equal((await fetch(`${base}/api/admin/media`, { method: 'POST', headers, body: largeImage })).status, 201)
  const invalid = new FormData()
  invalid.append('file', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/png' }), 'fake.png')
  assert.equal((await fetch(`${base}/api/admin/media`, { method: 'POST', headers, body: invalid })).status, 415)
  assert.equal((await fetch(`${base}/api/admin/media`, {
    method: 'POST', headers: { ...headers, Origin: 'https://other.example' }, body: form
  })).status, 403)
  assert.equal((await fetch(`${base}/`)).status, 200)
  // Existing saved labels are renamed without overwriting edited text or EN titles.
  const legacyPolicy = await (await fetch(`${base}/api/admin/content/privacy-policy`, { headers })).json()
  legacyPolicy.content.title.ru = 'Политика конфиденциальности'
  assert.equal((await fetch(`${base}/api/admin/content/privacy-policy`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(legacyPolicy)
  })).status, 200)
  savedLegal['privacy-policy'].title.ru = legalDefaults['privacy-policy'].title.ru
  const legacyFooter = await (await fetch(`${base}/api/admin/content/footer`, { headers })).json()
  legacyFooter.content.privacy.label = { ru: 'Политика конфиденциальности', en: 'Privacy policy' }
  assert.equal((await fetch(`${base}/api/admin/content/footer`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(legacyFooter)
  })).status, 200)
  await stop()
  await start()
  assert.deepEqual(await (await fetch(`${base}/api/content/packages`)).json(), packages.content)
  assert.equal((await (await fetch(`${base}/api/content/speakers`)).json()).speakers.length, 25)
  assert.equal((await (await fetch(`${base}/api/content/registration-messages`)).json()).successTitle.ru, record.content.successTitle.ru)
  assert.equal((await (await fetch(`${base}/api/content/speakers`)).json()).speakers[0].image.src, media.src)
  assert.deepEqual(Buffer.from(await (await fetch(`${base}${media.src}`)).arrayBuffer()), image)
  for (const [section, images] of Object.entries(localizedSections)) {
    const published = await (await fetch(`${base}/api/content/${section}`)).json()
    assert.ok(images(published).every(image => image.srcEn === svgMedia.src))
  }
  assert.equal((await fetch(`${base}${svgMedia.src}`)).headers.get('content-type'), 'image/svg+xml')
  assert.equal((await (await fetch(`${base}/api/content/favicon`)).json()).image.src, svgMedia.src)
  assert.ok((await (await fetch(`${base}/`)).text()).includes(`href="${svgMedia.src}"`))
  for (const [section, expected] of Object.entries(savedLegal)) {
    assert.deepEqual(await (await fetch(`${base}/api/content/${section}`)).json(), expected)
  }
  assert.deepEqual((await (await fetch(`${base}/api/content/footer`)).json()).privacy.label, legalDefaults['privacy-policy'].title)
  assert.deepEqual((await (await fetch(`${base}/api/content/site-layout`)).json()).order, layout.content.order)
  assert.deepEqual((await (await fetch(`${base}/api/admin/content/registration-delivery`, { headers })).json()).content, delivery.content)
  console.log('HTTP integration passed: country-scoped city search, old database/form migration, cities in mail/Excel, block order, country validation, SMTP recipient rules, settings persistence, authentication, editable content, favicon replacement in HTML, localized logos, raster/SVG uploads, active SVG rejection, CSRF and persistence after restart.')
} finally {
  await stop()
  await new Promise(resolve => smtp.close(resolve))
  await rm(directory, { recursive: true, force: true })
}
