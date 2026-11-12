<script setup lang="ts">
defineProps<{ src: string; alt: string }>()
</script>

<template>
  <AppImageViewer :src="src" :alt="alt" />
</template>
