<script setup lang="ts">
import birdImage from '~/assets/images/about-bird.png'
import starImage from '~/assets/images/about-star.png'
import worldImage from '~/assets/images/about-world.png'

const { firstParagraph, secondParagraph, title } = await useAbout()
const titleLines = computed(() => title.value.split('\n'))
</script>

<template>
  <section class="relative mx-auto min-h-[860px] w-full max-w-[1614px] overflow-visible px-4 pb-24 pt-0 text-white sm:px-8 lg:min-h-[980px] lg:pb-[140px]">
    <img
      class="pointer-events-none absolute left-[-72px] top-[-34px] h-auto w-[170px] select-none lg:left-[-126px] lg:top-[24px] lg:w-[330px] xl:left-[-104px] xl:top-[28px] xl:w-[360px]"
      :src="starImage"
      alt=""
      width="413"
      height="719"
      loading="lazy"
      decoding="async"
    >

    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        class="absolute bottom-[70px] left-[88px] hidden h-auto w-[820px] select-none opacity-20 lg:block xl:bottom-[82px] xl:left-[110px] xl:w-[900px]"
        :src="worldImage"
        alt=""
        width="1007"
        height="664"
        loading="lazy"
        decoding="async"
      >

      <img
        class="absolute bottom-[-116px] right-0 hidden h-auto w-[420px] select-none lg:block xl:bottom-[-136px] xl:right-0 xl:w-[500px]"
        :src="birdImage"
        alt=""
        width="572"
        height="926"
        loading="lazy"
        decoding="async"
      >
    </div>

    <div class="relative z-[1] mx-auto grid w-full max-w-[1550px] gap-10 lg:grid-cols-[470px_410px_410px] lg:gap-[10px] xl:grid-cols-[500px_440px_440px]">
      <div class="flex items-start lg:min-h-[430px]">
        <h2 class="inline-block whitespace-nowrap font-days-one text-[42px] uppercase leading-none text-white sm:text-[56px] lg:absolute lg:left-0 lg:top-[444px] lg:origin-top-left lg:-rotate-90 lg:text-[70px]">
          <span v-for="line in titleLines" :key="line" class="block">
            {{ line }}
          </span>
        </h2>
      </div>

      <p class="max-w-[520px] font-montserrat text-xl font-medium leading-[1.3] text-white sm:text-2xl lg:max-w-none">
        {{ firstParagraph }}
      </p>

      <p class="max-w-[520px] font-montserrat text-xl font-medium leading-[1.3] text-white sm:text-2xl lg:max-w-none">
        {{ secondParagraph }}
      </p>
    </div>

  </section>
</template>
