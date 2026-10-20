<script setup lang="ts">
const { title, description, button } = await useSchedule()

// Fan out from the same point; the section clips the ends at every viewport size.
const rays = Array.from({ length: 17 }, (_, index) => {
  const angle = Math.PI + index * Math.PI / 16
  return { x: 960 + Math.cos(angle) * 2600, y: 1050 + Math.sin(angle) * 2600 }
})
</script>

<template>
  <section id="schedule" aria-labelledby="schedule-title" class="schedule-section relative isolate w-full overflow-hidden text-center text-white">
    <div class="pointer-events-none absolute inset-0 -z-10 select-none" aria-hidden="true">
      <svg class="absolute inset-0 h-full w-full text-white/15" viewBox="0 0 1920 1200" fill="none" preserveAspectRatio="none">
        <line v-for="(ray, index) in rays" :key="index" x1="960" y1="1050" :x2="ray.x" :y2="ray.y" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" />
      </svg>
      <img v-scroll-parallax="-140" src="/images/schedule-horseman.svg" alt="" width="538" height="639" class="schedule-horseman absolute h-auto" loading="lazy" decoding="async">
      <img v-scroll-parallax="160" src="/images/schedule-cathedral.svg" alt="" width="534" height="670" class="schedule-cathedral absolute h-auto" loading="lazy" decoding="async">
    </div>

    <div class="relative mx-auto w-full max-w-[760px] px-4 sm:px-8">
      <h2 id="schedule-title" class="break-words font-days-one text-[34px] uppercase leading-[1.15] sm:text-[52px] lg:text-[clamp(38px,3.65vw,70px)]">{{ title }}</h2>
      <p class="mt-7 whitespace-pre-line font-montserrat text-lg leading-[1.3] sm:text-xl lg:mt-8 lg:text-2xl">{{ description }}</p>
      <a v-if="button.href" :href="button.href" target="_blank" rel="noopener noreferrer" class="schedule-button transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        {{ button.label }}
      </a>
      <button v-else type="button" disabled class="schedule-button cursor-not-allowed">{{ button.label }}</button>
    </div>
  </section>
</template>

<style scoped>
.schedule-section {
  min-height: 680px;
  margin-bottom: 64px;
  padding-top: 150px;
  padding-bottom: 280px;
  scroll-margin-top: 130px;
}

.schedule-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 62px;
  max-width: 100%;
  margin-top: 32px;
  border-radius: 20px;
  padding: 16px 22px;
  background: white;
  color: #892AF0;
  font-family: 'Days One', sans-serif;
  font-size: 14px;
  line-height: 1.3;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.schedule-horseman {
  bottom: 30px;
  left: -90px;
  width: 220px;
}

.schedule-cathedral {
  right: -80px;
  bottom: 20px;
  width: 210px;
}

@media (min-width: 640px) {
  .schedule-horseman { left: -80px; width: 300px; }
  .schedule-cathedral { right: -60px; width: 280px; }
}

@media (min-width: 1024px) {
  .schedule-section {
    min-height: 1200px;
    margin-bottom: 0;
    margin-top: -150px;
    padding-top: 460px;
    padding-bottom: 400px;
  }
  .schedule-horseman {
    top: 220px;
    bottom: auto;
    left: 0;
    width: min(28.03vw, 538px);
  }
  .schedule-cathedral {
    right: 0;
    bottom: 80px;
    width: min(27.82vw, 534px);
  }
}
</style>
