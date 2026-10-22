<script setup lang="ts">
defineProps<{ label: string }>()

const open = ref(false)
const languageStore = useLanguageStore()
const mapTitle = computed(() => languageStore.locale === 'ru' ? 'LOFT HALL на карте' : 'LOFT HALL on the map')
const closeLabel = computed(() => languageStore.locale === 'ru' ? 'Закрыть карту' : 'Close map')
const externalLabel = computed(() => languageStore.locale === 'ru' ? 'Открыть в Яндекс Картах' : 'Open in Yandex Maps')
const mapUrl = 'https://yandex.ru/map-widget/v1/?ll=30.367114%2C59.955446&mode=search&oid=101079510683&ol=biz&z=15.79'
</script>

<template>
  <UModal
    v-model:open="open"
    :title="mapTitle"
    :description="mapTitle"
    :ui="{
      overlay: 'z-[60] bg-black/65',
      content: 'z-[60] w-[calc(100vw-2rem)] max-w-[1150px] overflow-visible bg-transparent shadow-none ring-0 divide-none'
    }"
  >
    <button type="button" class="min-h-[58px] rounded-[20px] border-2 border-[#8C64D8] bg-[#8C64D8] px-5 py-4 font-days-one text-xs uppercase leading-tight text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C64D8] sm:text-sm">
      {{ label }}
    </button>

    <template #content="{ close }">
      <div class="relative pt-14">
        <button
          type="button"
          class="absolute right-0 top-0 grid size-11 place-items-center rounded-xl bg-white text-[#8C64D8] transition-colors hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          :aria-label="closeLabel"
          @click="close"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>

        <div class="overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]">
          <iframe
            v-if="open"
            :src="mapUrl"
            :title="mapTitle"
            class="venue-map-frame block w-full border-0"
            credentialless
            allowfullscreen
          />
          <a
            href="https://yandex.ru/maps/org/loft_hall/101079510683/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-h-11 items-center justify-center px-4 py-3 text-center font-montserrat text-sm font-semibold text-[#8C64D8] underline underline-offset-4 hover:text-[#892AF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#8C64D8]"
          >
            {{ externalLabel }}
          </a>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.venue-map-frame {
  height: min(65dvh, 600px, calc(100dvh - 160px));
}
</style>
