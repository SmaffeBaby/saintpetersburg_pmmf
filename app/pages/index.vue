<script setup lang="ts">
import backgroundImage from '~/assets/images/background.png'
</script>

<template>
  <main class="min-h-screen bg-brand-blue text-black">
    <section
      class="relative min-h-screen overflow-hidden bg-cover bg-top bg-no-repeat lg:min-h-[1080px]"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <div class="absolute inset-x-0 bottom-0 h-[490px] bg-gradient-to-b from-brand-blue/0 to-brand-blue" />
      <AppHeader />
      <AppHero />
    </section>
  </main>
</template>
