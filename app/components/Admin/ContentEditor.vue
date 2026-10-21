<script setup lang="ts">
import { contentSchemas, type ContentSection } from '../../../shared/config/content'
const props = defineProps<{ section: ContentSection }>()
const emit = defineEmits<{ unauthorized: [] }>()
const content = ref<any>(null)
const revision = ref(0)
const saved = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const dirty = computed(() => content.value !== null && JSON.stringify(content.value) !== saved.value)
const contentFields = computed({
  get: () => {
    const { visible, ...fields } = content.value || {}
    return fields
  },
  set: (fields) => { content.value = props.section === 'registration-messages' ? fields : { ...fields, visible: content.value.visible } }
})
const load = async () => {
  if (dirty.value && !window.confirm('Отменить несохранённые изменения?')) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const result = await $fetch<{ content: any; revision: number }>(`/api/admin/content/${props.section}`)
    content.value = result.content
    revision.value = result.revision
    saved.value = JSON.stringify(result.content)
  } catch (e: any) {
    if (e.statusCode === 401) emit('unauthorized')
    error.value = 'Не удалось загрузить раздел. Попробуйте ещё раз.'
  } finally { loading.value = false }
}
const save = async () => {
  error.value = ''
  success.value = ''
  const validation = contentSchemas[props.section].safeParse(content.value)
  if (!validation.success) {
    error.value = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    return
  }
  saving.value = true
  try {
    const result = await $fetch<{ content: any; revision: number }>(`/api/admin/content/${props.section}`, { method: 'PUT', body: { content: validation.data, revision: revision.value } })
    content.value = result.content
    revision.value = result.revision
    saved.value = JSON.stringify(result.content)
    success.value = 'Сохранено. Изменения уже доступны на сайте.'
    clearNuxtData(`${props.section}-content`)
    clearNuxtData('site-visibility')
  } catch (e: any) {
    if (e.statusCode === 401) emit('unauthorized')
    error.value = e.statusCode === 409 ? 'Раздел изменён в другой вкладке. Скопируйте свои правки и загрузите актуальную версию.' : 'Не удалось сохранить. Проверьте поля и попробуйте ещё раз.'
  } finally { saving.value = false }
}
const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty.value) event.preventDefault() }
onMounted(() => { load(); window.addEventListener('beforeunload', beforeUnload) })
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(() => !dirty.value || window.confirm('Покинуть редактор без сохранения?'))
onBeforeRouteUpdate(() => !dirty.value || window.confirm('Покинуть редактор без сохранения?'))
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-6 pb-16">
    <div class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 backdrop-blur">
      <p class="text-sm text-slate-500">{{ dirty ? 'Есть несохранённые изменения' : 'Контент на русском и английском' }}</p>
      <div class="flex gap-2">
        <UButton label="Обновить" color="neutral" variant="outline" :disabled="saving || loading" @click="load" />
        <UButton label="Сохранить" icon="i-lucide-check" :loading="saving" :disabled="!dirty || loading" @click="save" />
      </div>
    </div>
    <UAlert v-if="error" color="error" :description="error" role="alert" />
    <UAlert v-if="success" color="success" :description="success" role="status" />
    <p v-if="loading" role="status" class="py-12 text-center text-slate-500">Загружаем раздел…</p>
    <UCard v-else-if="content">
      <div v-if="section !== 'registration-messages'" class="mb-6 space-y-2 border-b border-slate-200 pb-6">
        <USwitch v-model="content.visible" label="Показывать на сайте" :disabled="saving" />
        <p class="text-sm text-slate-500">{{ content.visible ? 'Компонент виден на сайте.' : 'Компонент скрыт на сайте. Его содержимое сохранено.' }} Нажмите «Сохранить», чтобы применить изменения для обоих языков.</p>
      </div>
      <p v-if="section === 'schedule'" class="mb-6 text-sm text-slate-500">В поле «Кнопка → Ссылка» укажите адрес страницы или файла расписания. Пока ссылка пустая, кнопка на сайте неактивна.</p>
      <p v-if="section === 'registration-messages'" class="mb-6 text-sm text-slate-500">Редактируйте уведомления после отправки формы и темы, заголовки и тексты обоих писем. Таблица с данными заявки добавляется автоматически. В письмах доступны подстановки: <span v-pre>{{lastName}}, {{firstName}}, {{middleName}}, {{birthDate}}, {{region}}, {{email}}, {{phone}}, {{createdAt}}</span>.</p>
      <AdminContentFields v-model="contentFields" />
    </UCard>
  </div>
</template>
