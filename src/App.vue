<template>
  <div id="app">
    <!-- Fixed sidebar + main content column.
         CSS offsets .dashboard-main by the sidebar width on desktop, and
         removes that offset on tablet/mobile where the sidebar is a drawer. -->
    <Header v-if="showLayout" />
    <main :class="showLayout ? 'dashboard-main' : ''">
      <Navbar v-if="showLayout" />
      <router-view v-slot="{ Component, route }">
        <Transition name="feeta-page" appear>
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
      <Footer v-if="showLayout" />
    </main>
    <FeetaPageLoader />
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FeetaPageLoader from './components/common/FeetaPageLoader.vue'
import Header from './components/layout/header/index.vue'
import Navbar from './components/layout/navbar/index.vue'
import Footer from './components/layout/footer/index.vue'
import { useLoadingStore } from './stores/loading'

export default {
  name: 'App',
  components: {
    FeetaPageLoader,
    Header,
    Navbar,
    Footer,
  },
  setup() {
    const route = useRoute()
    const loading = useLoadingStore()
    const showLayout = computed(() => route.meta.layout !== false)

    async function handleLoadingTimeout(event) {
      const result = await Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'warning',
        title: event.detail?.message || 'This is taking longer than expected.',
        text: 'The loader was safely closed. Retry the page if data is still missing.',
        showConfirmButton: true,
        confirmButtonText: 'Retry',
        showCloseButton: true,
        timer: 7000,
        timerProgressBar: true,
      })
      if (result.isConfirmed) window.location.reload()
    }

    function resetLoading() {
      loading.reset()
    }

    function handlePageShow(event) {
      if (event.persisted) resetLoading()
    }

    onMounted(() => {
      window.addEventListener('feeta:loading-timeout', handleLoadingTimeout)
      window.addEventListener('pageshow', handlePageShow)
      window.addEventListener('beforeunload', resetLoading)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('feeta:loading-timeout', handleLoadingTimeout)
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('beforeunload', resetLoading)
    })
    return { showLayout }
  }
}
</script>

<style>
.feeta-page-enter-active,
.feeta-page-leave-active {
  transition: opacity .2s ease, transform .2s ease, filter .2s ease;
}

.feeta-page-enter-from {
  opacity: 0;
  transform: translateY(7px) scale(.985);
  filter: blur(1px);
}

.feeta-page-leave-to {
  opacity: 0;
  transform: translateY(-3px) scale(.995);
  filter: blur(1px);
}

.feeta-page-enter-to,
.feeta-page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}
</style>
