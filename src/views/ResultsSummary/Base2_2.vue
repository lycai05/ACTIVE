<template>
    <n-data-table
      :columns="columns"
      :data="processedData"
      :pagination="pagination"
      :scroll-x="2000"
      :single-line="false"

      class="custom-table"
    />
  
    <n-modal v-model:show="showModal">
      <n-card
        style="width: 800px"
        title="Compartment Details"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button circle secondary @click="showModal = false">
            <template #icon>
              <Icon :name="CloseIcon" />
            </template>
          </n-button>
        </template>
        
        <CompartmentTable 
          v-if="selectedItem"
          :data="selectedItem.data"
        />
        
        <template #footer>
          <div class="flex justify-end">
            <n-button @click="showModal = false">Close</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </template>
  
  <script lang="ts" setup>
  import { NDataTable, NButton, NPopselect, NModal, NCard } from "naive-ui"
  import Icon from "@/components/common/Icon.vue"
  import { ref, h, toRefs, computed, reactive } from "vue"
  import CompartmentTable from './CompartmentTable.vue'
  
  // Types
  interface BedRegion {
    chrom: string
    start: number
    end: number
  }
  
  interface Statistics {
    A_count: number
    B_count: number
    NA_count: number
    Domain_count: number
    Boundary_count: number
    Others_count: number
  }
  
  interface ProcessedData {
    line_number: number
    bed_region: BedRegion
    statistics: Statistics
  }
  
  interface TooltipStyle {
    left: string
    top: string
  }
  
  interface TooltipInfo {
    visible: boolean
    content: string
    style: TooltipStyle
  }
  
  interface TooltipState {
    [key: number]: {
      compartment?: TooltipInfo
      domain?: TooltipInfo
      stripes?: TooltipInfo
      hic?: TooltipInfo
      hichip?: TooltipInfo
    }
  }
  
  // Props
  const props = withDefaults(
    defineProps<{
      rows?: number
      showActions?: boolean
      showDate?: boolean
      data?: ProcessedData[]
    }>(),
    { 
      rows: 5, 
      showActions: false, 
      showDate: false,
      data: () => []
    }
  )



  // Constants
  const PopupIcon = "carbon:popup"
  const DeleteIcon = "carbon:delete"
  const MenuIcon = "carbon:overflow-menu-vertical"
  const DownloadIcon = "carbon:cloud-download"
  const CloseIcon = "carbon:close"
  
  // Refs & Reactive State
  const { showActions, data } = toRefs(props)
  const showModal = ref(false)
  const selectedItem = ref(null)
  const tooltips: TooltipState = reactive({})
  
  const pagination = ref({
    pageSize: 10
  })
  
  // Methods
  const getCompartmentColor = (type: string) => ({
    'bg-[#4CAF50]': type === 'A',
    'bg-[#2196F3]': type === 'B',
    'bg-[#9E9E9E]': type === 'NA'
  })
  
  const getDomainColor = (type: string) => ({
    'bg-[#FF9800]': type === 'Domain',
    'bg-[#E91E63]': type === 'Boundary',
    'bg-[#9E9E9E]': type === 'Others'
  })
  
  const getTotalCount = (statistics: Statistics): number => {
    return statistics.A_count + statistics.B_count + statistics.NA_count
  }
  
  const getSegmentStyle = (count: number, total: number) => {
    if (total === 0) return { width: '0%' }
    return {
      width: `${(count / total) * 100}%`
    }
  }
  
  const getDonutPercentage = (statistics: Statistics): number => {
    const withLoops = statistics.A_count
    const total = statistics.A_count + statistics.B_count + statistics.NA_count
    
    if (total === 0) return 0
    return (withLoops / total) * 100
  }
  
  const showTooltip = (
    lineNumber: number, 
    type: string, 
    count: number, 
    event: MouseEvent, 
    category: string
  ) => {
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    const parentRect = target.parentElement?.getBoundingClientRect()
    
    if (parentRect) {
      tooltips[lineNumber] = {
        ...tooltips[lineNumber],
        [category]: {
          visible: true,
          content: `${type}: ${count} samples`,
          style: {
            left: `${rect.left - parentRect.left + rect.width / 2}px`,
            top: '-25px'
          }
        }
      }
    }
  }
  
  const showDonutTooltip = (
    lineNumber: number, 
    statistics: Statistics, 
    event: MouseEvent, 
    type: string
  ) => {
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    const parentRect = target.parentElement?.getBoundingClientRect()
    
    if (parentRect) {
      const withLoops = statistics.A_count
      const withoutLoops = statistics.B_count + statistics.NA_count
      
      tooltips[lineNumber] = {
        ...tooltips[lineNumber],
        [type]: {
          visible: true,
          content: `With loops: ${withLoops}, Without: ${withoutLoops}`,
          style: {
            left: `${rect.left - parentRect.left + rect.width / 2}px`,
            top: '-25px'
          }
        }
      }
    }
  }
  
  const hideTooltip = (lineNumber: number, category: string) => {
    if (tooltips[lineNumber]?.[category]) {
      tooltips[lineNumber][category].visible = false
    }
  }
  
  const showCompartmentDetails = (item: any) => {
    selectedItem.value = item
    showModal.value = true
  }
  
  // Render Functions
  const renderStackedBar = (row: any) => {
    return h('div', { class: 'statistics-wrapper relative' }, [
      h('div', { class: 'stacked-bar-container w-24' }, 
        ['A', 'B', 'NA'].map(type => 
          h('div', {
            class: ['bar-segment', getCompartmentColor(type)],
            style: getSegmentStyle(row.statistics[`${type}_count`], getTotalCount(row.statistics)),
            onMouseenter: (e) => showTooltip(row.line_number, type, row.statistics[`${type}_count`], e, 'compartment'),
            onMouseleave: () => hideTooltip(row.line_number, 'compartment'),
            onClick: () => showCompartmentDetails(row)
          })
        )
      ),
      tooltips[row.line_number]?.compartment?.visible && h('div', {
        class: 'tooltip',
        style: tooltips[row.line_number].compartment.style
      }, tooltips[row.line_number].compartment.content)
    ])
  }
  
// 修改渲染函数中的圆环图大小
const renderDonut = (row: any, type: string) => {
  return h('div', { class: 'donut-wrapper relative' }, [
    h('div', { class: 'donut-chart' }, [
      h('svg', { 
        viewBox: '0 0 32 32',
        class: 'donut',
        width: '24', // 添加固定宽度
        height: '24', // 添加固定高度
      }, [
        h('circle', {
          class: 'donut-ring',
          cx: '16',
          cy: '16',
          r: '12.73239544735164',
          fill: 'transparent',
          stroke: '#e6e6e6',
          'stroke-width': '3'
        }),
        h('circle', {
          class: 'donut-segment',
          cx: '16',
          cy: '16',
          r: '12.73239544735164',
          fill: 'transparent',
          stroke: '#673AB7',
          'stroke-width': '3',
          'stroke-dasharray': `${getDonutPercentage(row.statistics)} ${100 - getDonutPercentage(row.statistics)}`,
          'stroke-dashoffset': '25',
          // onMouseenter: (e) => showDonutTooltip(row.line_number, row.statistics, e, type),
          // onMouseleave: () => hideTooltip(row.line_number, type)
        })
      ])
    ]),
    tooltips[row.line_number]?.[type]?.visible && h('div', {
      class: 'tooltip',
      style: tooltips[row.line_number][type].style
    }, tooltips[row.line_number][type].content)
  ])
}

const showDetailTable = defineModel(false)


  // Columns Configuration
  const createCols = function() {

    return([
  {
    title: 'Location',
    key: 'location',
    children: [
      {
        title: 'Chrom',
        key: 'bed_region.chrom',
        minWidth: 10,
        maxWidth: 20,
        width: 60
      },
      {
        title: 'Start',
        key: 'bed_region.start',
        // width: 15
        width: 120
      },
      {
        title: 'End',
        key: 'bed_region.end',
        width: 120
      }
    ]
  },
  {
    title: 'Genomic context',
    key: 'context',
    children: [
      {
        title: 'Nearest gene',
        key: 'nearest_gene',
        minWidth: 10,
        maxWidth: 20,
        width: 60
      },
      {
        title: 'Nearest gene',
        key: 'nearest_gene',
        minWidth: 10,
        maxWidth: 20,
        width: 60
      }
    ]
  },
  {
    title: 'Human 3D genome organization',
    key: '3d_genome',
    children: [
      {
        title: 'Compartment',
        key: 'compartment',
        width: 120, 
        // render: (row) => renderStackedBar(row)
      },
      {
        title: 'Domain',
        key: 'domain',
        width: 80, 
        // render: (row) => renderStackedBar(row)
      },
      {
        title: 'Stripe',
        key: 'stripe',
        width: 60,        
        render: (row) => renderDonut(row, 'stripes')
      },
      {
        title: 'Loop',
        key: 'loops',
        width: 60,        
        render: (row) => renderDonut(row, 'hic')
      }
    ]
  },
  {
    title: 'Cross-species comparative 3D genome',
    key: 'comparative_3d',
    children: [
      {
        title: 'Sequence',
        key: 'sequence',
        width: 120, 
        // render: (row) => renderStackedBar(row)
      },
      {
        title: 'Enhancer',
        key: 'enhancer_comp',
        width: 120, 
        // render: (row) => renderStackedBar(row)
      },
      {
        title: 'Domain',
        key: 'domain_comp',
        width: 70,        
        render: (row) => renderDonut(row, 'domain_comp')
      },
      {
        title: 'Loop',
        key: 'loop_comp',
        width: 60,        
        render: (row) => renderDonut(row, 'loop_comp')
      }
    ]
  },
  {
    title: 'Cis regulatory landscape',
    key: 'cis_regulatory',
    children: [
      {
        title: 'Enhancer',
        key: 'enhancer_cis',
        width: 120, 
        // render: (row) => renderStackedBar(row)
      },
      {
        title: 'Cancer CRE',
        key: 'cancer_cre',
        width: 120, 
        // render: (row) => renderStackedBar(row)
      },
      {
        title: 'GWAS',
        key: 'gwas',
        width: 60,        
        render: (row) => renderDonut(row, 'gwas')
      },
      {
        title: 'Eqtl',
        key: 'eqtl',
        width: 60,        
        render: (row) => renderDonut(row, 'eqtl')
      }
    ]
  },
  {
    title: 'Cell specific epigenome',
    key: 'cell_specific',
    children: [
      {
        title: 'scATAC-seq',
        key: 'scatac_seq',
        width: 120,        
        render: (row) => renderDonut(row, 'scatac_seq')
      }
    ]
  },
  {
    title: 'View',
    key: 'visualize',
    render: function (row) {
      return h('svg', {
        class: 'w-5 h-5 text-grey-500 hover:text-blue-500 cursor-pointer transition-colors duration-300',
        'aria-hidden': 'true',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 18 18',
        onClick: (e) => { handleClick(row.id) }
      }, [
        h('path', {
          stroke: 'currentColor',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778'
        })
      ]);
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 100,
    render: () => h('div', { class: 'actions flex items-center justify-end gap-2' }, [
    h('svg', {
        class: 'w-5 h-5 text-grey-500 hover:text-blue-500 cursor-pointer transition-colors duration-300',
        'aria-hidden': 'true',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 18 18',
        onClick: (e) => { showDetailTable.value = true }
      }, [
        h('path', {
          stroke: 'currentColor',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778'
        })
      ]),
      h(NButton, 
      { secondary: true }, 
      {
        icon: () => h(Icon, { name: PopupIcon }),
      onClick: () => {console.log('ttttttt');showDetailTable.value = true; }
      }),
      h(NButton, { secondary: true }, {
        // icon: () => h(Icon, { name: DownloadIcon }),
        onClick: (e) => {console.log(e)}

      }),
      h(NPopselect, {
        options: [
          { label: 'Share', value: 'Share' },
          { label: 'View', value: 'View' }
        ]
      }, {
        default: () => h(NButton, { secondary: true }, {
          icon: () => h(Icon, { name: MenuIcon })
        })
      })
    ])
  }
]
)}
 
const columns =  ref(createCols())

  // Computed
  const processedData = computed(() => {
    return data.value || []
  })
  </script>
  
  <style scoped lang="scss">
  // .statistics-wrapper {
  //   padding: 4px 0;
  //   min-width: 10px;
  // }
  
  // .stacked-bar-container {
  //   display: flex;
  //   height: 10px;
  //   border-radius: 4px;
  //   overflow: hidden;
  // }
  
  // .bar-segment {
  //   height: 100%;
  //   transition: width 0.3s ease;
  //   cursor: pointer;
  
  //   &:hover {
  //     opacity: 0.8;
  //   }
  // }
  
  .donut-wrapper {
  padding: 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px; // 添加固定宽度
  height: 24px; // 添加固定高度
  margin: 0 auto;
}

.donut-chart {
  width: 24px; // 固定宽度
  height: 24px; // 固定高度
  position: relative;
  cursor: pointer;

  &:hover {
    .donut-segment {
      opacity: 0.8;
    }
  }
}

.donut {
  width: 24px; // 固定SVG宽度
  height: 24px; // 固定SVG高度
  transform: rotate(-90deg);
  
  .donut-ring {
    stroke-linecap: round;
  }
  
  .donut-segment {
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
  }
}
  
//   .tooltip {
//     position: absolute;
//     background-color: rgba(0, 0, 0, 0.8);
//     color: white;
//     padding: 4px 8px;
//     border-radius: 4px;
//     font-size: 12px;
//     transform: translateX(-50%);
//     white-space: nowrap;
//     pointer-events: none;
//     z-index: 1000;
  
//     &::after {
//       content: '';
//       position: absolute;
//       top: 100%;
//       left: 50%;
//       transform: translateX(-50%);
//       border-width: 4px;
//       border-style: solid;
//       border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
//     }
  // }
  
  .custom-table :deep(.n-data-table-td) {
    border-right: none;
    text-align: center;
    padding: 4px 4px;
  }
  
  .custom-table :deep(.n-data-table-th) {
    padding: 10px 6px;
    border-right: none;
  }
  
  .custom-table :deep(.n-data-table-th::after) {
    content: '';
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 2px;
    background-color: #ebeef5;
  }
  
  .custom-table :deep(.n-data-table-th[rowspan="2"]:last-child::after) {
    display: none;
  }
  
  .custom-table :deep(.n-data-table-th[rowspan="1"][colspan="4"]) {
    font-weight: bold;
  }
  
  // .actions {
  //   display: flex;
  //   justify-content: flex-end;
  //   gap: 8px;
  // }
  </style>