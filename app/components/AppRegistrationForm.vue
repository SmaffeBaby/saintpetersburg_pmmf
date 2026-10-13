<script setup lang="ts">
const { agreement, fields, submitLabel, title } = await useRegistrationForm()
const isConsentAccepted = ref(false)
const isSubmitting = ref(false)
const form = reactive<Record<string, string>>({})
const popup = reactive({
  open: false,
  title: '',
  message: '',
  tone: 'success' as 'success' | 'error'
})

watchEffect(() => {
  fields.value.forEach((field) => {
    if (!(field.name in form)) {
      form[field.name] = ''
    }
  })
})

const getFieldClass = (layout: 'third' | 'half') => layout === 'third'
  ? 'lg:col-span-4'
  : 'lg:col-span-6'

const showPopup = (title: string, message: string, tone: 'success' | 'error' = 'success') => {
  popup.title = title
  popup.message = message
  popup.tone = tone
  popup.open = true
}

const submitForm = async () => {
  if (!isConsentAccepted.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/registration/submit', {
      method: 'POST',
      body: form
    })

    fields.value.forEach((field) => {
      form[field.name] = ''
    })
    isConsentAccepted.value = false

    showPopup(
      'Заявка отправлена',
      'Данные отправлены на почту develop@magnatmedia.com. На ваш email также ушло подтверждение об успешной отправке письма.'
    )
  } catch (error) {
    showPopup(
      'Не получилось отправить',
      'Проверьте заполнение формы и попробуйте ещё раз. Если ошибка повторится, напишите нам напрямую на develop@magnatmedia.com.',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section id="registration" class="w-full overflow-hidden rounded-[40px] bg-[#892AF0] py-16 text-white sm:py-20 lg:min-h-[1057px] lg:rounded-[80px] lg:pb-[120px] lg:pt-[120px]">
    <div class="mx-auto w-full max-w-[1550px] px-4 sm:px-8">
      <h2 class="font-days-one text-[42px] uppercase leading-none text-white sm:text-[56px] lg:text-[70px]">
        {{ title }}
      </h2>

      <form class="mt-14 lg:mt-[70px]" @submit.prevent="submitForm">
        <div class="grid gap-y-6 lg:grid-cols-12 lg:gap-x-[10px] lg:gap-y-[28px]">
          <label
            v-for="field in fields"
            :key="field.id"
            class="flex flex-col gap-[15px]"
            :class="getFieldClass(field.layout)"
            :for="field.id"
          >
            <span class="font-montserrat text-xl font-semibold leading-[1.3] text-white sm:text-2xl">
              {{ field.label }}
            </span>
            <input
              :id="field.id"
              v-model="form[field.name]"
              class="h-[72px] w-full rounded-[20px] border-2 border-white bg-transparent px-5 font-montserrat text-xl font-semibold leading-[1.3] text-white outline-none transition-colors placeholder:text-white/50 focus:border-white focus:bg-white/10 sm:text-2xl"
              :name="field.name"
              :type="field.type"
              :placeholder="field.placeholder"
              :autocomplete="field.autocomplete"
              required
            >
          </label>
        </div>

        <label class="mt-8 flex items-center gap-[15px] font-montserrat text-base font-semibold leading-[1.3] text-white sm:text-xl lg:mt-10 lg:text-2xl">
          <input v-model="isConsentAccepted" class="peer sr-only" type="checkbox" required>
          <span class="grid size-10 shrink-0 place-items-center rounded-[10px] border-2 border-white transition-colors peer-checked:bg-white/10">
            <svg
              v-show="isConsentAccepted"
              class="h-5 w-6"
              viewBox="0 0 24 18"
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 8.5L8.5 15L22 2" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ agreement }}</span>
        </label>

        <button
          class="mt-11 flex h-14 w-full items-center justify-center rounded-[20px] bg-white px-5 font-days-one text-sm uppercase leading-[1.3] text-[#892AF0] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:mt-[58px] lg:h-20"
          type="submit"
          :disabled="!isConsentAccepted || isSubmitting"
        >
          {{ isSubmitting ? 'Отправляем...' : submitLabel }}
        </button>
      </form>
    </div>
  </section>

  <AppFormPopup
    :open="popup.open"
    :title="popup.title"
    :message="popup.message"
    :tone="popup.tone"
    @close="popup.open = false"
  />
</template>
