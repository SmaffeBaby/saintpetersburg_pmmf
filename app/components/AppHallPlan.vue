<script setup lang="ts">
const { title, description, placeholder, image } = await useHallPlan()
</script>

<template>
  <section id="hall-plan" aria-labelledby="hall-plan-title" class="hall-plan w-full scroll-mt-[130px] rounded-b-[40px] text-white lg:rounded-b-[60px]">
    <div class="mx-auto grid w-full max-w-[1614px] items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-[60px] lg:pb-[200px] lg:pt-[120px]">
      <div class="min-w-0">
        <h2 id="hall-plan-title" class="break-words font-days-one text-[34px] uppercase leading-[1.15] sm:text-[52px] lg:text-[70px]">{{ title }}</h2>
        <p class="mt-8 whitespace-pre-line break-words font-montserrat text-lg leading-[1.3] sm:text-xl lg:mt-10 lg:text-2xl">{{ description }}</p>
      </div>
      <div class="flex aspect-[770/500] min-w-0 items-center justify-center overflow-hidden rounded-[28px] bg-white sm:rounded-[40px]">
        <img v-if="image.src" :src="image.src" :alt="image.alt" width="770" height="500" class="h-full w-full object-contain" loading="lazy" decoding="async">
        <p v-else class="px-6 text-center font-montserrat text-xl leading-[1.3] text-[#8C64D8] lg:text-2xl">{{ placeholder }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hall-plan {
  background: linear-gradient(180deg, rgb(255 255 255 / 0%) 0%, rgb(255 255 255 / 20%) 100%);
}
</style>
