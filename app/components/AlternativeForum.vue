<script setup lang="ts">
import alternativeForumImage from '~/assets/images/alternative-forum.png'

const { button, description, imageAlt, title } = await useAlternativeForum()
const descriptionParagraphs = computed(() => description.value.split('\n\n'))
</script>

<template>
  <section class="mx-auto w-full max-w-[1614px] overflow-hidden px-4 pb-24 pt-[88px] text-white sm:px-8 sm:pb-32 lg:pt-[120px] xl:pb-[240px]">
    <div class="mx-auto w-full max-w-[1550px]">
      <h2 class="max-w-full break-words font-days-one text-[clamp(30px,8.5vw,70px)] uppercase leading-none text-white sm:text-[52px] lg:text-[70px]">
        {{ title }}
      </h2>

      <div class="mt-12 grid items-center gap-10 lg:mt-[60px] xl:grid-cols-[minmax(0,1fr)_510px] xl:gap-10 2xl:grid-cols-[770px_510px] 2xl:gap-[140px]">
        <img
          class="h-auto w-full max-w-[770px] rounded-[28px] object-cover sm:rounded-[40px] xl:h-auto 2xl:h-[628px]"
          :src="alternativeForumImage"
          :alt="imageAlt"
          width="770"
          height="628"
          loading="lazy"
          decoding="async"
        >

        <div class="w-full max-w-[510px] xl:mt-[132px] xl:self-start">
          <div class="space-y-[31px] font-montserrat text-xl font-semibold leading-[1.3] text-white sm:text-2xl">
            <p v-for="paragraph in descriptionParagraphs" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>

          <a
            class="mt-10 flex h-[63px] w-full items-center justify-center rounded-[20px] border-2 border-white bg-white px-5 font-days-one text-sm uppercase leading-[1.3] text-[#892AF0] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            :href="button.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ button.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
