<script setup lang="ts">
defineProps<{ src: string; alt: string }>()
const languageStore = useLanguageStore()
const open = ref(false)
const zoom = ref(1)
const labels = computed(() => languageStore.locale === 'ru'
  ? { open: 'Открыть изображение', title: 'Просмотр изображения', close: 'Закрыть просмотр', in: 'Увеличить', out: 'Уменьшить', reset: 'По размеру экрана', hint: 'Увеличивайте изображение кнопками и прокручивайте, чтобы рассмотреть детали.' }
  : { open: 'Open image', title: 'Image viewer', close: 'Close image viewer', in: 'Zoom in', out: 'Zoom out', reset: 'Fit to screen', hint: 'Use the zoom buttons and scroll to explore the details.' })
watch(open, () => { zoom.value = 1 })
</script>

<template>
  <div>
    <UModal v-model:open="open" fullscreen :title="labels.title" :description="labels.hint"
      :ui="{ overlay: 'z-[60]', content: 'z-[60] bg-slate-950 text-white', header: 'border-white/20', title: 'text-white', description: 'text-white/70', close: 'text-white hover:bg-white/10', body: 'flex min-h-0 flex-1 flex-col gap-4 overflow-hidden' }">
      <button type="button" :aria-label="`${labels.open}: ${alt}`" class="group block w-full cursor-zoom-in rounded-[28px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:rounded-[40px] lg:rounded-[60px]">
        <img :src="src" :alt="alt" class="block h-auto w-full rounded-[28px] sm:rounded-[40px] lg:rounded-[60px]" loading="lazy" decoding="async">
        <span class="mt-3 inline-flex items-center gap-2 font-montserrat text-sm underline underline-offset-4 opacity-90 group-hover:opacity-100">
          <UIcon name="i-lucide-expand" class="size-4" aria-hidden="true" />{{ labels.open }}
        </span>
      </button>
      <template #close>
        <button type="button" :aria-label="labels.close" class="absolute right-4 top-4 grid size-11 place-items-center rounded-lg bg-white/15 text-white">
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </template>
      <template #body>
        <div class="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <button type="button" :aria-label="labels.out" :disabled="zoom <= 1" class="grid size-11 place-items-center rounded-lg bg-white/15 disabled:opacity-40" @click="zoom = Math.max(1, zoom - 0.5)">
            <UIcon name="i-lucide-minus" class="size-5" />
          </button>
          <span class="min-w-12 text-center font-montserrat text-sm" aria-live="polite">{{ Math.round(zoom * 100) }}%</span>
          <button type="button" :aria-label="labels.in" :disabled="zoom >= 4" class="grid size-11 place-items-center rounded-lg bg-white/15 disabled:opacity-40" @click="zoom = Math.min(4, zoom + 0.5)">
            <UIcon name="i-lucide-plus" class="size-5" />
          </button>
          <button type="button" class="min-h-11 rounded-lg bg-white/15 px-4 font-montserrat text-sm" @click="zoom = 1">{{ labels.reset }}</button>
        </div>
        <div class="min-h-0 flex-1 overflow-auto overscroll-contain rounded-lg" tabindex="0" :aria-label="alt">
          <img :src="src" :alt="alt" class="block h-auto max-w-none" :style="{ width: `${zoom * 100}%` }" decoding="async">
        </div>
      </template>
    </UModal>
  </div>
</template>
