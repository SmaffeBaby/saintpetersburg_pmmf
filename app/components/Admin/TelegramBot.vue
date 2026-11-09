<script setup lang="ts">
const emit = defineEmits<{ unauthorized: [] }>()
const ids = ref('')
const revision = ref(0)
const loading = ref(true)
const saving = ref(false)
const loaded = ref(false)
const error = ref('')
const saved = ref(false)
const handleError = (e: unknown) => {
  const status = (e as { statusCode?: number }).statusCode
  if (status === 401) emit('unauthorized')
  error.value = status === 409 ? 'Настройки изменились в другой вкладке. Обновите список перед сохранением.' : 'Не удалось выполнить запрос. Попробуйте ещё раз.'
}
const load = async () => {
  loading.value = true; error.value = ''; saved.value = false; loaded.value = false
  try {
    const data = await $fetch('/api/admin/telegram')
    ids.value = data.adminIds.join('\n'); revision.value = data.revision; loaded.value = true
  } catch (e) { handleError(e) }
  finally { loading.value = false }
}
const save = async () => {
  error.value = ''; saved.value = false
  const adminIds = [...new Set(ids.value.split(/[\s,;]+/).filter(Boolean))]
  if (adminIds.length > 100 || adminIds.some(id => !/^[1-9]\d{0,15}$/.test(id) || !Number.isSafeInteger(Number(id)))) {
    error.value = 'Введите до 100 числовых Telegram ID, каждый с новой строки. Usernames и ссылки не подходят.'; return
  }
  saving.value = true
  try {
    const data = await $fetch('/api/admin/telegram', { method: 'PUT', body: { adminIds, revision: revision.value } })
    ids.value = data.adminIds.join('\n'); revision.value = data.revision; saved.value = true
  } catch (e) { handleError(e) }
  finally { saving.value = false }
}
onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-6 py-4">
    <div><h2 class="text-xl font-semibold">Доступ к управлению ботом</h2><p class="mt-2 text-sm text-slate-500">Администраторы смогут создавать и отправлять посты, управлять расписанием и загружать PDF-программу через /admin в Telegram.</p></div>
    <UCard>
      <form class="space-y-5" @submit.prevent="save">
        <UFormField label="Telegram ID администраторов" description="Один ID на строку. Свой ID можно узнать командой /id в боте.">
          <UTextarea v-model="ids" :rows="8" placeholder="474003891" class="mt-2 w-full" :disabled="loading || saving || !loaded" @update:model-value="saved = false" />
        </UFormField>
        <p class="text-sm text-slate-500">Изменения применяются после сохранения без перезапуска бота. Удаление ID отзовёт доступ. Пустой список отключит доступ к /admin для всех.</p>
        <UAlert v-if="error" color="error" :description="error" />
        <UAlert v-if="saved" color="success" description="Доступы сохранены." />
        <div class="flex gap-3"><UButton type="submit" label="Сохранить доступы" :loading="saving" :disabled="loading || !loaded" /><UButton label="Обновить список" color="neutral" variant="outline" :loading="loading" :disabled="saving" @click="load" /></div>
      </form>
    </UCard>
    <AdminTelegramSettings @unauthorized="emit('unauthorized')" />
    <UButton to="https://t.me/spiyf_helper_bot" target="_blank" label="Открыть бота" icon="i-lucide-external-link" color="neutral" variant="outline" />
  </div>
</template>
