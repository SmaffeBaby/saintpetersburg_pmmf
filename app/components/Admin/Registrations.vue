<script setup lang="ts">
import type { RegistrationSubmission } from '../../../shared/types/registration'
const emit = defineEmits<{ unauthorized: [] }>()
const isLoading = ref(false)
const deletingId = ref('')
const submissions = ref<RegistrationSubmission[]>([])
const errorMessage = ref('')
const filters = reactive({ search: '', region: '', dateFrom: '', dateTo: '' })
const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const fetchSubmissions = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const result = await $fetch<{ items: RegistrationSubmission[] }>('/api/admin/registrations')
    submissions.value = result.items
  } catch (error: any) {
    if (error.statusCode === 401) emit('unauthorized')
    errorMessage.value = 'Не удалось загрузить заявки.'
  } finally { isLoading.value = false }
}
const filteredSubmissions = computed(() => submissions.value.filter((submission) => {
  const search = filters.search.trim().toLowerCase()
  const region = filters.region.trim().toLowerCase()

  if (search) {
    const haystack = [
      submission.lastName,
      submission.firstName,
      submission.middleName,
      submission.email,
      submission.phone,
      submission.region
    ].join(' ').toLowerCase()

    if (!haystack.includes(search)) {
      return false
    }
  }

  if (region && !submission.region.toLowerCase().includes(region)) {
    return false
  }

  if (filters.dateFrom && submission.createdAt < `${filters.dateFrom}T00:00:00.000Z`) {
    return false
  }

  if (filters.dateTo && submission.createdAt > `${filters.dateTo}T23:59:59.999Z`) {
    return false
  }

  return true
}))

const exportUrl = computed(() => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const query = params.toString()
  return `/api/admin/registrations/export${query ? `?${query}` : ''}`
})

const deleteSubmission = async (submission: RegistrationSubmission) => {
  const fullName = [submission.lastName, submission.firstName, submission.middleName].filter(Boolean).join(' ')
  const confirmed = window.confirm(`Удалить заявку ${fullName || submission.email}?`)

  if (!confirmed || deletingId.value) {
    return
  }

  deletingId.value = submission.id

  try {
    await $fetch(`/api/admin/registrations/${submission.id}`, {
      method: 'DELETE'
    })
    submissions.value = submissions.value.filter((item) => item.id !== submission.id)
  } catch (error) {
    window.alert('Не получилось удалить заявку. Обновите страницу и попробуйте ещё раз.')
  } finally {
    deletingId.value = ''
  }
}

onMounted(fetchSubmissions)
</script>
<template>
  <div class="mx-auto w-full max-w-[1500px]">
    <div class="flex items-center justify-between"><p class="text-slate-500">Регистрации участников форума</p><UButton :href="exportUrl" label="Скачать Excel" icon="i-lucide-download" /></div>
    <UAlert v-if="errorMessage" class="mt-4" color="error" :description="errorMessage" />
      <div class="mt-8 grid gap-3 rounded-[24px] bg-white p-4 shadow-lg sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
        <label class="block">
          <span class="text-xs font-bold uppercase text-[#6B6175]">Поиск</span>
          <input v-model="filters.search" class="mt-2 h-12 w-full rounded-[14px] border border-[#D8C6EC] px-3 outline-none focus:border-[#892AF0]" type="search">
        </label>
        <label class="block">
          <span class="text-xs font-bold uppercase text-[#6B6175]">Регион</span>
          <input v-model="filters.region" class="mt-2 h-12 w-full rounded-[14px] border border-[#D8C6EC] px-3 outline-none focus:border-[#892AF0]" type="search">
        </label>
        <label class="block">
          <span class="text-xs font-bold uppercase text-[#6B6175]">С даты</span>
          <input v-model="filters.dateFrom" class="mt-2 h-12 w-full rounded-[14px] border border-[#D8C6EC] px-3 outline-none focus:border-[#892AF0]" type="date">
        </label>
        <label class="block">
          <span class="text-xs font-bold uppercase text-[#6B6175]">По дату</span>
          <input v-model="filters.dateTo" class="mt-2 h-12 w-full rounded-[14px] border border-[#D8C6EC] px-3 outline-none focus:border-[#892AF0]" type="date">
        </label>
      </div>

      <div class="mt-5 overflow-hidden rounded-[24px] bg-white shadow-lg">
        <div class="flex items-center justify-between border-b border-[#EEE5F8] px-4 py-4 sm:px-5">
          <p class="text-sm font-bold uppercase text-[#6B6175]">
            Найдено: {{ filteredSubmissions.length }}
          </p>
          <button class="text-sm font-bold text-[#892AF0]" type="button" @click="fetchSubmissions">
            {{ isLoading ? 'Обновляем...' : 'Обновить' }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-[1160px] w-full border-collapse text-left text-sm">
            <thead class="bg-[#F7F2FF] text-xs uppercase text-[#6B6175]">
              <tr>
                <th class="px-4 py-3">Дата</th>
                <th class="px-4 py-3">ФИО</th>
                <th class="px-4 py-3">Дата рождения</th>
                <th class="px-4 py-3">Регион</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Телефон</th>
                <th class="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredSubmissions.length">
                <td class="px-4 py-8 text-center text-[#6B6175]" colspan="7">
                  Заявок пока нет
                </td>
              </tr>
              <tr v-for="submission in filteredSubmissions" :key="submission.id" class="border-t border-[#EEE5F8]">
                <td class="px-4 py-4 font-semibold">{{ formatDate(submission.createdAt) }}</td>
                <td class="px-4 py-4 font-semibold">{{ submission.lastName }} {{ submission.firstName }} {{ submission.middleName }}</td>
                <td class="px-4 py-4">{{ submission.birthDate }}</td>
                <td class="px-4 py-4">{{ submission.region }}</td>
                <td class="px-4 py-4">{{ submission.email }}</td>
                <td class="px-4 py-4">{{ submission.phone }}</td>
                <td class="px-4 py-4 text-right">
                  <button
                    class="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#F1B8B8] px-4 text-xs font-bold uppercase text-[#D62F2F] transition-colors hover:bg-[#FFF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    :disabled="Boolean(deletingId)"
                    @click="deleteSubmission(submission)"
                  >
                    {{ deletingId === submission.id ? 'Удаляем...' : 'Удалить' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

  </div>
</template>
