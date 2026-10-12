<script setup lang="ts">
const { legal, privacyLink } = await useFooter()
</script>

<template>
  <footer class="mx-auto w-full max-w-[1614px] px-4 pb-16 text-white sm:px-8 sm:pb-20 lg:pb-[78px]">
    <div class="mx-auto w-full max-w-[1550px] border-t border-white/10 pt-9 sm:pt-12">
      <p class="max-w-[1230px] whitespace-pre-line font-montserrat text-sm font-semibold leading-[1.35] text-white sm:text-base lg:text-lg">
        {{ legal }}
      </p>

      <NuxtLink
        class="mt-8 inline-block font-montserrat text-sm font-semibold leading-[1.35] text-white underline underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-9 sm:text-base lg:text-lg"
        :to="privacyLink.href"
      >
        {{ privacyLink.label }}
      </NuxtLink>
    </div>
  </footer>
</template>
