<script setup lang="ts">
import { countryItems, countryFlag, countryName, type RegistrationDeliveryPolicy } from '#shared/utils/countries'
const props = defineProps<{ modelValue: RegistrationDeliveryPolicy & { organizerEmail: string } }>()
const emit = defineEmits<{ 'update:modelValue': [value: typeof props.modelValue] }>()
const items = countryItems('ru')
const modes = [
  { label: 'Всем участникам', value: 'all' },
  { label: 'Всем, кроме выбранных стран', value: 'except' },
  { label: 'Только выбранным странам', value: 'only' }
]
const selectedCountries = computed(() => props.modelValue.participantEmailMode === 'only'
  ? props.modelValue.includedCountries : props.modelValue.excludedCountries)
const updateCountries = (countries: string[]) => emit('update:modelValue', {
  ...props.modelValue, [props.modelValue.participantEmailMode === 'only' ? 'includedCountries' : 'excludedCountries']: countries
})
</script>

<template>
  <div class="space-y-6">
    <UFormField label="Почта организатора" description="На этот адрес приходят все регистрации, независимо от выбранной страны.">
      <UInput :model-value="modelValue.organizerEmail" type="email" class="mt-2 w-full" @update:model-value="emit('update:modelValue', { ...modelValue, organizerEmail: String($event) })" />
    </UFormField>
    <UFormField label="Кому отправлять письмо подтверждения">
      <USelect :model-value="modelValue.participantEmailMode" :items="modes" class="mt-2 w-full" @update:model-value="emit('update:modelValue', { ...modelValue, participantEmailMode: $event as RegistrationDeliveryPolicy['participantEmailMode'] })" />
    </UFormField>
    <template v-if="modelValue.participantEmailMode !== 'all'">
      <UFormField :label="modelValue.participantEmailMode === 'only' ? 'Отправлять участникам только из этих стран' : 'Не отправлять участникам из этих стран'" description="Можно выбрать одну или несколько стран. Поиск работает на русском и английском.">
        <USelectMenu :model-value="selectedCountries" :items="items" multiple value-key="code" :filter-fields="['search']" :search-input="{ placeholder: 'Поиск страны…' }" placeholder="Выберите страны" class="mt-2 w-full" @update:model-value="updateCountries($event)">
          <template #item-leading="{ item }"><span aria-hidden="true" class="text-xl">{{ item.flag }}</span></template>
          <template #empty>Страны не найдены</template>
        </USelectMenu>
      </UFormField>
      <ul class="flex flex-wrap gap-2" aria-label="Выбранные страны">
        <li v-for="code in selectedCountries" :key="code" class="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-900">
          <span aria-hidden="true">{{ countryFlag(code) }}</span>{{ countryName(code) }}
          <button type="button" :aria-label="`Убрать: ${countryName(code)}`" class="rounded px-1 hover:bg-violet-100" @click="updateCountries(selectedCountries.filter(item => item !== code))">×</button>
        </li>
      </ul>
      <p v-if="!selectedCountries.length" class="text-sm text-amber-700">{{ modelValue.participantEmailMode === 'only' ? 'Ни одна страна не выбрана: участникам письма отправляться не будут.' : 'Ни одна страна не исключена: письма будут отправляться всем участникам.' }}</p>
      <p class="text-sm text-slate-500">Англия доступна отдельным пунктом от Великобритании. Если правило должно действовать для обоих вариантов, выберите оба.</p>
    </template>
    <p class="text-sm text-slate-500">Все заявки сохраняются в админке. Организатор получает письмо при любом режиме. Нажмите «Сохранить», чтобы применить настройки.</p>
  </div>
</template>
