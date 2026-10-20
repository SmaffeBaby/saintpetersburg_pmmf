<script setup lang="ts">
import type { SectionVisibility } from '../../shared/config/content'

await useAsyncData('site-visibility', () => $fetch<SectionVisibility>('/api/content/visibility'))
const { isVisible } = useSiteVisibility()
</script>

<template>
  <main class="min-h-screen bg-[#8C64D8] text-black">
    <section
      v-if="isVisible('header') || isVisible('hero')"
      class="relative overflow-hidden"
    >
      <AppHeader v-if="isVisible('header')" />
      <AppHero v-if="isVisible('hero')" />
    </section>
    <AppAbout v-if="isVisible('about')" v-reveal class="mt-24 lg:mt-[120px]" />
    <AppLoftHall v-if="isVisible('loft-hall')" v-reveal class="relative z-10" />
    <AppSchedule v-if="isVisible('schedule')" v-reveal />
    <AppProgram v-if="isVisible('program')" v-reveal />
    <AppSpeakers v-if="isVisible('speakers')" v-reveal />
    <div v-if="isVisible('information-partners') || isVisible('registration-form')" class="rounded-[40px] bg-white lg:rounded-[80px]">
      <AppInformationPartners v-if="isVisible('information-partners')" v-reveal />
      <AppRegistrationForm v-if="isVisible('registration-form')" v-reveal />
    </div>
    <AlternativeForum v-if="isVisible('alternative-forum')" v-reveal />
    <AppFooter v-if="isVisible('footer')" v-reveal />
  </main>
</template>
