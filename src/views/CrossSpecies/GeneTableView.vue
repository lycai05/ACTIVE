<template>
  <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
    <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
      title="Search ortholog genes" >
      <template #header>
        <n-h3 align-text>Search human-mouse ortholog genes</n-h3>
      </template>
      <template #default>
        <n-card>
          <!-- Search Form -->
          <div class="mb-6 space-y-4">
            <!-- Human Region Search -->
            <div class="space-y-2">
              <div class="text-sm font-medium">Human Region</div>
              <div class="flex space-x-2">
                <n-select v-model:value="searchParams.human_chrom" :options="humanChromOptions" placeholder="Chromosome"
                  class="w-32" />
                <n-input-number v-model:value="searchParams.human_start" placeholder="Start" class="w-40" />
                <n-input-number v-model:value="searchParams.human_end" placeholder="End" class="w-40" />
              </div>
            </div>

            <!-- Mouse Region Search -->
            <div class="space-y-2">
              <div class="text-sm font-medium">Mouse Region</div>
              <div class="flex space-x-2">
                <n-select v-model:value="searchParams.mouse_chrom" :options="mouseChromOptions" placeholder="Chromosome"
                  class="w-32" />
                <n-input-number v-model:value="searchParams.mouse_start" placeholder="Start" class="w-40" />
                <n-input-number v-model:value="searchParams.mouse_end" placeholder="End" class="w-40" />
              </div>
            </div>

            <!-- Gene Name Search -->
            <div class="flex space-x-4">
              <div class="flex-1">
                <div class="text-sm font-medium mb-1">Human Gene Name</div>
                <n-input v-model:value="searchParams.human_gene_name" placeholder="Enter human gene name" />
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium mb-1">Mouse Gene Name</div>
                <n-input v-model:value="searchParams.mouse_gene_name" placeholder="Enter mouse gene name" />
              </div>
            </div>

            <!-- Search Button -->
            <div class="flex justify-end space-x-2">
              <n-button @click="resetSearch">
                Reset
              </n-button>
              <n-button type="primary" @click="fetchData" :loading="loading">
                Search
              </n-button>
            </div>
          </div>

          <!-- Table Header Info -->
          <div class="flex justify-between mb-4">
            <div class="flex items-center min-h-[28px]">
              <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
                Showing {{ offset + 1 }} to {{ Math.min(offset + pageSize, itemCount) }}
                out of {{ itemCount }} genes
              </span>
            </div>
          </div>

          <!-- Results Table -->
          <n-data-table remote :bordered="false" :columns="columns" :loading="loading" :data="tableData"
            :pagination="pagination" @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
        </n-card>
      </template>
    </CardActions>
  </CardWrapper>
  
  <n-modal v-model:show="showExpressionDialog" preset="card" size="huge" header-class="bg-white" content-class="bg-white">
    <template #header>
      Gene expression across {{ selectedGene?.type === 'human' ? 'human' : 'mouse' }} tissues
    </template>
    
    <!-- 使用条件渲染来切换不同的组件 -->
    <component 
      :is="selectedGene?.type === 'human' ? HumanGeneExpressionChart : MouseGeneExpressionChart"
      :gene="selectedGene"
    />
  </n-modal>

</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NCard, NDataTable, NButton, NSelect, NInputNumber, NInput } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import axios from 'axios'

const emit = defineEmits(['update-regions'])

import MouseGeneExpressionChart from './MouseGeneExpressionChart.vue'
import HumanGeneExpressionChart from './HumanGeneExpressionChart.vue'

// 添加状态变量
const showExpressionDialog = ref(false)
const selectedGene = ref(null)

// Pagination state
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const itemCount = ref(0)
const tableData = ref([])

const offset = computed(() => (currentPage.value - 1) * pageSize.value)

const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  itemCount: itemCount.value,
  pageCount: Math.ceil(itemCount.value / pageSize.value),
  prefix({ itemCount }) {
    return `Total: ${itemCount}`
  }
}))

// Search parameters
const searchParams = ref({
  human_chrom: null,
  human_start: null,
  human_end: null,
  mouse_chrom: null,
  mouse_start: null,
  mouse_end: null,
  human_gene_name: '',
  mouse_gene_name: ''
})

// Chromosome options
const humanChromOptions = [
  'chr1', 'chr2', 'chr3', 'chr4', 'chr5', 'chr6', 'chr7', 'chr8', 'chr9', 'chr10',
  'chr11', 'chr12', 'chr13', 'chr14', 'chr15', 'chr16', 'chr17', 'chr18', 'chr19',
  'chr20', 'chr21', 'chr22', 'chrX', 'chrY'
].map(value => ({ label: value, value }))

const mouseChromOptions = [
  'chr1', 'chr2', 'chr3', 'chr4', 'chr5', 'chr6', 'chr7', 'chr8', 'chr9', 'chr10',
  'chr11', 'chr12', 'chr13', 'chr14', 'chr15', 'chr16', 'chr17', 'chr18', 'chr19',
  'chrX', 'chrY'
].map(value => ({ label: value, value }))

// Table columns
const columns: DataTableColumns = [
  { 
    title: 'Human Gene',
    key: 'human_gene_name',
    width: 120,
    fixed: 'left'
  },
  { 
    title: 'Human Gene Id',
    key: 'human_gene_id',
    width: 120
  },
  { 
    title: 'Mouse Gene',
    key: 'mouse_gene_name',
    width: 120 
  },

  { 
    title: 'Mouse Gene Id',
    key: 'mouse_gene_id',
    width: 120 
  },
  { 
    title: 'Human Location',
    key: 'human_location',
    width: 200,
    render(row) {
      return `${row.human_chrom}:${row.human_start}-${row.human_end}`
    }
  },
  { 
    title: 'Mouse Location',
    key: 'mouse_location',
    width: 200,
    render(row) {
      return `${row.mouse_chrom}:${row.mouse_start}-${row.mouse_end}`
    }
  },
  { 
    title: 'Human Gene Type',
    key: 'human_gene_type',
    width: 120 
  },
  { 
    title: 'Mouse Gene Type',
    key: 'mouse_gene_type',
    width: 120 
  },
  {
    title: 'Identity',
    children: [
      { 
        title: 'Human %ID',
        key: 'human_perc_id',
        width: 100,
        render(row) {
          return `${row.human_perc_id.toFixed(1)}%`
        }
      },
      { 
        title: 'Mouse %ID',
        key: 'mouse_perc_id',
        width: 100,
        render(row) {
          return `${row.mouse_perc_id.toFixed(1)}%`
        }
      }
    ]
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 280, // 增加宽度以容纳更多按钮
    fixed: 'right',
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => {
              emit('update-regions', {
                human: {
                  chrom: row.human_chrom,
                  start: row.human_start,
                  end: row.human_end
                },
                mouse: {
                  chrom: row.mouse_chrom,
                  start: row.mouse_start,
                  end: row.mouse_end
                }
              })
            }
          },
          { default: () => 'View in Browser' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => {
              showExpressionDialog.value = true
              selectedGene.value = {
                human_gene_id: row.human_gene_id,
                mouse_gene_id: row.mouse_gene_id,
                type: 'human'
              }
            }
          },
          { default: () => 'Human Exp' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'success',
            onClick: () => {
              showExpressionDialog.value = true
              selectedGene.value = {
                human_gene_id: row.human_gene_id,
                mouse_gene_id: row.mouse_gene_id,
                type: 'mouse'
              }
            }
          },
          { default: () => 'Mouse Exp' }
        )
      ])
    }
  }
]

// Pagination handlers
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

// Reset search parameters
const resetSearch = () => {
  searchParams.value = {
    human_chrom: null,
    human_start: null,
    human_end: null,
    mouse_chrom: null,
    mouse_start: null,
    mouse_end: null,
    human_gene_name: '',
    mouse_gene_name: ''
  }
  currentPage.value = 1
  fetchData()
}

// Fetch data from API
const fetchData = async () => {
  loading.value = true
  try {
    // Filter out null/empty values from searchParams
    const params = {
      ...Object.fromEntries(
        Object.entries(searchParams.value).filter(([_, value]) => value != null && value !== '')
      ),
      page: currentPage.value,
      page_size: pageSize.value
    }

    const response = await axios.get('http://47.107.91.5:8888/api/crossspecies/ortholog-gene-search/', {
      params
    })
    
    // 如果后端返回的数据结构包含 results 和 count
    if (response.data.results) {
      tableData.value = response.data.results
      itemCount.value = response.data.count
    } else {
      // 如果后端直接返回数据数组
      tableData.value = response.data
      itemCount.value = response.data.length
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

// Initial data load
fetchData()
</script>