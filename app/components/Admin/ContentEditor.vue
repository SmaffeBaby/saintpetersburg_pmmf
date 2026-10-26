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
const hasVisibility = computed(() => content.value !== null && 'visible' in content.value)
const contentFields = computed({
  get: () => {
    const { visible, ...fields } = content.value || {}
    return fields
  },
  set: (fields) => { content.value = hasVisibility.value ? { ...fields, visible: content.value.visible } : fields }
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
    if (props.section === 'favicon') await refreshNuxtData('favicon-content')
    else clearNuxtData(`${props.section}-content`)
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
      <p class="text-sm text-slate-500">{{ dirty ? 'Есть несохранённые изменения' : section === 'favicon' ? 'Иконка сайта для обоих языков' : 'Контент на русском и английском' }}</p>
      <div class="flex gap-2">
        <UButton label="Обновить" color="neutral" variant="outline" :disabled="saving || loading" @click="load" />
        <UButton label="Сохранить" icon="i-lucide-check" :loading="saving" :disabled="!dirty || loading" @click="save" />
      </div>
    </div>
    <UAlert v-if="error" color="error" :description="error" role="alert" />
    <UAlert v-if="success" color="success" :description="success" role="status" />
    <p v-if="loading" role="status" class="py-12 text-center text-slate-500">Загружаем раздел…</p>
    <UCard v-else-if="content">
      <div v-if="hasVisibility" class="mb-6 space-y-2 border-b border-slate-200 pb-6">
        <USwitch v-model="content.visible" label="Показывать на сайте" :disabled="saving" />
        <p class="text-sm text-slate-500">{{ content.visible ? 'Компонент виден на сайте.' : 'Компонент скрыт на сайте. Его содержимое сохранено.' }} Нажмите «Сохранить», чтобы применить изменения для обоих языков.</p>
      </div>
      <p v-if="section === 'schedule'" class="mb-6 text-sm text-slate-500">В поле «Кнопка → Ссылка» укажите адрес страницы или файла расписания. Пока ссылка пустая, кнопка на сайте неактивна.</p>
      <p v-if="section === 'registration-messages'" class="mb-6 text-sm text-slate-500">Редактируйте уведомления после отправки формы и темы, заголовки и тексты обоих писем. Таблица с данными заявки добавляется автоматически. В письмах доступны подстановки: <span v-pre>{{lastName}}, {{firstName}}, {{middleName}}, {{birthDate}}, {{region}}, {{email}}, {{phone}}, {{createdAt}}</span>.</p>
      <p v-if="['header', 'hero', 'information-partners'].includes(section)" class="mb-6 text-sm text-slate-500">Загружайте отдельные логотипы для RU и EN. Пустое поле EN использует основное изображение. В разделе «Первый экран» доступны большой логотип и логотипы организаторов в нижней белой плашке. Пустое основное изображение большого логотипа возвращает исходный логотип сайта.</p>
      <div v-if="section === 'favicon'" class="space-y-4">
        <p class="text-sm text-slate-500">Favicon — иконка во вкладке браузера. Загрузите квадратное изображение, например SVG или PNG, и нажмите «Сохранить». Иконка применяется для русского и английского сайта.</p>
        <UFormField label="Иконка сайта" name="image.src">
          <AdminImageUpload v-model="content.image.src" />
        </UFormField>
      </div>
      <AdminLegalDocumentEditor v-else-if="section === 'privacy-policy' || section === 'personal-data-consent'" v-model="contentFields" :section="section" />
      <AdminContentFields v-else v-model="contentFields" />
    </UCard>
  </div>
</template>
