export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  const getObserver = () => {
    if (!import.meta.client || !('IntersectionObserver' in window)) {
      return null
    }

    observer ||= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        entry.target.classList.add('is-revealed')
        observer?.unobserve(entry.target)
      })
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.12
    })

    return observer
  }

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps() {
      return {
        class: 'reveal-on-scroll'
      }
    },
    mounted(el: HTMLElement) {
      el.classList.add('reveal-on-scroll')

      const revealObserver = getObserver()

      if (!revealObserver) {
        el.classList.add('is-revealed')
        return
      }

      revealObserver.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    }
  })
})
