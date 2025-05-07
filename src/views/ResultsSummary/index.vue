<template>
  <div class="w-full">
    <div v-if="!overviewData">
      <n-empty description="No data available">
        <template #extra>
          <n-button @click="handleBackToInput">Back to Input</n-button>
        </template>
      </n-empty>
    </div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
        <GenomeCard
          v-for="item in currentPageItems"
          :key="`${item.chrom}-${item.start}`"
          :data="item"
          @click="handleOverviewClick(item)"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-2">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span class="px-4 py-2">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import GenomeCard from './GenomeCard.vue';
import { useModalStore } from '@/stores/modalStore'
import { useOverviewStore } from '@/stores/overviewStore'
import { NEmpty, NButton } from 'naive-ui'

const router = useRouter()
const modalStore = useModalStore()
const overviewStore = useOverviewStore()
const { overviewData } = storeToRefs(overviewStore)

const itemsPerPage = 10;
const currentPage = ref(1);

const totalPages = computed(() => {
  if (!overviewData.value) return 0;
  return Math.ceil(overviewData.value.length / itemsPerPage)
});

const currentPageItems = computed(() => {
  if (!overviewData.value) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  return overviewData.value.slice(start, start + itemsPerPage);
});

const handleOverviewClick = (item) => {
  console.log(item)
  modalStore.openModal({
    chrom: `${item.chrom}`, 
    start: `${item.start}`, 
    end: `${item.end}`
  })
}

const handleBackToInput = () => {
  router.push({ name: 'Input' })
}

// 组件卸载时清理数据
// onUnmounted(() => {
//   overviewStore.clearOverviewData()
// })
</script>