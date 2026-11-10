<script setup lang="ts">
const { packages } = await usePackages()
const languageStore = useLanguageStore()
</script>

<template>
  <section v-if="packages.length" id="packages" :aria-label="languageStore.locale === 'en' ? 'Packages' : 'Пакеты'" class="w-full scroll-mt-[130px] border-t border-white/10 text-white">
    <ul class="mx-auto grid w-full max-w-[1614px] list-none gap-6 px-4 py-12 sm:px-8 md:grid-cols-2 lg:gap-[10px] lg:py-[100px]">
      <li v-for="(item, index) in packages" :key="index" class="package-card min-w-0 rounded-[32px] p-6 sm:p-10 lg:rounded-[40px] lg:px-[50px] lg:py-[55px]">
        <article>
          <h2 class="whitespace-pre-line break-words font-days-one text-2xl uppercase leading-[1.3] sm:text-[32px] lg:text-[40px]">{{ item.title }}</h2>
          <p class="mt-5 whitespace-pre-line break-words font-montserrat text-sm leading-[1.3] text-white/70 lg:text-base">{{ item.description }}</p>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.package-card {
  background: linear-gradient(180deg, rgb(255 255 255 / 20%) 0%, rgb(140 100 216 / 20%) 100%);
}
</style>
