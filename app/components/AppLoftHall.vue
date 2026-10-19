<script setup lang="ts">
const { title, city, subtitle, description, date, mapLabel, registration, image } = await useLoftHall()
</script>

<template>
  <section id="loft-hall" aria-labelledby="loft-hall-title" class="relative w-full text-[#8C64D8]">
    <div class="rounded-[40px] bg-white pb-16 pt-12 sm:pb-20 lg:rounded-[60px_60px_60px_0] lg:pb-[120px] lg:pt-[90px]">
      <div class="mx-auto w-full max-w-[1614px] px-4 sm:px-8">
        <h2 id="loft-hall-title" class="loft-title break-words font-days-one uppercase leading-none">{{ title }}</h2>

        <div class="mt-12 grid items-start gap-10 lg:mt-[90px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-[80px]">
          <div>
            <p class="font-days-one text-base uppercase leading-[1.3] text-[#C6B0ED] sm:text-xl lg:text-[28px]">
              <span aria-hidden="true">///&nbsp; </span>{{ city }}
            </p>
            <h3 class="mt-4 whitespace-pre-line break-words font-days-one text-[26px] uppercase leading-[1.25] sm:text-[36px] lg:text-[48px]">{{ subtitle }}</h3>
            <p class="mt-8 whitespace-pre-line font-montserrat text-lg leading-[1.3] sm:text-xl lg:mt-10 lg:text-2xl">{{ description }}</p>
            <p class="mt-8 font-days-one text-xl uppercase leading-[1.3] lg:mt-10 lg:text-[28px]">{{ date }}</p>

            <div class="mt-8 flex flex-wrap gap-3 lg:mt-10">
              <button type="button" class="min-h-[58px] rounded-[20px] border-2 border-[#8C64D8] bg-[#8C64D8] px-5 py-4 font-days-one text-xs uppercase leading-tight text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C64D8] sm:text-sm">
                {{ mapLabel }}
              </button>
              <NuxtLink :to="registration.href" class="inline-flex min-h-[58px] items-center justify-center rounded-[20px] border-2 border-[#8C64D8] px-5 py-4 font-days-one text-xs uppercase leading-tight transition-colors hover:bg-[#8C64D8]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C64D8] sm:text-sm">
                {{ registration.label }}
              </NuxtLink>
            </div>
          </div>

          <img :src="image.src" :alt="image.alt" width="780" height="552" class="h-auto w-full rounded-[28px] object-cover sm:rounded-[40px]" loading="lazy" decoding="async">
        </div>
      </div>
    </div>
    <svg class="-mt-px hidden h-[150px] w-full lg:block" viewBox="0 0 1920 150" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 0H1000C974 0 962 8 944 22L796 132C780 144 769 150 740 150H60C27 150 0 123 0 90V0Z" fill="white" />
    </svg>
  </section>
</template>

<style scoped>
.loft-title {
  background: linear-gradient(to bottom, #8C64D8 0%, #FFFFFF 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-size: clamp(42px, 12.1vw, 232px);
}
</style>
