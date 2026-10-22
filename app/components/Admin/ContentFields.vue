<script setup lang="ts">
defineOptions({ name: 'AdminContentFields' })
const props = defineProps<{ modelValue: any; path?: string; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: any] }>()
const labels: Record<string, string> = {
  successTitle: 'Заголовок успешной отправки', successMessage: 'Текст успешной отправки', savedTitle: 'Заголовок при ошибке почты', savedMessage: 'Текст при ошибке почты', errorTitle: 'Заголовок ошибки отправки', errorMessage: 'Текст ошибки отправки', submitterEmail: 'Письмо участнику', organizerEmail: 'Письмо организаторам', subject: 'Тема письма', message: 'Текст письма',
  title: 'Заголовок', city: 'Город', subtitle: 'Подзаголовок', mapLabel: 'Текст кнопки карты', date: 'Дата и время', place: 'Место проведения', firstParagraph: 'Первый абзац', secondParagraph: 'Второй абзац',
  description: 'Описание', speakers: 'Спикеры', fullName: 'Имя спикера', role: 'Должность и описание', button: 'Кнопка', label: 'Текст', href: 'Ссылка', image: 'Изображение', alt: 'Описание изображения',
  logo: 'Логотип', partners: 'Партнеры', src: 'Основное изображение (RU)', srcEn: 'Изображение для английской версии (EN)', organizers: 'Организаторы в белой плашке', width: 'Ширина логотипа', height: 'Высота логотипа', nav: 'Навигация', registration: 'Кнопка регистрации', languages: 'Языки',
  code: 'Код языка', email: 'Электронная почта', address: 'Адрес', contacts: 'Контакты в карточке', legal: 'Реквизиты (сохранены из прежнего подвала)', privacy: 'Политика конфиденциальности', fields: 'Поля формы', agreement: 'Согласие на обработку данных',
  submitLabel: 'Текст кнопки отправки', id: 'Идентификатор', name: 'Имя поля', type: 'Тип поля', placeholder: 'Подсказка', autocomplete: 'Автозаполнение', layout: 'Ширина поля'
}
const localized = computed(() => props.modelValue && !Array.isArray(props.modelValue) && typeof props.modelValue === 'object' && 'ru' in props.modelValue && 'en' in props.modelValue)
const update = (key: string | number, value: any) => {
  const next = Array.isArray(props.modelValue) ? [...props.modelValue] : { ...props.modelValue }
  next[key] = value
  emit('update:modelValue', next)
}
const add = () => {
  if (props.path === 'speakers') {
    emit('update:modelValue', [...props.modelValue, {
      fullName: { ru: '', en: '' }, role: { ru: '', en: '' },
      image: { src: '/images/speaker-gurov.png', alt: { ru: '', en: '' } }
    }])
    return
  }
  if (props.path === 'organizers') {
    emit('update:modelValue', [...props.modelValue, {
      src: '/images/hero-committee.svg', srcEn: '', width: 200, height: 60, alt: { ru: '', en: '' }
    }])
    return
  }
  const seed = props.modelValue[props.modelValue.length - 1] || (props.path === 'partners'
    ? { src: '/images/partner-spbtv.svg', srcEn: '', alt: { ru: '', en: '' } }
    : { label: { ru: '', en: '' }, href: '/' })
  emit('update:modelValue', [...props.modelValue, structuredClone(toRaw(seed))])
}
const immutable = computed(() => /fields\.\d+\.(id|name|type)$/.test(props.path || ''))
const fixedArray = computed(() => ['fields', 'languages'].includes(props.path || ''))
const reorderable = computed(() => props.path === 'speakers')
const move = (index: number, offset: number) => {
  const target = index + offset
  if (!reorderable.value || target < 0 || target >= props.modelValue.length) return
  const next = [...props.modelValue]
  ;[next[index], next[target]] = [next[target], next[index]]
  emit('update:modelValue', next)
}
const fieldId = computed(() => `content-${props.path || 'root'}`)
</script>

<template>
  <fieldset v-if="localized" class="space-y-3">
    <legend class="mb-2 text-sm font-semibold text-slate-800">{{ label }}</legend>
    <div class="grid gap-3 xl:grid-cols-2">
      <UFormField v-for="locale in ['ru', 'en']" :key="locale" :label="locale === 'ru' ? 'Русский' : 'English'" :name="`${path}.${locale}`">
        <UTextarea :model-value="modelValue[locale]" autoresize :rows="2" class="w-full" @update:model-value="update(locale, $event)" />
      </UFormField>
    </div>
  </fieldset>
  <fieldset v-else-if="Array.isArray(modelValue)" class="space-y-4 rounded-xl border border-slate-200 p-4">
    <legend class="px-1 text-sm font-semibold">{{ label }}</legend>
    <p v-if="reorderable" class="text-sm text-slate-500">Меняйте порядок кнопками «Выше» и «Ниже». Нажмите «Сохранить», чтобы применить его на сайте.</p>
    <div v-for="(item, index) in modelValue" :key="index" class="space-y-4 rounded-lg bg-slate-50 p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="min-w-0 break-words text-sm font-medium"><span v-if="reorderable" class="mr-2 text-slate-500">{{ index + 1 }}.</span>{{ item.fullName?.ru || item.alt?.ru || item.label?.ru || item.name || item.label || `Элемент ${index + 1}` }}</p>
        <div class="flex flex-wrap items-center gap-1">
          <template v-if="reorderable">
            <UButton label="Выше" icon="i-lucide-arrow-up" :aria-label="`Переместить выше: ${item.fullName?.ru || `Спикер ${index + 1}`}`" color="neutral" variant="outline" size="xs" :disabled="index === 0" @click="move(index, -1)" />
            <UButton label="Ниже" icon="i-lucide-arrow-down" :aria-label="`Переместить ниже: ${item.fullName?.ru || `Спикер ${index + 1}`}`" color="neutral" variant="outline" size="xs" :disabled="index === modelValue.length - 1" @click="move(index, 1)" />
          </template>
          <UButton v-if="!fixedArray" label="Удалить" color="error" variant="ghost" size="xs" @click="emit('update:modelValue', modelValue.filter((_: any, i: number) => i !== index))" />
        </div>
      </div>
      <AdminContentFields :model-value="item" :path="`${path}.${index}`" @update:model-value="update(index, $event)" />
    </div>
    <UButton v-if="!fixedArray && modelValue.length < 12" label="Добавить пункт" icon="i-lucide-plus" variant="soft" @click="add" />
  </fieldset>
  <div v-else-if="modelValue && typeof modelValue === 'object'" class="space-y-6">
    <p v-if="label" class="border-b border-slate-200 pb-2 text-base font-semibold">{{ label }}</p>
    <AdminContentFields v-for="(value, key) in modelValue" :key="key" :label="labels[String(key)] || String(key)" :model-value="value" :path="path ? `${path}.${String(key)}` : String(key)" @update:model-value="update(String(key), $event)" />
  </div>
  <UFormField v-else :label="label" :name="path">
    <USelect v-if="path?.endsWith('.layout')" :model-value="modelValue" :items="[{label: 'Треть строки', value: 'third'}, {label: 'Половина строки', value: 'half'}]" class="w-full" @update:model-value="emit('update:modelValue', $event)" />
    <AdminImageUpload v-else-if="/\.(src|srcEn)$/.test(path || '')" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
    <UInput v-else-if="typeof modelValue === 'number'" :model-value="modelValue" type="number" :min="1" :max="2000" class="w-full" @update:model-value="emit('update:modelValue', Number($event))" />
    <UInput v-else :id="fieldId" :model-value="modelValue" :disabled="immutable" class="w-full" @update:model-value="emit('update:modelValue', $event)" />
  </UFormField>
</template>
