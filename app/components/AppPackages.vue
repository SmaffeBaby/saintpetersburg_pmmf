<script setup lang="ts">
const { title, packages } = await usePackages()
</script>

<template>
  <section v-if="packages.length" id="packages" aria-labelledby="packages-title" class="w-full scroll-mt-[130px] border-t border-white/10 text-white">
    <div class="mx-auto w-full max-w-[1614px] px-4 py-12 sm:px-8 lg:py-[100px]">
      <h2 id="packages-title" class="break-words font-days-one text-[34px] uppercase leading-[1.15] sm:text-[52px] lg:text-[70px]">{{ title }}</h2>
      <ul class="mt-12 grid list-none gap-6 p-0 md:grid-cols-2 lg:mt-[70px] lg:gap-[10px]">
        <li v-for="(item, index) in packages" :key="index" class="package-card min-w-0 rounded-[32px] p-6 sm:p-10 lg:rounded-[40px] lg:px-[50px] lg:py-[55px]">
          <article>
            <h3 class="whitespace-pre-line break-words font-days-one text-2xl uppercase leading-[1.3] sm:text-[32px] lg:text-[40px]">{{ item.title }}</h3>
            <p class="mt-5 whitespace-pre-line break-words font-montserrat text-sm leading-[1.3] text-white/70 lg:text-base">{{ item.description }}</p>
          </article>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.package-card {
  background: linear-gradient(180deg, rgb(255 255 255 / 20%) 0%, rgb(140 100 216 / 20%) 100%);
}
</style>
