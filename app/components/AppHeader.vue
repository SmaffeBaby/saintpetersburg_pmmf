<script setup lang="ts">
import type { AppLocale } from '~/stores/language'

const languageStore = useLanguageStore()
const { languages, logo, navItems, registrationLink } = await useHeader()
const isMenuOpen = ref(false)

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
      class="mx-auto w-full max-w-[1550px] rounded-[20px] bg-white px-4 py-3 shadow-sm sm:px-5 xl:grid xl:min-h-20 xl:grid-cols-[minmax(200px,1fr)_auto_minmax(250px,1fr)] xl:items-center xl:gap-6 xl:px-[15px] xl:py-[10px]"
    >
      <div class="flex items-center justify-between gap-4 xl:contents">
        <NuxtLink class="flex min-w-0 items-center gap-3 sm:gap-5 xl:justify-self-start" to="/" :aria-label="logo.alt" @click="closeMenu">
          <img
            class="h-auto w-[130px] shrink-0 sm:w-[159px] xl:h-[58px] xl:w-[159px] xl:object-contain"
            :src="logo.src"
            :alt="logo.alt"
            width="159"
            height="58"
          >
        </NuxtLink>

        <button
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#8B63D9] text-white transition-colors duration-200 hover:bg-[#892AF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan xl:hidden"
          type="button"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-header-menu"
          :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span class="relative block h-4 w-5">
            <span
              class="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform"
              :class="isMenuOpen ? 'translate-y-[7px] rotate-45' : ''"
            />
            <span
              class="absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity"
              :class="isMenuOpen ? 'opacity-0' : 'opacity-100'"
            />
            <span
              class="absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform"
              :class="isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''"
            />
          </span>
        </button>
      </div>

      <nav class="hidden items-center justify-center gap-5 font-montserrat text-sm uppercase leading-none text-black xl:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.href"
          class="transition-colors duration-200 hover:text-[#892AF0] focus-visible:text-[#892AF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
          :to="item.href"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="hidden shrink-0 items-center justify-end gap-5 xl:flex">
        <AppLanguageSwitcher id="language-switcher" v-model="currentLocale" :languages="languages" />

        <AppRegistrationButton :href="registrationLink.href" :label="registrationLink.label" />
      </div>

      <div
        id="mobile-header-menu"
        :inert="!isMenuOpen"
        class="transition-[max-height,opacity] duration-300 xl:hidden"
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

          <div class="flex items-center justify-between gap-4 border-t border-black/10 pt-5">
            <AppLanguageSwitcher id="mobile-language-switcher" v-model="currentLocale" :languages="languages" />

            <AppRegistrationButton :href="registrationLink.href" :label="registrationLink.label" @click="closeMenu" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
