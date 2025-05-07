<!-- LoopTable.vue -->
<template>
    <div class="loop-table">
      <div class="flex justify-between">
        <div class="mb-4 flex items-center min-h-[28px]">
          <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
            Showing {{ offset + 1 }} to {{ offset + pageSize }} loops of {{ itemCount }} in total.
          </span>
        </div>
        <div class="mb-4 flex items-center">
          <n-input-group>
            <n-input-number
              v-model:value="strengthFilter.min"
              placeholder="Min Strength"
              :min="0"
              :max="1"
              size="small"
            />
            <n-input-number
              v-model:value="strengthFilter.max"
              placeholder="Max Strength"
              :min="0"
              :max="1"
              size="small"
            />
            <n-button
              type="primary"
              size="small"
              @click="handleFilterClick"
            >
              Filter
            </n-button>
          </n-input-group>
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
  import { NButton, NDataTable, NInputGroup, NInputNumber } from 'naive-ui'
  import type { DataTableColumns } from 'naive-ui'
interface Props {
  data?: CompartmentData[]
  loading?: boolean
  pageSize?: number
  onAction?: (row: CompartmentData) => void
  region?: {
    chrom: string
    start: number
    end: number
  }
}
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
  const strengthFilter = ref({
    min: null as number | null,
    max: null as number | null
  })
  
  // 计算属性
  const displayData = computed(() => {
    console.log("44444: ", props.data)
    if (!props.data || props.data.length === 0) {
      return []; // 数据未加载时返回空数组
    }
    let filteredData = props.data

    if (strengthFilter.value.min !== null || strengthFilter.value.max !== null) {
      filteredData = props.data.filter(item => {
        const matchesMin = strengthFilter.value.min === null || item.strength >= strengthFilter.value.min
        const matchesMax = strengthFilter.value.max === null || item.strength <= strengthFilter.value.max
        return matchesMin && matchesMax
      })
    }
    return filteredData.slice(offset.value, offset.value + pageSize.value)
  })
  
  const itemCount = computed(() => {
    if (strengthFilter.value.min !== null || strengthFilter.value.max !== null) {
      return props.data.filter(item => {
        const matchesMin = strengthFilter.value.min === null || item.strength >= strengthFilter.value.min
        const matchesMax = strengthFilter.value.max === null || item.strength <= strengthFilter.value.max
        return matchesMin && matchesMax
      }).length
    }
    if (!props.data || props.data.length === 0) {
      return 0; // 数据未加载时返回空数组
    }
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
      title: 'Sample Id',
      key: 'sample_id',
      render: (row) => h(
        'a',
        {
          href: 'javascript:void(0);',
          // onClick: () => router.push(`/sample/${row.sample_id}`),
          style: { color: 'blue', textDecoration: 'underline', cursor: 'pointer' }
        },
        row.sample_id
      )
    },
    {
      title: 'Tissue',
      key: 'tissue'
    },
    {
      title: 'Health Status',
      key: 'health_status'
    },
    {
      title: 'Anchor 1',
      key: 'anchor1',
      render: (row) => `${row.chrom}:${row.start}-${row.end}`
    },
    {
      title: 'Anchor 2',
      key: 'anchor2',
      render: (row) => `${row.chrom}:${row.start}-${row.end}`
    },
    {
      title: 'Strength',
      key: 'counts',
      render: (row) => {
        const strength = row.counts
        const color = getStrengthColor(strength)
        return h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          },
          [
            h('div', {
              style: {
                width: '50px',
                height: '10px',
                backgroundColor: color,
                borderRadius: '5px'
              }
            }),
            h('span', strength.toFixed(2))
          ]
        )
      },
      sorter: (row1, row2) => row1.counts - row2.counts
    },
    {
      title: 'Action',
      key: 'action',
      render: (row) => h(
        NButton,
        {
          type: 'primary',
          size: 'small',
          onClick: () => handleActionClick(row)
        },
        { default: () => 'View Details' }
      )
    }
  ]
  
  // 辅助函数
  const getStrengthColor = (strength: number): string => {
    // 根据强度返回不同的颜色
    if (strength >= 0.8) return '#FF0156'
    if (strength >= 0.5) return '#FFA500'
    return '#00B27B'
  }
  
  // 方法定义
  const handlePageChange = (page: number) => {
    currentPage.value = page
  }
  
  const handleActionClick = (row: LoopData) => {
    if (props.onAction) {
      props.onAction(row)
    }
  }
  
  const handleFilterClick = () => {
    currentPage.value = 1  // 重置页码
  }
  
  // 监听器
  watch(() => props.loading, (newVal) => {
    loadingRef.value = newVal
  })
  
  // 生命周期
  onMounted(() => {
    //
    if (props.region) {
      console.log(`Showing loop data for region: ${props.region.chrom}:${props.region.start}-${props.region.end}`)
    }
  })
  </script>
  
  <style scoped>
  .loop-table {
    width: 100%;
  }
  </style>