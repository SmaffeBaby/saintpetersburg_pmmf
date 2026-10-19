import type { DirectiveBinding } from 'vue'

type Layer = {
  el: HTMLElement
  x: number
  y: number
  targetX: number
  targetY: number
  originalTranslate: string
}
type ScrollLayer = Layer & { section: HTMLElement; distance: number }

export default defineNuxtPlugin((nuxtApp) => {
  // Register the directives during SSR without changing the initial layout.
  if (import.meta.server) {
    for (const name of ['scroll-parallax', 'hover-parallax']) {
      nuxtApp.vueApp.directive(name, { getSSRProps: () => ({}) })
    }
    return
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const scrollLayers = new Map<HTMLElement, ScrollLayer>()
  const hoverLayers = new Map<HTMLElement, { layers: Layer[]; cleanup: () => void }>()
  let frame = 0
  let dirty = true
  let lastTime = 0

  const createLayer = (el: HTMLElement): Layer => ({
    el, x: 0, y: 0, targetX: 0, targetY: 0, originalTranslate: el.style.translate
  })
  const restore = (layer: Layer) => {
    layer.x = layer.y = layer.targetX = layer.targetY = 0
    layer.el.style.translate = layer.originalTranslate
  }

  const tick = (time: number) => {
    frame = 0
    if (reducedMotion.matches) return
    const easing = 1 - Math.exp(-Math.min(time - lastTime || 16, 64) / 100)
    lastTime = time

    if (dirty) {
      // Read section geometry before writing styles, using the unshifted parent.
      const sections = new Map<HTMLElement, DOMRect>()
      for (const layer of scrollLayers.values()) {
        if (!sections.has(layer.section)) sections.set(layer.section, layer.section.getBoundingClientRect())
        const rect = sections.get(layer.section)!
        const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)))
        const mobileScale = window.innerWidth < 640 ? 0.5 : 1
        // Center the movement around the original composition for a visible scroll response.
        layer.targetY = (progress - 0.5) * 2 * layer.distance * mobileScale
      }
      dirty = false
    }

    let moving = false
    const layers = [...scrollLayers.values(), ...Array.from(hoverLayers.values()).flatMap(item => item.layers)]
    for (const layer of layers) {
      layer.x += (layer.targetX - layer.x) * easing
      layer.y += (layer.targetY - layer.y) * easing
      const settled = Math.abs(layer.targetX - layer.x) < 0.05 && Math.abs(layer.targetY - layer.y) < 0.05
      if (settled) { layer.x = layer.targetX; layer.y = layer.targetY }
      else moving = true
      // Independent translate keeps the existing entrance animations intact.
      layer.el.style.translate = `${layer.x.toFixed(2)}px ${layer.y.toFixed(2)}px`
    }
    if (moving) frame = window.requestAnimationFrame(tick)
    else lastTime = 0
  }
  const wake = () => {
    if (!frame && !reducedMotion.matches) frame = window.requestAnimationFrame(tick)
  }
  const invalidate = () => { dirty = true; wake() }
  const resetMotion = () => {
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
    lastTime = 0
    for (const layer of scrollLayers.values()) restore(layer)
    for (const { layers } of hoverLayers.values()) layers.forEach(restore)
    invalidate()
  }

  nuxtApp.vueApp.directive('scroll-parallax', {
    mounted(el: HTMLElement, binding: DirectiveBinding<number>) {
      scrollLayers.set(el, { ...createLayer(el), section: el.closest<HTMLElement>('section, footer') || el.parentElement!, distance: binding.value ?? 40 })
      invalidate()
    },
    unmounted(el: HTMLElement) {
      const layer = scrollLayers.get(el)
      if (layer) restore(layer)
      scrollLayers.delete(el)
    }
  })

  nuxtApp.vueApp.directive('hover-parallax', {
    mounted(el: HTMLElement, binding: DirectiveBinding<number>) {
      const targets = Array.from(el.querySelectorAll<HTMLElement>('[data-hover-parallax]'))
      if (!targets.length) return
      const layers = targets.map(createLayer)
      const move = (event: PointerEvent) => {
        if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return
        const rect = el.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
        for (const layer of layers) {
          const configured = layer.el.getAttribute('data-hover-parallax')
          const distance = configured?.trim() && Number.isFinite(Number(configured)) ? Number(configured) : binding.value ?? 24
          layer.targetX = x * distance
          // Keep the stems below the clipping edge, even when the cursor moves up.
          layer.targetY = layer.el.hasAttribute('data-parallax-pin-bottom')
            ? (1 + y * Math.sign(distance)) * Math.abs(distance) / 2
            : y * distance
        }
        wake()
      }
      const leave = () => {
        for (const layer of layers) layer.targetX = layer.targetY = 0
        wake()
      }
      el.addEventListener('pointermove', move, { passive: true })
      el.addEventListener('pointerleave', leave)
      el.addEventListener('pointercancel', leave)
      hoverLayers.set(el, { layers, cleanup: () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
        el.removeEventListener('pointercancel', leave)
        layers.forEach(restore)
      } })
    },
    unmounted(el: HTMLElement) {
      hoverLayers.get(el)?.cleanup()
      hoverLayers.delete(el)
    }
  })

  window.addEventListener('scroll', invalidate, { passive: true, capture: true })
  window.addEventListener('resize', invalidate, { passive: true })
  window.addEventListener('load', invalidate)
  reducedMotion.addEventListener('change', resetMotion)
  finePointer.addEventListener('change', resetMotion)
  nuxtApp.vueApp.onUnmount(() => {
    if (frame) window.cancelAnimationFrame(frame)
    for (const { cleanup } of hoverLayers.values()) cleanup()
    for (const layer of scrollLayers.values()) restore(layer)
    scrollLayers.clear()
    hoverLayers.clear()
    window.removeEventListener('scroll', invalidate, true)
    window.removeEventListener('resize', invalidate)
    window.removeEventListener('load', invalidate)
    reducedMotion.removeEventListener('change', resetMotion)
    finePointer.removeEventListener('change', resetMotion)
  })
})
