<script setup lang="ts">
import type { Bilingual } from '#shared/config/telegram-defaults.mjs'
const props = withDefaults(defineProps<{ modelValue: Bilingual; label: string; rows?: number; maxlength?: number }>(), { rows: 2, maxlength: 3500 })
const emit = defineEmits<{ 'update:modelValue': [value: Bilingual] }>()
</script>
<template>
  <div class="grid gap-4 md:grid-cols-2">
    <UFormField v-for="lang in (['ru', 'en'] as const)" :key="lang" :label="`${label} · ${lang === 'ru' ? 'Русский' : 'English'}`">
      <UTextarea :model-value="props.modelValue[lang]" :rows="rows" :maxlength="maxlength" class="mt-2 w-full" required @update:model-value="emit('update:modelValue', { ...props.modelValue, [lang]: String($event) })" />
    </UFormField>
  </div>
</template>
