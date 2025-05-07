<!-- DomainTable.vue -->
<template>
    <div class="domain-table">
      <div class="flex justify-between">
        <div class="mb-4 flex items-center min-h-[28px]">
          <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
            Showing {{ offset + 1 }} to {{ offset + pageSize }} records of {{ itemCount }} in total.
          </span>
        </div>
      </div>
      <div>
        <n-data-table
          remote
          :bordered="false"
          :columns="columns"
          :loading="loadingRef"
          :data="displayData"
          :pagination="paginationReactive"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, computed, onMounted, watch, h } from 'vue'
  import { useRouter } from 'vue-router'
  import { NDataTable } from 'naive-ui'
  import type { DataTableColumns } from 'naive-ui'

  // 定义类型
  interface DomainData {
    chrom: string
    start: number
    end: number
    file_id: string
    experiment: string
    tissue: string
  }

  interface Props {
    data?: DomainData[]
    loading?: boolean
    pageSize?: number
    onAction?: (row: DomainData) => void
    region?: {
      chrom: string
      start: number
      end: number
    }
  }

  // Props定义
  const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    loading: false,
    pageSize: 10,
    onAction: undefined,
    region: undefined
  })

  // 状态管理
  const router = useRouter()
  const loadingRef = ref(props.loading)
  const currentPage = ref(1)
  const pageSize = ref(props.pageSize)

  // 计算属性
  const displayData = computed(() => {
    return props.data.slice(offset.value, offset.value + pageSize.value)
  })

  const itemCount = computed(() => {
    return props.data.length
  })

  const offset = computed(() => {
    return (currentPage.value - 1) * pageSize.value
  })

  const paginationReactive = computed(() => ({
    page: currentPage.value,
    pageCount: Math.ceil(itemCount.value / pageSize.value),
    pageSize: pageSize.value,
    itemCount: itemCount.value
  }))

  // 列定义
  const columns: DataTableColumns = [
    {
      title: 'Chromosome',
      key: 'chrom',
      render: (row) => row.chrom
    },
    {
      title: 'Start',
      key: 'start',
      render: (row) => row.start.toLocaleString()
    },
    {
      title: 'End',
      key: 'end',
      render: (row) => row.end.toLocaleString()
    },
    {
      title: 'File ID',
      key: 'file_id',
      render: (row) => h(
        'a',
        {
          href: 'javascript:void(0);',
        //   onClick: () => router.push(`/file/${row.file_id}`),
          style: { color: 'blue', textDecoration: 'underline', cursor: 'pointer' }
        },
        row.file_id
      )
    },
    {
      title: 'Experiment ID',
      key: 'experiment',
      render: (row) => h(
        'a',
        {
          href: 'javascript:void(0);',
        //   onClick: () => router.push(`/experiment/${row.experiment}`),
          style: { color: 'blue', textDecoration: 'underline', cursor: 'pointer' }
        },
        row.experiment
      )
    },
    {
      title: 'Tissue',
      key: 'tissue',
      render: (row) => row.tissue
    }
  ]

  // 方法定义
  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  // 监听器
  watch(() => props.loading, (newVal) => {
    loadingRef.value = newVal
  })

  // 生命周期
  onMounted(() => {
    console.log(props.data)
    if (props.region) {
      console.log(`Showing domain data for region: ${props.region.chrom}:${props.region.start}-${props.region.end}`)
    }
  })
  </script>

  <style scoped>
  .domain-table {
    width: 100%;
  }
  </style>