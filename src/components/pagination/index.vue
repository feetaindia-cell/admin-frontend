<template>
  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
    <span class="pagination-summary">Showing {{ totalItems ? startIndex + 1 : 0 }} to {{ endIndex }} of {{ totalItems }} entries</span>
    <nav aria-label="Table pagination">
    <ul class="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center mb-0">
      <!-- Previous Button -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button type="button" class="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 
          d-flex align-items-center justify-content-center h-32-px w-32-px p-0"
          :disabled="currentPage === 1" aria-label="Previous page" @click="changePage(currentPage - 1)">
          <iconify-icon icon="ep:d-arrow-left"></iconify-icon>
        </button>
      </li>

      <!-- Page Numbers -->
      <li class="page-item" v-for="n in visiblePages" :key="n">
        <button type="button" :class="[
          'page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px',
          currentPage === n ? 'bg-primary-600 text-white' : 'bg-neutral-200'
        ]" :aria-current="currentPage === n ? 'page' : undefined" :aria-label="`Page ${n}`" @click="changePage(n)">
          {{ n }}
        </button>
      </li>

      <!-- Next Button -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button type="button" class="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 
          d-flex align-items-center justify-content-center h-32-px w-32-px p-0"
          :disabled="currentPage === totalPages" aria-label="Next page" @click="changePage(currentPage + 1)">
          <iconify-icon icon="ep:d-arrow-right"></iconify-icon>
        </button>

      </li>
    </ul>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    currentPage: Number,
    totalPages: Number,
    startIndex: Number,
    endIndex: Number,
    totalItems: Number
  },
  emits: ['page-changed'],
  computed: {
    visiblePages() {
      const total = Math.max(1, this.totalPages || 1)
      const start = Math.max(1, Math.min(this.currentPage - 2, total - 4))
      const end = Math.min(total, start + 4)
      return Array.from({ length: end - start + 1 }, (_, index) => start + index)
    },
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$emit('page-changed', page);
      }
    }
  }
};
</script>

<style scoped>
.page-link{cursor:pointer;transition:transform .15s ease,background-color .15s ease,box-shadow .15s ease}.page-link:not(:disabled):hover{color:#315ed1!important;background:#edf3ff!important;transform:translateY(-1px);box-shadow:0 5px 12px rgba(15,23,42,.08)}.page-link:disabled{cursor:not-allowed;opacity:.45}.pagination-summary{color:#64748b;font-size:13px}@media(max-width:575px){.pagination-summary{width:100%;text-align:center}}
</style>
