<script setup lang="ts">
import { contentSchemas } from '#shared/config/content'
import type { z } from 'zod'
defineProps<{ disabled?: boolean; dirty: boolean }>()
const emit = defineEmits<{
  imported: [content: z.infer<typeof contentSchemas.speakers>]
  unauthorized: []
  busy: [value: boolean]
}>()
const importing = ref(false)
const exporting = ref(false)
const error = ref('')
const status = ref('')
const exportFile = async () => {
  exporting.value = true
  emit('busy', true)
  error.value = ''
  try {
    const blob = await $fetch<Blob>('/api/admin/speakers/export', { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `speakers-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e: any) {
    if (e.statusCode === 401) emit('unauthorized')
    error.value = e.statusCode === 401 ? 'Сессия истекла. Войдите снова.'
      : e.statusCode === 413 ? 'Экспорт превышает 300 МБ.'
        : 'Не удалось экспортировать спикеров. Убедитесь, что все фотографии доступны.'
  } finally { exporting.value = false; emit('busy', false) }
}
const importFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  status.value = ''
  if (file.size > 300 * 1024 * 1024) {
    error.value = 'Файл не должен превышать 300 МБ.'
    input.value = ''
    return
  }
  importing.value = true
  emit('busy', true)
  try {
    const raw = await file.text()
    const result = await $fetch<{ content: z.infer<typeof contentSchemas.speakers> }>('/api/admin/speakers/import', {
      method: 'POST', body: raw, headers: { 'Content-Type': 'application/json' }
    })
    emit('imported', result.content)
    status.value = `Загружено спикеров: ${result.content.speakers.length}. Проверьте данные и нажмите «Сохранить».`
  } catch (e: any) {
    if (e.statusCode === 401) emit('unauthorized')
    error.value = e.statusCode === 401 ? 'Сессия истекла. Войдите снова.'
      : e.statusCode === 413 ? 'Файл не должен превышать 300 МБ.'
        : 'Импорт не выполнен. Выберите полный JSON-файл экспорта спикеров с фотографиями.'
  } finally { importing.value = false; emit('busy', false); input.value = '' }
}
</script>

<template>
  <div class="mb-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <p class="font-semibold">Перенос спикеров между сайтами</p>
    <p class="text-sm text-slate-600">Экспорт содержит сохранённый список, тексты RU/EN, порядок карточек, видимость раздела и все фотографии. На другом сайте импортируйте этот JSON-файл. Импорт заменит данные в редакторе; изменения появятся на сайте после нажатия «Сохранить».</p>
    <div class="flex flex-wrap gap-3">
      <UButton label="Экспорт спикеров" icon="i-lucide-download" color="neutral" variant="outline" :loading="exporting" :disabled="disabled || dirty || importing || exporting" @click="exportFile" />
      <label class="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium" :class="disabled || importing || exporting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'">
        {{ importing ? 'Импортируем…' : 'Импорт спикеров' }}
        <input type="file" accept="application/json,.json" :disabled="disabled || importing || exporting" class="sr-only" aria-label="Импорт спикеров из JSON" @change="importFile">
      </label>
    </div>
    <p v-if="dirty" class="text-xs text-slate-500">Для экспорта сначала сохраните изменения. Импорт заменит также несохранённые правки в редакторе.</p>
    <p class="text-xs text-slate-500">JSON до 300 МБ. Другие разделы сайта и заявки участников не изменяются.</p>
    <p v-if="status" role="status" class="text-sm text-green-700">{{ status }}</p>
    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
