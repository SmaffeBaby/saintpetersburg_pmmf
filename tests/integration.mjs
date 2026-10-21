import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
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
  await stop()
  await start()
  assert.equal((await (await fetch(`${base}/api/content/registration-messages`)).json()).successTitle.ru, record.content.successTitle.ru)
  assert.equal((await (await fetch(`${base}/api/content/speakers`)).json()).speakers[0].image.src, media.src)
  assert.deepEqual(Buffer.from(await (await fetch(`${base}${media.src}`)).arrayBuffer()), image)
  console.log('HTTP integration passed: authentication, editable messages, uploads, format checks, CSRF, homepage and persistence after restart.')
} finally {
  await stop()
  await rm(directory, { recursive: true, force: true })
}
