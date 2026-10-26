<script setup lang="ts">
import { parseLegalContent } from '#shared/utils/legalContent'
const props = defineProps<{ text: string }>()
const blocks = computed(() => parseLegalContent(props.text))
</script>

<template>
  <div class="legal-content space-y-5 break-words font-montserrat text-base leading-relaxed text-slate-800 [overflow-wrap:anywhere] sm:text-lg">
    <template v-for="(block, index) in blocks" :key="index">
      <component :is="block.level === 2 ? 'h2' : 'h3'" v-if="block.type === 'heading'" :id="block.id" class="scroll-mt-8 pt-7 font-semibold leading-snug text-[#7650BD]" :class="block.level === 2 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'">
        {{ block.text }}
      </component>
      <ul v-else-if="block.type === 'list'" class="list-disc space-y-3 pl-6 marker:text-[#8C64D8]">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
      </ul>
      <p v-else class="whitespace-pre-line">{{ block.text }}</p>
    </template>
  </div>
</template>
