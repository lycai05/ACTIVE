<!-- CompartmentTable.vue -->
<template>
  <div class="compartment-table">
    <div class="flex justify-between">
      <div class="mb-4 flex items-center min-h-[28px]">
        <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
          Showing {{ offset + 1 }} to {{ offset + pageSize }} cell types of {{ itemCount }} in total.
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import { NRadioGroup, NRadioButton, NButton, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

// 定义类型
interface CompartmentData {
  sample_name: string
  compartment: 'A' | 'B'
  value: number
}

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
const displayData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return []; // 数据未加载时返回空数组
  }

  let filteredData = props.data;
  if (typeValue.value) {
    filteredData = props.data.filter((item) =>
      (item.value > 0 && typeValue.value === 'A') ||
      (item.value <= 0 && typeValue.value === 'B')
    );
  }
  // console.log("display_data: ", filteredData)
  return filteredData.slice(offset.value, offset.value + pageSize.value); // 修正：去掉 .data
});

const itemCount = computed(() => {
  if (typeValue.value) {
    return props.data.filter(item => 
      (item.E1score > 0 && typeValue.value === 'A') || 
      (item.E1score <= 0 && typeValue.value === 'B')
    ).length
  }
  // console.log("22222222222222: ", props.data)
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

// 常量定义
const typeFilter = [
  { value: 'A', label: 'A compartment' },
  { value: 'B', label: 'B compartment' },
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
        // onClick: () => router.push(`http://127.0.0.1:8000/api/get_samples/?sample_name=${row.sample_name}`),
        style: { color: 'blue', textDecoration: 'underline', cursor: 'pointer' }
      },
      row.sample_id
    )
  },
  {
    title: 'Compartment',
    key: 'compartment',
    render: (row) => {
      const isPositive = row.E1score > 0
      const color = isPositive ? '#00B27B' : '#FF0156'
      const label = isPositive ? 'A' : 'B'
      return h(
        'div',
        {
          style: {
            backgroundColor: color,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'inline-block',
            textAlign: 'center',
            lineHeight: '20px',
            color: '#fff'
          }
        },
        label
      )
    }
  },
  {
    title: 'E1 Value',
    key: 'value',
    render: (row) => row.E1score.toFixed(2)
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
      { default: () => 'Click Me' }
    )
  }
]

// 方法定义
const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleActionClick = (row: CompartmentData) => {
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
  // console.log(props.data)
  if (props.region) {
    console.log(`Showing compartment data for region: ${props.region.chrom}:${props.region.start}-${props.region.end}`)
  }
})
</script>

<style scoped>
.compartment-table {
  width: 100%;
}
</style>