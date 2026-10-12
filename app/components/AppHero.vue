<script setup lang="ts">
import heroLogo from '~/assets/images/hero-mmf-logo.png'

const { registrationLink } = await useHeader()
const { date, place, title } = await useHero()
</script>

<template>
  <section class="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1614px] flex-col px-4 pb-8 pt-[128px] sm:px-8 sm:pb-16 sm:pt-[180px] lg:pb-[54px] lg:pt-[244px]">
    <div class="grid flex-1 gap-6 sm:gap-10 lg:flex-none lg:grid-cols-[520px_360px] lg:gap-[173px] xl:grid-cols-[720px_430px] 2xl:grid-cols-[820px_540px]">
      <div class="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
        <h1 class="max-w-[760px] font-days-one text-[26px] uppercase leading-[1.24] text-white sm:text-[48px] lg:text-[58px] xl:text-[70px]">
          {{ title }}
        </h1>

        <AppRegistrationButton
          class="mt-7 sm:mt-10 lg:mt-[42px]"
          variant="hero"
          :href="registrationLink.href"
          :label="registrationLink.label"
        />
      </div>

      <div class="order-1 flex justify-center lg:order-2 lg:justify-end">
        <img
          class="h-auto w-[min(74vw,290px)] select-none object-contain sm:w-[min(64vw,475px)] lg:w-[360px] xl:w-[430px] 2xl:w-[540px]"
          :src="heroLogo"
          alt=""
          width="475"
          height="530"
          loading="eager"
          decoding="async"
        >
      </div>
    </div>

    <p class="mt-7 text-center font-days-one text-[18px] uppercase leading-tight text-white sm:text-[26px] lg:mt-[132px] lg:text-left lg:text-[28px] xl:text-[34px]">
      <span>{{ date }}</span>
      <span class="mx-4 sm:mx-7">///</span>
      <span>{{ place }}</span>
    </p>
  </section>
</template>
