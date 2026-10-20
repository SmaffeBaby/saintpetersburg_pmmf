<script setup lang="ts">
const { email, address, contacts, privacyLink } = await useFooter()
const addressLines = computed(() => address.value
  .replace(/,\s*/, ',\n')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean))
</script>

<template>
  <footer v-hover-parallax="28" id="contacts" class="relative isolate w-full overflow-hidden border-t border-white/10 text-white">
    <div class="pointer-events-none absolute inset-0 -z-10 select-none" aria-hidden="true">
      <img data-hover-parallax="24" data-parallax-pin-bottom src="/images/footer-left.svg" alt="" width="356" height="370" class="footer-arch-left absolute hidden h-auto sm:block" loading="lazy" decoding="async">
      <img data-hover-parallax="36" data-parallax-pin-bottom src="/images/footer-right.svg" alt="" width="702" height="764" class="footer-arch-right absolute h-auto" loading="lazy" decoding="async">
      <img data-hover-parallax="-22" data-parallax-pin-bottom src="/images/footer-white.svg" alt="" width="311" height="321" class="footer-arch-white absolute hidden h-auto lg:block" loading="lazy" decoding="async">
    </div>

    <div class="mx-auto w-full max-w-[1614px] px-4 pb-16 pt-20 sm:px-8 sm:pb-24 lg:pb-[100px] lg:pt-[240px]">
      <a :href="`mailto:${email}`" class="inline-block max-w-full break-words font-days-one text-[clamp(22px,5vw,70px)] uppercase leading-[1.15] text-[#DAEF14] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        {{ email }}
      </a>
      <p class="mt-6 break-words font-days-one text-[clamp(11px,3.8vw,16px)] uppercase leading-[1.35] text-white/50 sm:text-xl lg:mt-8 lg:text-[30px]">
        <span v-for="(line, index) in addressLines" :key="index" class="block">{{ line }}</span>
      </p>
      <div class="mt-10 rounded-[28px] bg-[#9875DC] px-6 py-8 sm:rounded-[40px] sm:p-10 lg:mt-[50px] lg:rounded-[60px] lg:px-[64px] lg:py-[60px]">
        <p class="whitespace-pre-line break-words font-montserrat text-base leading-[1.25] text-white sm:text-xl lg:text-2xl">
          {{ contacts }}
        </p>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="mx-auto w-full max-w-[1614px] px-4 pb-20 pt-8 sm:px-8 sm:pb-28 lg:pb-[140px] lg:pt-10">
        <NuxtLink :to="privacyLink.href" class="inline-block max-w-full font-montserrat text-sm font-semibold leading-[1.35] underline underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-base lg:text-lg">
          {{ privacyLink.label }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-arch-left {
  bottom: 0;
  left: -214px;
  width: 356px;
}

.footer-arch-right {
  top: 60px;
  right: -180px;
  width: 300px;
}

.footer-arch-white {
  right: 36px;
  bottom: 0;
  width: 311px;
}

@media (min-width: 1024px) {
  .footer-arch-left {
    left: -11.15%;
    width: 18.55%;
  }

  .footer-arch-right {
    top: auto;
    bottom: 0;
    right: -13.55%;
    width: 36.57%;
  }

  .footer-arch-white {
    right: 1.875%;
    width: 16.2%;
  }
}
</style>
