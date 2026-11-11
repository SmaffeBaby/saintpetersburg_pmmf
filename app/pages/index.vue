<script setup lang="ts">
import type { SectionVisibility } from '../../shared/config/content'
import { pageBlocks, type PageBlock } from '#shared/config/layout'
import { AppHero, AppAbout, AppLoftHall, AppHallPlan, AppSchedule, AppProgram, AppSpeakers, AppPackages, AppInformationPartners, AppRegistrationForm, AlternativeForum } from '#components'

await useAsyncData('site-visibility', () => $fetch<SectionVisibility>('/api/content/visibility'))
const { data: layout } = await useAsyncData('site-layout-content', () => $fetch<{ order: PageBlock[] }>('/api/content/site-layout'))
const { isVisible } = useSiteVisibility()
const components = { hero: AppHero, about: AppAbout, 'loft-hall': AppLoftHall, 'hall-plan': AppHallPlan, schedule: AppSchedule, program: AppProgram, speakers: AppSpeakers, packages: AppPackages, 'information-partners': AppInformationPartners, 'registration-form': AppRegistrationForm, 'alternative-forum': AlternativeForum }
// Keep the shared white background when partners and registration are adjacent.
const groups = computed(() => {
  const groups: { white: boolean; blocks: PageBlock[] }[] = []
  for (const block of layout.value?.order || pageBlocks) {
    if (!isVisible(block)) continue
    const white = block === 'information-partners' || block === 'registration-form'
    const previous = groups[groups.length - 1]
    if (white && previous?.white) previous.blocks.push(block)
    else groups.push({ white, blocks: [block] })
  }
  return groups
})
</script>

<template>
  <main class="min-h-screen bg-[#8C64D8] text-black">
    <AppHeader v-if="isVisible('header')" />
    <div v-for="group in groups" :key="group.blocks.join(',')" :class="group.white ? 'rounded-[40px] bg-white lg:rounded-[80px]' : ''">
      <div v-for="block in group.blocks" :key="block" v-reveal :data-site-block="block" :class="{ 'mt-24 lg:mt-[120px]': block === 'about', 'relative z-10': block === 'loft-hall' }">
        <component :is="components[block]" />
      </div>
    </div>
    <AppFooter v-if="isVisible('footer')" v-reveal />
  </main>
</template>
