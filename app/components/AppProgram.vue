<script setup lang="ts">
const { title, description } = await useProgram()
</script>

<template>
  <section v-hover-parallax="28" id="program" aria-labelledby="program-title" class="mx-auto w-full max-w-[1614px] px-4 pb-24 pt-8 sm:px-8 lg:pb-[160px] lg:pt-[60px]">
    <div class="program-card relative isolate flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-white px-6 py-20 text-center text-[#8C64D8] sm:rounded-[40px] sm:px-16 lg:min-h-[500px] lg:rounded-[60px] lg:px-[200px] lg:py-[120px]">
      <div class="pointer-events-none absolute inset-0 -z-10 select-none" aria-hidden="true">
        <img src="/images/program-skyline.svg" alt="" width="1550" height="381" class="program-skyline absolute h-auto" loading="lazy" decoding="async">
        <img data-hover-parallax="28" data-parallax-pin-bottom src="/images/program-left-arch.svg" alt="" width="391" height="428" class="program-left-arch absolute h-auto" loading="lazy" decoding="async">
        <img data-hover-parallax="-20" data-parallax-pin-bottom src="/images/program-right-arch.svg" alt="" width="286" height="222" class="program-right-arch absolute h-auto" loading="lazy" decoding="async">
      </div>
      <h2 id="program-title" class="max-w-full break-words font-days-one text-[clamp(28px,5vw,70px)] uppercase leading-[1.15]">{{ title }}</h2>
      <p class="mt-7 max-w-[640px] whitespace-pre-line break-words font-montserrat text-lg leading-[1.3] sm:text-xl lg:mt-9 lg:text-2xl">{{ description }}</p>
    </div>
  </section>
</template>

<style scoped>
.program-skyline {
  left: 50%;
  bottom: 24px;
  width: 900px;
  max-width: none;
  transform: translateX(-50%);
}

.program-left-arch {
  left: -90px;
  bottom: -30px;
  width: 180px;
}

.program-right-arch {
  right: -40px;
  bottom: 0;
  width: 120px;
}

@media (min-width: 640px) {
  .program-left-arch { left: -80px; width: 260px; }
  .program-right-arch { right: -30px; width: 180px; }
}

@media (min-width: 1024px) {
  .program-skyline {
    bottom: 60px;
    width: 100%;
  }
  .program-left-arch {
    left: 0;
    bottom: 0;
    width: min(25.23%, 391px);
  }
  .program-right-arch {
    right: 0;
    width: min(18.46%, 286px);
  }
}
</style>
