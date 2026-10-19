<script setup lang="ts">
import { contentSections, isContentSection, type ContentSection } from '../../shared/config/content'
const route = useRoute()
const authenticated = ref(false)
const checking = ref(true)
const password = ref('')
const loggingIn = ref(false)
const error = ref('')
const section = computed(() => typeof route.query.section === 'string' && isContentSection(route.query.section) ? route.query.section as ContentSection : 'registrations')
const title = computed(() => contentSections.find(item => item.id === section.value)?.label || 'Заявки')
const navigation = computed(() => [
  { label: 'Заявки', icon: 'i-lucide-inbox', to: '/admin', exactQuery: true, active: section.value === 'registrations' },
  ...contentSections.map(item => ({ label: item.label, icon: item.icon, to: { path: '/admin', query: { section: item.id } }, exactQuery: true, active: section.value === item.id }))
])
useHead({ title: 'PMMF / Управление сайтом', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const login = async () => {
  loggingIn.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    password.value = ''
    authenticated.value = true
  } catch { error.value = 'Не удалось войти. Проверьте пароль и настройки доступа.' }
  finally { loggingIn.value = false }
}
const logout = async () => {
  try { await $fetch('/api/admin/logout', { method: 'POST' }); authenticated.value = false }
  catch { error.value = 'Не удалось выйти. Попробуйте ещё раз.' }
}
onMounted(async () => {
  try { await $fetch('/api/admin/session'); authenticated.value = true }
  catch { authenticated.value = false }
  finally { checking.value = false }
})
</script>

<template>
  <div class="admin-shell min-h-screen bg-white font-montserrat text-slate-900">
    <div v-if="checking" role="status" class="flex min-h-screen items-center justify-center text-slate-500">Проверяем доступ…</div>
    <main v-else-if="!authenticated" class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <UCard class="w-full max-w-md">
        <template #header><p class="text-xs font-semibold uppercase tracking-widest text-violet-600">PMMF / admin</p><h1 class="mt-2 text-2xl font-semibold">Управление сайтом</h1></template>
        <form class="space-y-5" @submit.prevent="login">
          <UFormField label="Пароль администратора" name="password"><UInput v-model="password" type="password" autocomplete="current-password" required class="w-full" size="lg" /></UFormField>
          <UAlert v-if="error" color="error" :description="error" />
          <UButton type="submit" label="Войти" :loading="loggingIn" block size="lg" />
        </form>
      </UCard>
    </main>
    <UDashboardGroup v-else>
      <UDashboardSidebar id="pmmf-admin" collapsible class="bg-slate-50/70" :ui="{ footer: 'border-t border-default' }">
        <template #header="{ collapsed }"><NuxtLink to="/admin" class="flex items-center gap-2 py-3 font-semibold"><span class="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white">М</span><span v-if="!collapsed">PMMF <span class="font-normal text-slate-400">/ admin</span></span></NuxtLink></template>
        <template #default="{ collapsed }"><p v-if="!collapsed" class="mb-2 mt-4 px-3 text-xs uppercase tracking-wider text-slate-400">Управление сайтом</p><UNavigationMenu :collapsed="collapsed" :items="navigation" orientation="vertical" tooltip /></template>
        <template #footer="{ collapsed }"><div class="w-full py-2"><UButton :label="collapsed ? undefined : 'Выйти'" icon="i-lucide-log-out" aria-label="Выйти" color="neutral" variant="ghost" block @click="logout" /></div></template>
      </UDashboardSidebar>
      <UDashboardPanel :id="section">
        <template #header><UDashboardNavbar :title="title"><template #leading><UDashboardSidebarCollapse /></template><template #right><UButton to="/" target="_blank" icon="i-lucide-external-link" label="Открыть сайт" color="neutral" variant="outline" size="sm" /></template></UDashboardNavbar></template>
        <template #body>
          <UAlert v-if="error" color="error" :description="error" />
          <AdminRegistrations v-if="section === 'registrations'" @unauthorized="authenticated = false" />
          <AdminContentEditor v-else :key="section" :section="section" @unauthorized="authenticated = false" />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>

<style>
.admin-shell { color-scheme: light; }
</style>
