<script setup lang="ts">
const { firstParagraph, secondParagraph, title } = await useAbout()
</script>

<template>
  <section v-hover-parallax="28" id="about" aria-labelledby="about-title" class="about-section relative isolate w-full overflow-hidden text-white">
    <div class="pointer-events-none absolute inset-0 -z-10 select-none" aria-hidden="true">
      <img src="/images/about-skyline.svg" alt="" width="1091" height="595" class="about-skyline absolute h-auto" loading="lazy" decoding="async">
      <img data-hover-parallax="32" data-parallax-pin-bottom src="/images/about-yellow-arch.svg" alt="" width="413" height="672" class="about-yellow-arch absolute h-auto" loading="lazy" decoding="async">
      <img data-hover-parallax="-22" data-parallax-pin-bottom src="/images/about-white-arch.svg" alt="" width="280" height="284" class="about-white-arch absolute hidden h-auto sm:block" loading="lazy" decoding="async">
      <img src="/images/about-horseman.svg" alt="" width="411" height="386" class="about-horseman absolute h-auto" loading="lazy" decoding="async">
    </div>

    <div class="mx-auto grid w-full max-w-[1614px] gap-8 px-4 sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
      <div class="sm:col-span-2 lg:col-span-1">
        <h2 id="about-title" class="about-title inline-block whitespace-pre-line font-days-one text-[38px] uppercase leading-none sm:text-[56px] lg:text-[70px]">{{ title }}</h2>
      </div>
      <p class="whitespace-pre-line break-words font-montserrat text-lg leading-[1.3] sm:text-xl lg:text-2xl">{{ firstParagraph }}</p>
      <p class="whitespace-pre-line break-words font-montserrat text-lg leading-[1.3] sm:text-xl lg:text-2xl">{{ secondParagraph }}</p>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  padding-bottom: clamp(240px, 62vw, 340px);
}

.about-skyline {
  bottom: 0;
  left: calc(50% + 48px);
  width: min(calc(100% - 32px), 560px);
  max-width: none;
  transform: translateX(-50%);
}

.about-yellow-arch {
  bottom: 0;
  left: 0;
  width: clamp(115px, 28vw, 180px);
}

.about-white-arch {
  bottom: 0;
  right: 35%;
  width: clamp(80px, 18vw, 140px);
}

.about-horseman {
  display: none;
  right: 16px;
  bottom: 0;
  width: clamp(120px, 34vw, 210px);
}

@media (min-width: 1024px) {
  .about-section {
    min-height: 840px;
    padding-bottom: 400px;
  }

  .about-title {
    max-height: 520px;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }

  .about-skyline {
    bottom: -20px;
    left: 0;
    width: min(65vw, 1250px);
    transform: none;
  }

  .about-yellow-arch {
    bottom: max(-15.625vw, -300px);
    left: 0;
    width: min(21.52vw, 413px);
  }

  .about-white-arch {
    right: 24.5%;
    bottom: max(-7.3vw, -140px);
    width: min(14.6vw, 280px);
  }

  .about-horseman {
    display: block;
    right: 32px;
    bottom: -20px;
    width: min(21.41vw, 411px);
  }
}
</style>
