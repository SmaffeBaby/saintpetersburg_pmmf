<script setup lang="ts">
import { contentSections } from '#shared/config/content'
import type { PageBlock } from '#shared/config/layout'
const props = defineProps<{ modelValue: { order: PageBlock[] } }>()
const emit = defineEmits<{ 'update:modelValue': [value: { order: PageBlock[] }] }>()
const dragging = ref<PageBlock | null>(null)
const target = ref<PageBlock | null>(null)
const label = (id: PageBlock) => contentSections.find(section => section.id === id)?.label || id
const move = (from: number, to: number) => {
  if (from < 0 || to < 0 || to >= props.modelValue.order.length || from === to) return
  const order = [...props.modelValue.order]
  order.splice(to, 0, order.splice(from, 1)[0]!)
  emit('update:modelValue', { order })
}
const start = (event: DragEvent, block: PageBlock) => {
  dragging.value = block
  if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', block) }
}
const drop = (block: PageBlock) => {
  if (dragging.value) move(props.modelValue.order.indexOf(dragging.value), props.modelValue.order.indexOf(block))
  dragging.value = null
  target.value = null
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-slate-500">Перетащите блок на нужное место или используйте кнопки. Нажмите «Сохранить», чтобы изменить порядок на сайте для обоих языков. Шапка и подвал остаются по краям страницы. Скрытые блоки сохраняют своё место.</p>
    <ol class="space-y-3" aria-label="Порядок блоков сайта">
      <li v-for="(block, index) in modelValue.order" :key="block" draggable="true"
        class="flex flex-wrap items-center gap-3 rounded-xl border bg-slate-50 p-4 transition-colors"
        :class="target === block ? 'border-violet-500 bg-violet-50' : 'border-slate-200'"
        @dragstart="start($event, block)" @dragover.prevent="target = block" @drop.prevent="drop(block)" @dragend="dragging = null; target = null">
        <UIcon name="i-lucide-grip-vertical" class="size-5 cursor-grab text-slate-400" />
        <span class="flex-1 font-medium">{{ index + 1 }}. {{ label(block) }}</span>
        <UButton label="Выше" icon="i-lucide-arrow-up" :aria-label="`Выше: ${label(block)}`" color="neutral" variant="outline" :disabled="index === 0" @click="move(index, index - 1)" />
        <UButton label="Ниже" icon="i-lucide-arrow-down" :aria-label="`Ниже: ${label(block)}`" color="neutral" variant="outline" :disabled="index === modelValue.order.length - 1" @click="move(index, index + 1)" />
      </li>
    </ol>
  </div>
</template>
