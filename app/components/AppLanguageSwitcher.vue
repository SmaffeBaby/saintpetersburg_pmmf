<script setup lang="ts">
import type { AppLocale } from '~/stores/language'
import languageChevron from '~/assets/icons/language-chevron.svg'

interface LanguageOption {
  code: AppLocale
  label: string
}

const props = defineProps<{
  id: string
  languages: LanguageOption[]
  modelValue: AppLocale
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AppLocale]
}>()

const isOpen = ref(false)
const switcherRef = ref<HTMLElement | null>(null)

const currentLanguage = computed(() => (
  props.languages.find((language) => language.code === props.modelValue) || props.languages[0] || { code: props.modelValue, label: props.modelValue.toUpperCase() }
))

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (language: LanguageOption) => {
  emit('update:modelValue', language.code)
  isOpen.value = false
}

const closeOnOutsideClick = (event: PointerEvent) => {
  if (!switcherRef.value?.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('pointerdown', closeOnOutsideClick)
  window.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', closeOnOutsideClick)
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div ref="switcherRef" class="relative h-[50px] w-[61px] shrink-0">
    <button
      :id="id"
      class="relative z-20 flex h-[50px] w-[61px] cursor-pointer items-center justify-center gap-[5px] rounded-[15px] px-[15px] pb-[17px] pt-4 font-montserrat text-sm font-medium uppercase leading-none text-black transition-colors duration-200 hover:bg-[#eff4fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
      :class="isOpen ? 'bg-[#eff4fd]' : 'bg-white'"
      type="button"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-controls="`${id}-listbox`"
      @click="toggleMenu"
    >
      <span>{{ currentLanguage.label }}</span>
      <img
        class="h-[3px] w-1 transition-transform duration-300 ease-out"
        :class="isOpen ? 'rotate-180' : 'rotate-0'"
        :src="languageChevron"
        alt=""
        width="4"
        height="3"
      >
    </button>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="isOpen"
        :id="`${id}-listbox`"
        class="absolute left-0 top-0 z-10 h-[119px] w-[61px] rounded-[15px] bg-[#eff4fd]"
        role="listbox"
        :aria-labelledby="id"
      >
        <div class="absolute left-1/2 top-[58px] flex -translate-x-1/2 flex-col gap-1">

          <button
              v-for="language in languages"
              :key="language.code"
              class="flex h-[27px] w-[57px] cursor-pointer items-center justify-center rounded-full bg-white px-[17px] py-[5px] font-montserrat text-sm font-medium uppercase leading-none text-black transition-colors duration-200 hover:bg-[#892AF0] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              type="button"
              role="option"
              :aria-selected="language.code === modelValue"
              @click="selectLanguage(language)"
          >
            {{ language.label }}
          </button>

        </div>
      </div>
    </Transition>
  </div>
</template>
