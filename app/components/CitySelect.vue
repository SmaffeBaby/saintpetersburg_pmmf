<script setup lang="ts">
import type { CityOption } from '#shared/types/city'
const props = defineProps<{ modelValue?: string; country?: string; id: string; name: string; placeholder: string; locale: 'ru' | 'en'; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const search = ref('')
const open = ref(false)
const items = ref<CityOption[]>([])
const loading = ref(false)
const failed = ref(false)
const selectedNames = ref<{ value: string; ru: string; en: string } | null>(null)
const displayValue = computed(() => selectedNames.value?.value === props.modelValue
  ? selectedNames.value?.[props.locale] : props.modelValue)
const select = (value: string) => {
  const option = items.value.find(item => item.value === value)
  selectedNames.value = option ? { value, ...option.names } : null
  emit('update:modelValue', value)
}
watch(() => props.country, () => { search.value = ''; open.value = false })
watch([() => props.country, search, () => props.locale], ([country, query, locale], _, onCleanup) => {
  items.value = []
  failed.value = false
  loading.value = !!country
  if (!country || !import.meta.client) return
  const controller = new AbortController()
  const timer = setTimeout(async () => {
    try {
      const response = await $fetch<{ items: CityOption[] }>('/api/locations/cities', { query: { country, q: query, locale }, signal: controller.signal })
      if (!controller.signal.aborted) items.value = response.items
    } catch {
      if (!controller.signal.aborted) failed.value = true
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  }, 250)
  onCleanup(() => { clearTimeout(timer); controller.abort() })
}, { immediate: true })
const create = (value: string) => {
  if (!value.trim()) return
  selectedNames.value = null
  emit('update:modelValue', value.trim())
  open.value = false
  search.value = ''
}
</script>

<template>
  <span class="block">
    <USelectMenu :id="id" v-model:search-term="search" v-model:open="open" :name="name" :model-value="modelValue || undefined" :items="items" value-key="value" ignore-filter
      :create-item="{ when: 'always', position: 'bottom' }" :loading="loading" :disabled="disabled || !country" required
      :search-input="{ placeholder: locale === 'en' ? 'Search cities…' : 'Поиск города…', maxlength: 200 }"
      :placeholder="country ? placeholder : locale === 'en' ? 'Select a country first' : 'Сначала выберите страну'"
      class="w-full" :ui="{ base: 'box-border h-[72px] w-full min-w-0 max-w-full rounded-[20px] border-2 border-white bg-transparent px-5 font-montserrat text-xl font-semibold leading-[1.3] text-white ring-0 disabled:bg-transparent disabled:opacity-60 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:text-2xl md:text-2xl', placeholder: 'text-white/50', content: 'rounded-2xl bg-white text-slate-900', item: 'py-3 text-base', trailingIcon: 'text-white' }"
      @update:model-value="select($event || '')" @create="create">
      <template #default><span class="truncate" :class="modelValue ? 'text-white' : 'text-white/50'">{{ displayValue || (country ? placeholder : locale === 'en' ? 'Select a country first' : 'Сначала выберите страну') }}</span></template>
      <template #empty>{{ loading ? (locale === 'en' ? 'Loading…' : 'Загрузка…') : locale === 'en' ? 'No cities found. Enter your city below.' : 'Город не найден. Можно указать свой вариант ниже.' }}</template>
      <template #create-item-label="{ item }">{{ locale === 'en' ? 'Use:' : 'Указать:' }} {{ item }}</template>
    </USelectMenu>
    <span v-if="failed" role="status" class="block text-sm">{{ locale === 'en' ? 'Could not load suggestions. You can enter your city manually.' : 'Не удалось загрузить подсказки. Можно ввести город вручную.' }}</span>
  </span>
</template>
