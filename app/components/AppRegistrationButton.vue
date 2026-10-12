<script setup lang="ts">
withDefaults(defineProps<{
  href: string
  label: string
  variant?: 'header' | 'hero'
}>(), {
  variant: 'header'
})
</script>

<template>
  <NuxtLink
    class="inline-flex shrink-0 items-center justify-center rounded-[15px] font-days-one uppercase leading-none transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
    :class="variant === 'hero'
      ? 'min-h-[50px] min-w-[158px] bg-white px-5 text-[13px] text-[#892AF0] shadow-[0_18px_42px_rgba(16,13,96,0.18)] sm:min-h-[58px] sm:min-w-[170px] sm:text-sm lg:min-h-[58px] lg:min-w-[160px]'
      : 'min-h-[46px] bg-cta-gradient px-4 text-xs text-white lg:min-h-[50px] lg:text-sm'"
    :to="href"
  >
    {{ label }}
  </NuxtLink>
</template>
