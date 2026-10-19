<script setup lang="ts">
const { title, speakers } = await useSpeakers()
</script>

<template>
  <section id="speakers" aria-labelledby="speakers-title" class="mx-auto w-full max-w-[1614px] scroll-mt-[130px] px-4 pb-24 text-white sm:px-8 lg:pb-[160px] lg:pt-[60px]">
    <div class="flex items-start justify-between gap-6">
      <h2 id="speakers-title" class="min-w-0 break-words font-days-one text-[34px] uppercase leading-[1.15] sm:text-[52px] lg:text-[70px]">{{ title }}</h2>
      <span class="hidden shrink-0 font-days-one text-[70px] leading-[1.15] text-white/20 sm:block" aria-hidden="true">///</span>
    </div>

    <ul class="mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 lg:mt-[70px] lg:grid-cols-3 lg:gap-x-[10px] lg:gap-y-5">
      <li v-for="(speaker, index) in speakers" :key="index" class="speaker-card min-w-0 rounded-[32px] px-6 pb-16 pt-16 text-center lg:rounded-[40px] lg:px-5 lg:pb-24 lg:pt-[120px]">
        <article>
          <img :src="speaker.image.src" :alt="speaker.image.alt" width="270" height="270" class="speaker-portrait mx-auto rounded-full object-cover" loading="lazy" decoding="async">
          <h3 class="mt-10 whitespace-pre-line break-words font-montserrat text-xl leading-[1.3] lg:text-2xl">{{ speaker.fullName }}</h3>
          <p class="mt-2 whitespace-pre-line break-words font-montserrat text-sm leading-[1.3] text-white/70 lg:text-base">{{ speaker.role }}</p>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.speaker-card {
  background: linear-gradient(180deg, rgb(255 255 255 / 20%) 0%, rgb(140 100 216 / 20%) 100%);
}

.speaker-portrait {
  width: clamp(180px, 14.07vw, 270px);
  max-width: calc(100% - 20px);
  height: auto;
  aspect-ratio: 1;
  box-shadow: -10px -10px 0 0 #FFFFFF, 10px 10px 0 0 #DAEF14;
}

@media (min-width: 1024px) {
  .speaker-card { min-height: 650px; }
}
</style>
