import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const directory = await mkdtemp(join(tmpdir(), 'mmf-http-test-'))
const base = 'http://127.0.0.1:3097'
let server
const start = async () => {
  server = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, NITRO_HOST: '127.0.0.1', NITRO_PORT: '3097',
      NUXT_DATABASE_PATH: join(directory, 'test.sqlite'), NUXT_REDIS_URL: '',
      NUXT_ADMIN_PASSWORD: 'integration-password', NUXT_ADMIN_SESSION_SECRET: 'integration-secret',
      NUXT_SMTP_HOST: ' ', NUXT_SMTP_USER: ' ', NUXT_SMTP_PASS: ' ' },
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
  assert.equal((await fetch(`${base}/api/admin/content/speakers`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(speakers)
  })).status, 200)
  assert.equal((await (await fetch(`${base}/api/content/speakers`)).json()).speakers[0].image.src, media.src)
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
  console.log('HTTP integration passed: authentication, editable content, favicon replacement in HTML, localized logos, raster/SVG uploads, active SVG rejection, CSRF and persistence after restart.')
} finally {
  await stop()
  await rm(directory, { recursive: true, force: true })
}
