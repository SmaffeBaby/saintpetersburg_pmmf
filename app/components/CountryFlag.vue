<script setup lang="ts">
import { countryFlagSrc } from '#shared/utils/countries'
defineProps<{ code?: string }>()
</script>

<template>
  <img v-if="code && countryFlagSrc(code)" :src="countryFlagSrc(code)" alt="" aria-hidden="true" width="24" height="18" class="block h-[18px] w-6 shrink-0 rounded-[2px] object-contain">
  <UIcon v-else name="i-lucide-globe" aria-hidden="true" class="size-6 shrink-0" />
</template>
