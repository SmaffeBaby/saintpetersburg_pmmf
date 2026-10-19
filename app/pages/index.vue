<template>
  <main class="min-h-screen bg-[#8C64D8] text-black">
    <section
      class="relative overflow-hidden"
    >
      <AppHeader />
      <AppHero />
    </section>
    <AppAbout v-reveal class="mt-24 lg:mt-[120px]" />
    <AppLoftHall v-reveal class="relative z-10" />
    <AppSchedule v-reveal />
    <AppProgram v-reveal />
    <div class="rounded-[40px] bg-white lg:rounded-[80px]">
      <AppInformationPartners v-reveal />
      <AppRegistrationForm v-reveal />
    </div>
    <AlternativeForum v-reveal />
    <AppFooter v-reveal />
  </main>
</template>
