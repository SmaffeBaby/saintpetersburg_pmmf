<script setup lang="ts">
import type { AppLocale } from '~/stores/language'

const languageStore = useLanguageStore()
const { languages, logo, navItems, registrationLink } = await useHeader()
const isMenuOpen = ref(false)
const isCompact = ref(true)
const headerBar = ref<HTMLElement | null>(null)
const desktopLogo = ref<HTMLElement | null>(null)
const desktopNav = ref<HTMLElement | null>(null)
const desktopActions = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | undefined

// Measure the actual translated content, including labels edited in the admin.
// The desktop row remains measurable while the compact header is shown.
const updateLayout = () => {
  if (!headerBar.value || !desktopLogo.value || !desktopNav.value || !desktopActions.value) return
  const style = getComputedStyle(headerBar.value)
  const available = headerBar.value.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  const required = desktopLogo.value.offsetWidth + desktopNav.value.offsetWidth + desktopActions.value.offsetWidth + 48
  isCompact.value = available < required + 1
  if (!isCompact.value) isMenuOpen.value = false
}

onMounted(() => {
  resizeObserver = new ResizeObserver(updateLayout)
  for (const element of [headerBar.value, desktopLogo.value, desktopNav.value, desktopActions.value]) {
    if (element) resizeObserver.observe(element)
  }
  updateLayout()
})
onBeforeUnmount(() => resizeObserver?.disconnect())

const currentLocale = computed<AppLocale>({
  get: () => languageStore.locale,
  set: (value: AppLocale) => {
    languageStore.setLocale(value)
    isMenuOpen.value = false
  }
})

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="fixed inset-x-0 top-5 z-50 px-4 sm:top-8 sm:px-8 xl:top-10">
    <div
      ref="headerBar"
      class="relative mx-auto w-full max-w-[1550px] rounded-[20px] bg-white shadow-sm"
      :class="isCompact ? 'px-4 py-3 sm:px-5' : 'min-h-20 px-[15px] py-[10px]'"
    >
      <div v-if="isCompact" class="flex items-center justify-between gap-3">
        <NuxtLink class="flex min-w-0 items-center" to="/" :aria-label="logo.alt" @click="closeMenu">
          <img class="h-auto w-[130px] sm:w-[159px]" :src="logo.src" :alt="logo.alt" width="159" height="58">
        </NuxtLink>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <AppLanguageSwitcher id="mobile-language-switcher" v-model="currentLocale" :languages="languages" />
          <button
            class="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#8B63D9] text-white transition-colors duration-200 hover:bg-[#892AF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
            type="button"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-header-menu"
            :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
            @click="isMenuOpen = !isMenuOpen"
          >
            <span class="relative block h-4 w-5">
              <span class="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform" :class="isMenuOpen ? 'translate-y-[7px] rotate-45' : ''" />
              <span class="absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity" :class="isMenuOpen ? 'opacity-0' : 'opacity-100'" />
              <span class="absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform" :class="isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''" />
            </span>
          </button>
        </div>
      </div>

      <div
        class="grid grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] items-center gap-6"
        :class="isCompact ? 'pointer-events-none invisible absolute inset-0 overflow-hidden' : ''"
        :inert="isCompact"
        :aria-hidden="isCompact ? true : undefined"
      >
        <div ref="desktopLogo" class="shrink-0 justify-self-start">
          <NuxtLink class="flex items-center" to="/" :aria-label="logo.alt" @click="closeMenu">
            <img class="h-[58px] w-[159px] object-contain" :src="logo.src" :alt="logo.alt" width="159" height="58">
          </NuxtLink>
        </div>

        <nav ref="desktopNav" class="flex shrink-0 items-center justify-center gap-5 whitespace-nowrap font-montserrat text-sm uppercase leading-none text-black">
          <NuxtLink
            v-for="item in navItems"
            :key="item.href"
            class="transition-colors duration-200 hover:text-[#892AF0] focus-visible:text-[#892AF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
            :to="item.href"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div ref="desktopActions" class="flex shrink-0 items-center justify-self-end gap-5 whitespace-nowrap">
          <AppLanguageSwitcher id="language-switcher" v-model="currentLocale" :languages="languages" />
          <AppRegistrationButton :href="registrationLink.href" :label="registrationLink.label" />
        </div>
      </div>

      <div
        v-if="isCompact"
        id="mobile-header-menu"
        :inert="!isMenuOpen"
        class="transition-[max-height,opacity] duration-300"
        :class="isMenuOpen ? 'max-h-[420px] overflow-visible opacity-100' : 'max-h-0 overflow-hidden opacity-0'"
      >
        <div class="flex flex-col gap-5 pb-2 pt-5">
          <nav class="flex flex-col gap-4 font-montserrat text-sm uppercase leading-none text-black">
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              class="transition-colors duration-200 hover:text-[#892AF0] focus-visible:text-[#892AF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
              :to="item.href"
              @click="closeMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="flex items-center border-t border-black/10 pt-5">
            <AppRegistrationButton :href="registrationLink.href" :label="registrationLink.label" @click="closeMenu" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
