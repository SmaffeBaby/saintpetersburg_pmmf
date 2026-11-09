<script setup lang="ts">
import type { BotPage } from '#shared/config/telegram-defaults.mjs'
defineProps<{ link: BotPage['links'][number]; index: number; total: number }>()
const emit = defineEmits<{ remove: []; move: [offset: number] }>()
</script>
<template>
  <div class="space-y-3 rounded-lg bg-slate-50 p-4">
    <AdminBilingualFields v-model="link.label" label="Название ссылки" :rows="1" :maxlength="64" />
    <UFormField label="URL"><UInput v-model="link.url" type="url" required placeholder="https://…" class="mt-2 w-full" /></UFormField>
    <div class="flex gap-2">
      <UButton type="button" icon="i-lucide-arrow-up" aria-label="Ссылка выше" color="neutral" variant="outline" :disabled="index === 0" @click="emit('move', -1)" />
      <UButton type="button" icon="i-lucide-arrow-down" aria-label="Ссылка ниже" color="neutral" variant="outline" :disabled="index === total - 1" @click="emit('move', 1)" />
      <UButton type="button" label="Удалить ссылку" color="error" variant="ghost" @click="emit('remove')" />
    </div>
  </div>
</template>
