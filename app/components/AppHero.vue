<script setup lang="ts">
const { registrationLink } = await useHeader()
const { date, title, logo: heroLogo, organizerLogos } = await useHero()
const words = computed(() => title.value.trim().split(/\s+/))
</script>

<template>
  <section v-hover-parallax="24" class="hero-scene relative isolate w-full overflow-hidden text-white">
    <div class="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
      <div class="hero-landmarks hero-enter-left absolute">
        <img src="/images/hero-bridge.svg" alt="" width="1198" height="391" class="h-auto w-full" decoding="async">
      </div>
      <div class="hero-arch hero-enter-right absolute">
        <img data-hover-parallax="32" data-parallax-pin-bottom src="/images/hero-arch.svg" alt="" width="622" height="672" class="h-auto w-full" decoding="async">
      </div>
      <div class="hero-white-arch hero-enter-right absolute">
        <img data-hover-parallax="-22" data-parallax-pin-bottom src="/images/hero-white-arch.png" alt="" width="280" height="284" class="h-auto w-full" decoding="async">
      </div>
      <div class="hero-sphinx hero-enter-right absolute">
        <img src="/images/hero-sphinx.svg" alt="" width="347" height="248" class="h-auto w-full" decoding="async">
      </div>
    </div>

    <div class="hero-copy relative z-20 mx-auto w-full max-w-[1614px] px-4 sm:px-8">
      <p class="hero-date font-days-one uppercase leading-tight">{{ date }}</p>
      <h1 class="hero-title mt-8 font-days-one uppercase lg:mt-[42px]">
        <template v-for="(word, index) in words" :key="index"><span :class="index < 2 ? 'text-[#DAEF14]' : 'text-white'">{{ word }}</span>{{ ' ' }}</template>
      </h1>
      <AppRegistrationButton class="mt-8 lg:mt-[42px]" variant="hero" :href="registrationLink.href" :label="registrationLink.label" />
    </div>

    <div class="hero-logo hero-enter-right pointer-events-none absolute z-10 select-none" aria-hidden="true">
      <img data-hover-parallax :src="heroLogo" alt="" width="475" height="530" class="h-auto w-full" fetchpriority="high" decoding="async">
    </div>

    <div class="hero-gradient pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[257px]" aria-hidden="true" />

    <div class="hero-organizers hero-enter-ribbon relative z-30 ml-auto mt-16">
      <ul class="m-0 grid list-none grid-cols-2 items-center gap-x-6 gap-y-5 p-0 sm:flex sm:justify-between sm:gap-6">
        <li v-for="organizer in organizerLogos" :key="organizer.src" class="min-w-0">
          <img :src="organizer.src" :alt="organizer.alt" :width="organizer.width" :height="organizer.height" class="hero-organizer-image mx-auto h-auto max-h-[60px] max-w-full object-contain" decoding="async">
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero-scene {
  padding-top: 160px;
  padding-bottom: 24px;
}

.hero-date {
  font-size: clamp(20px, 2vw, 30px);
}

.hero-title {
  max-width: 900px;
  font-size: clamp(22px, 5vw, 56px);
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.hero-logo {
  position: relative;
  top: auto;
  right: auto;
  width: min(65vw, 340px);
  margin: 56px auto 0;
}

.hero-landmarks {
  display: none;
  bottom: 0;
  left: -160px;
  width: 780px;
}

.hero-arch {
  top: 55%;
  left: calc(50% + min(32.5vw, 170px) + 16px);
  width: 340px;
}

.hero-white-arch {
  left: 16px;
  bottom: 140px;
  width: 140px;
}

.hero-sphinx {
  display: none;
  right: 90px;
  bottom: 100px;
  width: 210px;
}

.hero-gradient {
  background: linear-gradient(to bottom, rgb(140 100 216 / 0), #8C64D8);
}

.hero-organizers {
  width: calc(100% - 16px);
  border-radius: 20px 0 0 20px;
  padding: 24px;
  background: white;
}

.hero-organizers li:first-child { flex: 0 1 272px; }
.hero-organizers li:nth-child(2) { flex: 0 1 54px; }
.hero-organizers li:nth-child(3) { flex: 0 1 206px; }
.hero-organizers li:nth-child(4) { flex: 0 1 200px; }

@media (min-width: 640px) {
  .hero-copy { padding-top: 20px; }
  .hero-organizers {
    width: calc(100% - 32px);
    padding: 24px 32px 24px 64px;
    background: transparent;
    border-radius: 0;
  }
  .hero-organizers::before {
    content: '';
    position: absolute;
    inset: 0 -100px 0 0;
    z-index: -1;
    border-radius: 30px 0 0 20px;
    background: white;
    transform: skewX(-26deg);
    transform-origin: bottom left;
  }
}

@media (min-width: 1024px) {
  .hero-scene {
    min-height: clamp(820px, 51.05vw, 980px);
    padding-top: 210px;
    padding-bottom: 150px;
  }
  .hero-copy { padding-top: 0; }
  .hero-title {
    width: 60%;
    font-size: clamp(38px, 3.65vw, 70px);
  }
  .hero-logo {
    position: absolute;
    top: 200px;
    right: max(32px, calc((100% - 1550px) / 2 + 95px));
    width: min(24.74vw, 475px);
    margin: 0;
  }
  .hero-landmarks {
    display: block;
    left: 0;
    width: min(62.4vw, 1198px);
  }
  .hero-arch {
    top: 310px;
    left: auto;
    right: max(-180px, -9.4vw);
    width: min(32.4vw, 622px);
  }
  .hero-white-arch {
    left: auto;
    right: max(48px, calc((100% - 1920px) / 2 + 85px));
    bottom: 0;
    width: min(14.6vw, 280px);
  }
  .hero-sphinx {
    display: block;
    right: max(260px, calc((100% - 1920px) / 2 + 425px));
    bottom: 40px;
    width: min(18.1vw, 347px);
  }
  .hero-organizers {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 64%;
    min-height: 100px;
    margin: 0;
    padding: 20px max(48px, calc((100vw - 1550px) / 2)) 20px 90px;
  }
  .hero-organizers::before {
    transform: skewX(-35deg);
  }
  .hero-organizer-image { max-height: 70px; }
}

@keyframes hero-slide-left {
  from { opacity: 0; transform: translateX(-180px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes hero-slide-right {
  from { opacity: 0; transform: translateX(180px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes hero-slide-ribbon {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: no-preference) {
  .hero-enter-left { animation: hero-slide-left 1.5s cubic-bezier(.16, 1, .3, 1) .15s both; }
  .hero-enter-right { animation: hero-slide-right 1.5s cubic-bezier(.16, 1, .3, 1) .25s both; }
  .hero-logo { animation-delay: .4s; }
  .hero-sphinx { animation-delay: .35s; }
  .hero-white-arch { animation-delay: .45s; }
  .hero-enter-ribbon { animation: hero-slide-ribbon 1.4s cubic-bezier(.16, 1, .3, 1) .55s both; }
}
</style>
