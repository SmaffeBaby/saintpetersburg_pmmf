<script setup lang="ts">
import { countryItems, countryFlag } from '#shared/utils/countries'
const props = defineProps<{ modelValue?: string; id: string; name: string; placeholder: string; locale: 'ru' | 'en'; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const items = computed(() => countryItems(props.locale))
</script>

<template>
  <USelectMenu :id="id" :name="name" :model-value="modelValue || undefined" :items="items" value-key="code" :filter-fields="['search']"
    :search-input="{ placeholder: locale === 'en' ? 'Search countries…' : 'Поиск страны…' }" :placeholder="placeholder" :disabled="disabled" required
    class="w-full" :ui="{ base: 'h-[72px] w-full rounded-[20px] border-2 border-white bg-transparent pl-14 pr-10 font-montserrat text-xl font-semibold text-white ring-0 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:text-2xl md:text-2xl', placeholder: 'text-white/50', leading: 'pl-5', content: 'rounded-2xl bg-white text-slate-900', item: 'py-3 text-base', trailingIcon: 'text-white' }"
    @update:model-value="emit('update:modelValue', $event || '')">
    <template #leading><span class="text-2xl" aria-hidden="true">{{ modelValue ? countryFlag(modelValue) : '🌐' }}</span></template>
    <template #item-leading="{ item }"><span class="text-2xl" aria-hidden="true">{{ item.flag }}</span></template>
    <template #empty>{{ locale === 'en' ? 'No countries found' : 'Страны не найдены' }}</template>
  </USelectMenu>
</template>
