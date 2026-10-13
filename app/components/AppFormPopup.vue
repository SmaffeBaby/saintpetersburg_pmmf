<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  tone?: 'success' | 'error'
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-[#1B0E2A]/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:px-6"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-[560px] rounded-[28px] bg-white p-6 text-[#22172F] shadow-2xl sm:rounded-[34px] sm:p-8 lg:p-10">
          <div
            class="mb-6 grid size-14 place-items-center rounded-2xl sm:size-16"
            :class="tone === 'error' ? 'bg-[#FFF1F1] text-[#E23939]' : 'bg-[#F2E6FF] text-[#892AF0]'"
          >
            <svg v-if="tone === 'error'" class="size-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 8v5M12 17h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            </svg>
            <svg v-else class="size-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <h3 class="font-days-one text-[28px] uppercase leading-[1.05] text-[#892AF0] sm:text-[34px]">
            {{ title }}
          </h3>
          <p class="mt-4 font-montserrat text-base font-semibold leading-[1.55] text-[#463650] sm:text-lg">
            {{ message }}
          </p>

          <button
            class="mt-8 flex h-14 w-full items-center justify-center rounded-[18px] bg-[#892AF0] px-5 font-days-one text-sm uppercase text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#892AF0] sm:w-auto sm:min-w-[190px]"
            type="button"
            @click="$emit('close')"
          >
            Ок
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
