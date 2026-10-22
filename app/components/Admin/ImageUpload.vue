<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uploading = ref(false)
const error = ref('')
const upload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Размер изображения не должен превышать 5 МБ.'
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const result = await $fetch<{ src: string }>('/api/admin/media', { method: 'POST', body })
    emit('update:modelValue', result.src)
  } catch (e: any) {
    error.value = e.statusCode === 401 ? 'Сессия истекла. Войдите в админку снова.'
      : e.statusCode === 415 ? 'Выберите изображение SVG, JPEG, PNG, WebP или GIF.'
        : 'Не удалось загрузить изображение. Проверьте размер файла и попробуйте ещё раз.'
  } finally { uploading.value = false; input.value = '' }
}
</script>

<template>
  <div class="space-y-3">
    <UInput :model-value="modelValue" class="w-full" :disabled="uploading" @update:model-value="emit('update:modelValue', $event)" />
    <img v-if="modelValue?.startsWith('/') && !modelValue.startsWith('//')" :src="modelValue" alt="Предпросмотр изображения" class="max-h-48 max-w-full rounded-lg border border-slate-200 bg-slate-100 object-contain" loading="lazy">
    <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">
      {{ uploading ? 'Загружаем…' : 'Загрузить изображение' }}
      <input type="file" accept="image/svg+xml,.svg,image/jpeg,image/png,image/webp,image/gif" :disabled="uploading" class="sr-only" @change="upload">
    </label>
    <p class="text-xs text-slate-500">SVG, JPEG, PNG, WebP или GIF, до 5 МБ. Для EN можно оставить поле пустым — тогда используется основное изображение. Файл сохраняется в базе данных. Нажмите «Сохранить», чтобы применить изображение на сайте.</p>
    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
