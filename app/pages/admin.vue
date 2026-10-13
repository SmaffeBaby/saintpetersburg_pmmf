<script setup lang="ts">
interface RegistrationSubmission {
  id: string
  createdAt: string
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  region: string
  email: string
  phone: string
}

const password = ref('')
const isAuthenticated = ref(false)
const isLoggingIn = ref(false)
const loginError = ref('')
const isLoading = ref(false)
const submissions = ref<RegistrationSubmission[]>([])
const filters = reactive({
  search: '',
  region: '',
  dateFrom: '',
  dateTo: ''
})

useHead({
  title: 'PMMF Admin'
})

const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(value))

const fetchSubmissions = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ items: RegistrationSubmission[] }>('/api/admin/registrations')
    submissions.value = response.items
    isAuthenticated.value = true
  } finally {
    isLoading.value = false
  }
}

const login = async () => {
  if (!password.value || isLoggingIn.value) {
    return
  }

  isLoggingIn.value = true
  loginError.value = ''

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        password: password.value
      }
    })
    password.value = ''
    await fetchSubmissions()
  } catch (error) {
    loginError.value = 'Неверный пароль или админка ещё не настроена.'
  } finally {
    isLoggingIn.value = false
  }
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

onMounted(async () => {
  try {
    await fetchSubmissions()
  } catch (error) {
    isAuthenticated.value = false
  }
})
</script>

<template>
  <main class="min-h-screen bg-[#F7F2FF] px-4 py-6 font-montserrat text-[#22172F] sm:px-6 lg:px-10">
    <section v-if="!isAuthenticated" class="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[520px] flex-col justify-center">
      <div class="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
        <p class="font-days-one text-sm uppercase tracking-normal text-[#892AF0]">
          PMMF Admin
        </p>
        <h1 class="mt-4 font-days-one text-[34px] uppercase leading-none text-[#22172F] sm:text-[46px]">
          Вход
        </h1>

        <form class="mt-8" @submit.prevent="login">
          <label class="block">
            <span class="text-sm font-semibold text-[#6B6175]">Пароль администратора</span>
            <input
              v-model="password"
              class="mt-2 h-14 w-full rounded-[18px] border border-[#D8C6EC] bg-white px-4 text-lg font-semibold outline-none transition-colors focus:border-[#892AF0]"
              type="password"
              autocomplete="current-password"
              required
            >
          </label>

          <p v-if="loginError" class="mt-4 text-sm font-semibold text-[#E23939]">
            {{ loginError }}
          </p>

          <button
            class="mt-6 flex h-14 w-full items-center justify-center rounded-[18px] bg-[#892AF0] px-5 font-days-one text-sm uppercase text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            :disabled="isLoggingIn"
          >
            {{ isLoggingIn ? 'Проверяем...' : 'Войти' }}
          </button>
        </form>
      </div>
    </section>

    <section v-else class="mx-auto w-full max-w-[1500px]">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="font-days-one text-sm uppercase text-[#892AF0]">
            PMMF Admin
          </p>
          <h1 class="mt-3 font-days-one text-[34px] uppercase leading-none text-[#22172F] sm:text-[52px]">
            Заявки
          </h1>
        </div>

        <a
          class="flex h-12 items-center justify-center rounded-[16px] bg-[#892AF0] px-5 font-days-one text-xs uppercase text-white transition-opacity hover:opacity-90"
          :href="exportUrl"
        >
          Скачать Excel
        </a>
      </div>

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
          <table class="min-w-[1040px] w-full border-collapse text-left text-sm">
            <thead class="bg-[#F7F2FF] text-xs uppercase text-[#6B6175]">
              <tr>
                <th class="px-4 py-3">Дата</th>
                <th class="px-4 py-3">ФИО</th>
                <th class="px-4 py-3">Дата рождения</th>
                <th class="px-4 py-3">Регион</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Телефон</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredSubmissions.length">
                <td class="px-4 py-8 text-center text-[#6B6175]" colspan="6">
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>
