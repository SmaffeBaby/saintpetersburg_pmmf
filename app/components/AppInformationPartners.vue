<script setup lang="ts">
const { title, partners } = await useInformationPartners()
</script>

<template>
  <section id="information-partners" aria-labelledby="information-partners-title" class="w-full rounded-t-[40px] bg-white pb-24 pt-16 text-black sm:py-24 lg:rounded-t-[80px] lg:pb-[210px] lg:pt-[160px]">
    <div class="mx-auto w-full max-w-[1550px] px-4 sm:px-8">
      <h2 id="information-partners-title" class="break-words font-days-one text-[32px] uppercase leading-[1.15] sm:text-[48px] lg:text-[70px]">
        {{ title }}
      </h2>
      <ul class="mt-12 flex list-none flex-wrap items-center gap-x-16 gap-y-12 p-0 sm:mt-16 lg:mt-[100px] lg:gap-x-[200px]">
        <li v-for="(partner, index) in partners" :key="index" class="flex w-full max-w-[520px] items-center sm:w-[calc(50%-2rem)] lg:w-auto">
          <img
            :src="partner.src"
            :alt="partner.alt"
            class="max-h-[160px] w-auto max-w-full object-contain object-left"
            loading="lazy"
            decoding="async"
          >
        </li>
      </ul>
    </div>
  </section>
</template>
