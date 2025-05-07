<template>
    <div>
      <div class="flex justify-between">
        <div class="mb-4 flex items-center min-h-[28px]">
          <span class="text-sm font-medium text-gray-900 dark:text-white mr-3 flex-shrink-0">
            Showing {{ offset + 1 }} to {{ Math.min(offset + pageSize, itemCount) }}
            of {{ itemCount }} samples
          </span>
        </div>
        <div class="mb-4 flex items-center">
          <n-input-group>
            <n-input
              v-model:value="searchQuery"
              placeholder="Search sample ID..."
            />
            <n-button type="primary" @click="handleSearch">
              Search
            </n-button>
          </n-input-group>
        </div>
      </div>

      <n-data-table
        :bordered="false"
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </div>
  </template>

  <script setup lang="ts">
  import { ref, computed,h } from 'vue'
  import type { DataTableColumns,  } from 'naive-ui'
  import { NDataTable, NInput, NInputGroup, NButton, NTooltip } from 'naive-ui'



  interface CompartmentData {
    sample_id: string
    compartment: 'A' | 'B'
  }

  const props = defineProps<{
    data: CompartmentData[],
    bedRegion?: {
    chrom: string
    start: number
    end: number
  }
  }>()

  // Table state
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)

  // Computed values
  const offset = computed(() => (currentPage.value - 1) * pageSize.value)

  const filteredData = computed(() => {
    let filtered = props.data
    if (searchQuery.value) {
      filtered = filtered.filter(item =>
        item.sample_id.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    return filtered
  })

  const itemCount = computed(() => filteredData.value.length)

  const pagination = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: itemCount.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    prefix: ({ itemCount }) => `Total: ${itemCount}`
  }))

  // Table columns
  const columns: DataTableColumns = [
    {
      title: 'Sample ID',
      key: 'sample_id',
      sorter: 'default'
    },
    {
      title: 'Compartment',
      key: 'compartment',
      render(row) {
        const color = row.compartment === 'A' ? '#4CAF50' : '#2196F3'
        return h('div', {
          style: {
            backgroundColor: color,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }
        }, row.compartment)
      }
    },
    {
    title: 'Action',
    key: 'actions',
    width: 120,
    render(row) {
      return h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () => h(
            NButton,
            {
              secondary: true,
              size: 'small',
              onClick: () => addToBrowser(row)
            },
            {
              default: () => h('div', { class: 'flex items-center' }, [
                h('svg', {
                  class: 'w-4 h-4 mr-1',
                  xmlns: 'http://www.w3.org/2000/svg',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round'
                }, [
                  h('path', { d: 'M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778' })
                ]),
                'Add'
              ])
            }
          ),
          default: () => 'Add to browser'
        }
      )
    }
  }
  ]

  const addToBrowser = (row: CompartmentData) => {
  // 这里添加将数据添加到browser的逻辑
  // 可以触发一个事件让父组件处理，或者直接处理
  console.log(`Adding ${row.sample_id} to browser`)
  if (props.bedRegion) {
    const region = `${props.bedRegion.chrom}:${props.bedRegion.start}-${props.bedRegion.end}`
    console.log(`Region: ${region}`)
  }
  message.success(`Added ${row.sample_id} to browser`)
}

  // Methods
  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  const handleSearch = () => {
    currentPage.value = 1
  }
  </script>

  <style scoped>
  .n-input-group {
    width: 300px;
  }
  </style>