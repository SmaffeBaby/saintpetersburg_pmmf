<script setup lang="ts">
import { defaultBotContent, messageDefinitions, type BotContent } from '#shared/config/telegram-defaults.mjs'
const emit = defineEmits<{ unauthorized: [] }>()
const content = ref<BotContent>(defaultBotContent())
const revision = ref(0)
const tokenConfigured = ref(false)
const botId = ref<string | null>(null)
const newToken = ref('')
const loading = ref(true)
const saving = ref(false)
const loaded = ref(false)
const error = ref('')
const saved = ref(false)
const dirty = ref(false)
const search = ref('')
const entries = computed(() => messageDefinitions.filter(d => `${d.label} ${d.en} ${d.id} ${content.value.messages[d.id]?.ru} ${content.value.messages[d.id]?.en}`.toLowerCase().includes(search.value.toLowerCase())).map(def => ({ ...def, value: content.value.messages[def.id]! })))
watch(content, () => { saved.value = false; dirty.value = true }, { deep: true, flush: 'sync' })
const fail = (e: unknown) => {
  const status = (e as { statusCode?: number }).statusCode
  if (status === 401) emit('unauthorized')
  error.value = status === 409 ? 'Настройки изменились в другой вкладке. Обновите их перед сохранением.' : status === 400 ? 'Проверьте обе языковые версии, подстановки, уникальность кнопок, HTTPS-ссылки и токен. Для замены нужен действующий токен этого же бота.' : 'Не удалось сохранить настройки. Попробуйте ещё раз.'
}
const load = async () => {
  loading.value = true; loaded.value = false; error.value = ''; saved.value = false; newToken.value = ''
  try {
    const data = await $fetch('/api/admin/telegram-settings')
    content.value = data.content; revision.value = data.revision; tokenConfigured.value = data.tokenConfigured; botId.value = data.botId; loaded.value = true; dirty.value = false
  } catch (e) { fail(e) }
  finally { loading.value = false }
}
const save = async () => {
  saving.value = true; error.value = ''; saved.value = false
  try {
    const data = await $fetch('/api/admin/telegram-settings', { method: 'PUT', body: { content: content.value, revision: revision.value, ...(newToken.value.trim() ? { token: newToken.value.trim() } : {}) } })
    content.value = data.content; revision.value = data.revision; tokenConfigured.value = data.tokenConfigured; botId.value = data.botId; newToken.value = ''; saved.value = true; dirty.value = false
  } catch (e) { fail(e) }
  finally { saving.value = false }
}
const move = <T,>(items: T[], index: number, offset: number) => {
  const target = index + offset
  if (target < 0 || target >= items.length) return
  const [item] = items.splice(index, 1)
  if (item !== undefined) items.splice(target, 0, item)
}
const addPage = () => content.value.pages.push({ id: `page_${crypto.randomUUID().slice(0, 8)}`, title: { ru: 'Новый раздел', en: 'New section' }, body: { ru: 'Информация', en: 'Information' }, links: [] })
onMounted(load)
</script>

<template>
  <form class="space-y-6" @submit.prevent="save" @input="saved = false">
    <UAlert v-if="loading" title="Загружаем настройки…" />
    <fieldset :disabled="!loaded || saving" class="min-w-0 space-y-6 disabled:opacity-60">
      <UCard>
        <template #header><h2 class="text-lg font-semibold">Подключение Telegram</h2></template>
        <div class="space-y-4">
          <p class="text-sm text-slate-600">{{ tokenConfigured ? `Токен настроен · ID бота: ${botId}` : 'Токен ещё не настроен' }}</p>
          <UFormField label="TELEGRAM_BOT_TOKEN" description="Чтобы заменить токен, вставьте новый из @BotFather. Пустое поле сохраняет текущий токен.">
            <UInput v-model="newToken" type="password" autocomplete="new-password" placeholder="Новый токен" class="mt-2 w-full" />
          </UFormField>
          <p class="text-sm text-slate-500">Текущий токен скрыт и хранится в зашифрованном виде. Новый проверяется перед сохранением. Подключение обновится автоматически, обычно в течение 45 секунд.</p>
        </div>
      </UCard>

      <UCard>
        <template #header><h2 class="text-lg font-semibold">Разделы меню и ссылки</h2><p class="mt-2 text-sm text-slate-500">Каждый раздел добавляет кнопку в меню участника. Можно создавать разделы, менять порядок и добавлять ссылки.</p></template>
        <div class="space-y-6">
          <AdminTelegramPage v-for="(page, index) in content.pages" :key="page.id" :page="page" :index="index" :total="content.pages.length" @remove="content.pages.splice(index, 1)" @move="move(content.pages, index, $event)" />
          <UButton type="button" label="Добавить раздел" icon="i-lucide-plus" :disabled="content.pages.length >= 30" @click="addPage" />
        </div>
      </UCard>

      <UCard>
        <template #header><h2 class="text-lg font-semibold">Все тексты и системные кнопки · RU / EN</h2><p class="mt-2 text-sm text-slate-500">Приветствие, подписка, программа, язык, меню организатора, подсказки и отчёты. Подстановки в двойных фигурных скобках нужно сохранять в обеих версиях.</p></template>
        <div class="space-y-3">
          <UInput v-model="search" placeholder="Найти текст…" icon="i-lucide-search" class="w-full" />
          <details v-for="entry in entries" :key="entry.id" class="rounded-lg border border-slate-200 p-3">
            <summary class="cursor-pointer text-sm font-medium">{{ entry.value.ru }}</summary>
            <div class="mt-4 space-y-3"><AdminBilingualFields :model-value="entry.value" :label="entry.button ? 'Кнопка' : 'Текст'" :rows="entry.button ? 1 : 3" :maxlength="entry.button ? 64 : 3500" @update:model-value="content.messages[entry.id] = $event" /><UButton type="submit" label="Сохранить тексты и настройки" :loading="saving" :disabled="!loaded || loading" /><p v-if="saved" class="text-sm text-green-700">Изменения сохранены.</p><p v-else-if="dirty" class="text-sm text-amber-700">Есть несохранённые изменения.</p></div>
          </details>
        </div>
      </UCard>
    </fieldset>
    <div class="sticky bottom-0 space-y-3 border-t border-slate-200 bg-white/95 py-4">
      <UAlert v-if="error" color="error" :description="error" />
      <UAlert v-if="dirty && !saving" color="warning" description="Есть несохранённые изменения в текстах или меню бота." />
      <UAlert v-if="saved" color="success" description="Настройки бота сохранены. Участники увидят обновлённые кнопки после /start или смены языка." />
      <div class="flex flex-wrap gap-3"><UButton type="submit" label="Сохранить настройки бота" :loading="saving" :disabled="!loaded || loading" /><UButton type="button" label="Обновить настройки" color="neutral" variant="outline" :loading="loading" :disabled="saving" @click="load" /></div>
    </div>
  </form>
</template>
