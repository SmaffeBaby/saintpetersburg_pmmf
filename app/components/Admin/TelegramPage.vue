<script setup lang="ts">
import type { BotPage } from '#shared/config/telegram-defaults.mjs'
const props = defineProps<{ page: BotPage; index: number; total: number }>()
const emit = defineEmits<{ remove: []; move: [offset: number] }>()
const moveLink = (index: number, offset: number) => {
  const [link] = props.page.links.splice(index, 1)
  if (link) props.page.links.splice(index + offset, 0, link)
}
</script>
<template>
  <details class="rounded-xl border border-slate-200 p-4" open>
    <summary class="cursor-pointer font-semibold">{{ page.title.ru || 'Новый раздел' }}</summary>
    <div class="mt-4 space-y-4">
      <div class="flex flex-wrap justify-end gap-2">
        <UButton type="button" icon="i-lucide-arrow-up" aria-label="Раздел выше" color="neutral" variant="outline" :disabled="index === 0" @click="emit('move', -1)" />
        <UButton type="button" icon="i-lucide-arrow-down" aria-label="Раздел ниже" color="neutral" variant="outline" :disabled="index === total - 1" @click="emit('move', 1)" />
        <UButton type="button" label="Удалить раздел" color="error" variant="soft" @click="emit('remove')" />
      </div>
      <AdminBilingualFields v-model="page.title" label="Кнопка меню" :rows="1" :maxlength="64" />
      <AdminBilingualFields v-model="page.body" label="Текст раздела" :rows="3" />
      <AdminTelegramLink v-for="(link, linkIndex) in page.links" :key="linkIndex" :link="link" :index="linkIndex" :total="page.links.length" @remove="page.links.splice(linkIndex, 1)" @move="moveLink(linkIndex, $event)" />
      <UButton type="button" label="Добавить ссылку" icon="i-lucide-plus" color="neutral" variant="outline" :disabled="page.links.length >= 30" @click="page.links.push({ label: { ru: 'Ссылка', en: 'Link' }, url: '' })" />
    </div>
  </details>
</template>
