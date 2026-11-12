<script setup lang="ts">
import type { LocalizedText } from '~/composables/useHeader'
const props = defineProps<{ modelValue: { title: LocalizedText; button: { label: LocalizedText; href: LocalizedText } } }>()
const emit = defineEmits<{ 'update:modelValue': [value: typeof props.modelValue] }>()
const updateFile = (locale: 'ru' | 'en', value: string) => emit('update:modelValue', {
  ...props.modelValue,
  button: { ...props.modelValue.button, href: { ...props.modelValue.button.href, [locale]: value } }
})
</script>

<template>
  <div class="space-y-6">
    <AdminBilingualFields :model-value="modelValue.title" label="Заголовок" @update:model-value="emit('update:modelValue', { ...modelValue, title: $event })" />
    <AdminBilingualFields :model-value="modelValue.button.label" label="Текст кнопки просмотра" @update:model-value="emit('update:modelValue', { ...modelValue, button: { ...modelValue.button, label: $event } })" />
    <div class="grid gap-4 xl:grid-cols-2">
      <AdminProgramPdfUpload v-for="locale in (['ru', 'en'] as const)" :key="locale" :locale="locale" :model-value="modelValue.button.href[locale]" @update:model-value="updateFile(locale, $event)" />
    </div>
  </div>
</template>
