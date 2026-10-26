<script setup lang="ts">
import type { LegalContent, LegalSection } from '#shared/config/content'
defineProps<{ modelValue: LegalContent; section: LegalSection }>()
const emit = defineEmits<{ 'update:modelValue': [value: LegalContent] }>()
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm leading-relaxed text-slate-600">Разделы в тексте начинаются с ##, подзаголовки — с ###, пункты списка — с дефиса и пробела. Отделяйте абзацы пустой строкой. После редактирования нажмите «Сохранить».</p>
    <div class="grid gap-6 xl:grid-cols-2">
      <div v-for="locale in (['ru', 'en'] as const)" :key="locale" class="space-y-5">
        <UFormField :label="locale === 'ru' ? 'Заголовок' : 'Заголовок на английском'" :name="`title.${locale}`">
          <UInput :model-value="modelValue.title[locale]" class="w-full" @update:model-value="emit('update:modelValue', { ...modelValue, title: { ...modelValue.title, [locale]: $event } })" />
        </UFormField>
        <UFormField :label="locale === 'ru' ? 'Текст' : 'Текст на английском'" :name="`body.${locale}`">
          <UTextarea :model-value="modelValue.body[locale]" :rows="24" class="w-full" @update:model-value="emit('update:modelValue', { ...modelValue, body: { ...modelValue.body, [locale]: $event } })" />
        </UFormField>
      </div>
    </div>
    <UButton :to="`/${section}`" target="_blank" label="Открыть страницу на сайте" icon="i-lucide-external-link" color="neutral" variant="outline" />
  </div>
</template>
