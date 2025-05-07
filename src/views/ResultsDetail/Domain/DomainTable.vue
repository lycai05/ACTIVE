<template>
  <div class="domain-table">
    <div class="flex justify-between">
      <div class="mb-4 flex items-center min-h-[28px]">
        <!-- 使用 Math.min 确保结束项数不超过 total count -->
        <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
          Showing {{ offset + 1 }} to {{ Math.min(offset + pageSize, itemCount) }} domains of {{ itemCount }} in total.
        </span>
      </div>
      <div class="mb-4 flex items-center">
        <n-radio-group v-model:value="typeValue" name="radiobuttongroup">
          <n-radio-button
            v-for="type in typeFilter"
            :key="type.value"
            :value="type.value"
            :label="type.label"
          />
        </n-radio-group>
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
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import { NRadioGroup, NRadioButton, NButton, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface DomainData {
  sample_id: string;
  tissue: string;
  health_status: string;
  domain_type: string;
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
const typeValue = ref('')

// 计算属性
const itemCount = computed(() => {
  if (typeValue.value) {
    return props.data.filter(item => item.domain_type === typeValue.value).length
  }
  return props.data.length
})

const offset = computed(() => (currentPage.value - 1) * pageSize.value)

const displayData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }
  let filteredData = props.data
  if (typeValue.value) {
    filteredData = filteredData.filter(item => item.domain_type === typeValue.value)
  }
  return filteredData.slice(offset.value, offset.value + pageSize.value)
})

const paginationReactive = computed(() => ({
  page: currentPage.value,
  pageCount: Math.ceil(itemCount.value / pageSize.value),
  pageSize: pageSize.value,
  itemCount: itemCount.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
}))

// 常量定义
const typeFilter = [
  { value: 'B', label: 'Bound' },
  { value: 'D', label: 'Domain' },
  { value: '', label: 'All' }
]

// 列定义
const columns: DataTableColumns = [
  {
    title: 'Sample Id',
    key: 'sample_id',
    render: (row) => h(
      'a',
      {
        href: 'javascript:void(0);',
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
    title: 'Domain Type',
    key: 'type',
    render: (row) => {
      const colorMap = {
        'B': '#FF0156',
        'D': '#FFA500'
      }
      return h(
        'div',
        {
          style: {
            backgroundColor: colorMap[row.type],
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'inline-block',
            color: '#fff'
          }
        },
        row.type
      )
    }
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

// 方法定义
const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 更改每页条数后，回到第一页
}

const handleActionClick = (row: DomainData) => {
  if (props.onAction) {
    props.onAction(row)
  }
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
