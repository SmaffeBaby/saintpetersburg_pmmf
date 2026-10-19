<template>
  <main class="min-h-screen bg-[#8C64D8] text-black">
    <section
      class="relative min-h-screen overflow-hidden lg:min-h-[1080px]"
    >
      <AppHeader v-reveal />
      <AppHero v-reveal />
    </section>
    <AppAbout v-reveal class="mt-[180px]" />
    <div class="rounded-[40px] bg-white lg:rounded-[80px]">
      <AppInformationPartners v-reveal />
      <AppRegistrationForm v-reveal />
    </div>
    <AlternativeForum v-reveal />
    <AppFooter v-reveal />
  </main>
</template>
