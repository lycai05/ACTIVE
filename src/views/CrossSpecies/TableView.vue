<template>
    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
      <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
        title="Search genes or genomic regions" 
        >
        <template #header>
          <n-h3 align-text>Search human CREs with sequence homology in mouse</n-h3>
        </template>
        <template #default>
          <n-card>
            <div class="flex justify-between">
              <div class="mb-4 flex items-center min-h-[28px]">
                <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
                  Showing {{ offset + 1 }} to {{ Math.min(offset + pageSize, itemCount) }}
                  out of {{ itemCount }} enhancers
                </span>
              </div>
              <div class="mb-4">
                <n-button type="primary" @click="fetchData" :loading="loading">
                  Reload Data
                </n-button>
              </div>
            </div>
            <n-data-table remote :bordered="false" :columns="columns" :loading="loading" :data="tableData"
              :pagination="pagination" @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
          </n-card>
        </template>
      </CardActions>
    </CardWrapper>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, h } from 'vue'
  import { NCard, NDataTable, NButton } from 'naive-ui'
  import type { DataTableColumns } from 'naive-ui'
  import axios from 'axios'
  
  const emit = defineEmits(['update-regions'])
  
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const itemCount = ref(100)
  const tableData = ref([])
  
  const offset = computed(() => (currentPage.value - 1) * pageSize.value)
  
  const pagination = computed(() => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    itemCount: itemCount.value,
    pageCount: Math.ceil(itemCount.value / pageSize.value)
  }))
  
  // 解析 sequence_homology
  const parseHomology = (homology: string) => {
    if (homology === 'NA') return null
    const [chrom, range] = homology.split(':')
    const [start, end] = range.split('-').map(Number)
    return { chrom, start, end }
  }
  
  const handleClick = (row) => {
    const mouseRegion = parseHomology(row.sequence_homology)
    if (mouseRegion) {
      emit('update-regions', {
        human: {
          chrom: row.chrom,
          start: row.start,
          end: row.end
        },
        mouse: mouseRegion
      })
    }
  }
  
  const columns: DataTableColumns = [
    { title: 'Chrom', key: 'chrom' },
    { title: 'Start', key: 'start' },
    { title: 'End', key: 'end' },
    { title: '-logPvalue', key: 'logPvalue' },
    { title: 'File ID', key: 'file_id' },
    { title: 'Experiment', key: 'experiment' },
    { title: 'Subtissue', key: 'subtissue' },
    { title: 'Tissue', key: 'tissue' },
    { title: 'Sequence Homology', key: 'sequence_homology' },
    { title: 'Map Ratio', key: 'map_ratio' },
    {
      title: 'View',
      key: 'view',
      render(row) {
        const isMouseDisabled = row.sequence_homology === 'NA'
        return h('div', { class: 'flex gap-2' }, [
          h(
            NButton,
            {
              size: 'small',
              type: 'success',
              disabled: isMouseDisabled,
              onClick: () => {
                if (!isMouseDisabled) {
                  handleClick(row)
                }
              }
            },
            { default: () => 'Homologous region' }
          )
        ])
      }
    },
    {
      title: 'Annotate',
      key: 'annotate',
      render(row) {
        const mouseRegion = parseHomology(row.sequence_homology)
        const isMouseDisabled = row.sequence_homology === 'NA'
  
        return h('div', { class: 'flex gap-2' }, [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => {
                emit('update-regions', {
                  human: {
                    chrom: row.chrom,
                    start: row.start,
                    end: row.end
                  },
                  mouse: null
                })
              }
            },
            { default: () => 'Human' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              disabled: isMouseDisabled,
              onClick: () => {
                if (!isMouseDisabled && mouseRegion) {
                  emit('update-regions', {
                    human: null,
                    mouse: mouseRegion
                  })
                }
              }
            },
            { default: () => 'Mouse' }
          )
        ])
      }
    }
  ]
  
  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchData()
  }
  
  const handlePageSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    fetchData()
  }
  
  const fetchData = async () => {
    loading.value = true
    try {
      const response = await axios.get('http://47.107.91.5:8888/api/crossspecies/', {
        params: {
          page: currentPage.value,
          page_size: pageSize.value
        }
      })
      tableData.value = response.data.results
      itemCount.value = response.data.count
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 初始加载数据
  fetchData()
  </script>