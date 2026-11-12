<script setup lang="ts">
defineProps<{ modelValue: string; locale: 'ru' | 'en' }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uploading = ref(false)
const error = ref('')
const upload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Размер PDF не должен превышать 5 МБ.'
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const result = await $fetch<{ src: string }>('/api/admin/program-files', { method: 'POST', body })
    emit('update:modelValue', result.src)
  } catch (e: any) {
    error.value = e.statusCode === 401 ? 'Сессия истекла. Войдите в админку снова.'
      : e.statusCode === 415 ? 'Выберите файл в формате PDF.' : 'Не удалось загрузить PDF. Проверьте размер файла и попробуйте ещё раз.'
  } finally { uploading.value = false; input.value = '' }
}
</script>

<template>
  <div class="space-y-3 rounded-lg border border-slate-200 p-4">
    <p class="text-sm font-semibold">{{ locale === 'ru' ? 'Программа на русском (RU)' : 'Программа на английском (EN)' }}</p>
    <a v-if="modelValue" :href="`${modelValue}?lang=${locale}&view=1`" target="_blank" rel="noopener noreferrer" class="block text-sm text-violet-700 underline underline-offset-4">Открыть текущий PDF</a>
    <p v-else class="text-sm text-slate-500">PDF ещё не загружен. Кнопка для этого языка будет неактивна.</p>
    <div class="flex flex-wrap gap-3">
      <label class="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">
        {{ uploading ? 'Загружаем…' : modelValue ? 'Заменить PDF' : 'Загрузить PDF' }}
        <input type="file" accept="application/pdf,.pdf" :disabled="uploading" class="sr-only" :aria-label="`Загрузить PDF (${locale.toUpperCase()})`" @change="upload">
      </label>
      <UButton v-if="modelValue" label="Убрать файл" color="neutral" variant="outline" :disabled="uploading" @click="emit('update:modelValue', '')" />
    </div>
    <p class="text-xs text-slate-500">PDF до 5 МБ. После загрузки нажмите «Сохранить», чтобы применить файл на сайте.</p>
    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
