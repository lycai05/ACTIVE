<template>
	<n-table>
	  <thead>
		<tr>
		  <th>Chromosome</th>
		  <th>Start</th>
		  <th>End</th>
		  <th>Compartment</th>
		  <th>Domain</th>
		  <th>Stripes</th>
		  <th>Hi-C Loops</th>
		  <th>HiChIP Loops</th>
		  <th v-if="showActions" class="!text-right">Actions</th>
		</tr>
	  </thead>
	  <tbody>
		<tr v-for="item of processedData" :key="item.line_number">
		  <td>{{ item.bed_region.chrom }}</td>
		  <td>{{ item.bed_region.start }}</td>
		  <td>{{ item.bed_region.end }}</td>
		  <!-- Compartment Bar -->
		  <td>
			<div class="statistics-wrapper relative">
			  <div class="stacked-bar-container w-24">
				<div 
				  v-for="(type, index) in ['A', 'B', 'NA']"
				  :key="index"
				  class="bar-segment" 
				  :class="getCompartmentColor(type)"
				  :style="getSegmentStyle(item.statistics[`${type}_count`], getTotalCount(item.statistics))"
				  @mouseenter="showTooltip(item.line_number, type, item.statistics[`${type}_count`], $event, 'compartment')"
				  @mouseleave="hideTooltip(item.line_number, 'compartment')"
				  @click="showCompartmentDetails(item)"
				  ></div>
			  </div>
			  <div 
				v-if="tooltips[item.line_number]?.compartment?.visible" 
				class="tooltip"
				:style="tooltips[item.line_number]?.compartment?.style"
			  >
				{{ tooltips[item.line_number]?.compartment?.content }}
			  </div>
			</div>
		  </td>
		  <!-- Domain Bar -->
		  <td>
			<div class="statistics-wrapper relative">
			  <div class="stacked-bar-container w-24">
				<div 
				  v-for="(type, index) in ['A', 'B', 'NA']"
				  :key="index"
				  class="bar-segment" 
				  :class="getCompartmentColor(type)"
				  :style="getSegmentStyle(item.statistics[`${type}_count`], getTotalCount(item.statistics))"
				  @mouseenter="showTooltip(item.line_number, type, item.statistics[`${type}_count`], $event, 'compartment')"
				  @mouseleave="hideTooltip(item.line_number, 'compartment')"
				></div>
			  </div>
			  <div 
				v-if="tooltips[item.line_number]?.compartment?.visible" 
				class="tooltip"
				:style="tooltips[item.line_number]?.compartment?.style"
			  >
				{{ tooltips[item.line_number]?.compartment?.content }}
			  </div>
			</div>
		  </td>
		  <!-- Stripes Donut -->
		  <td>
			<div class="donut-wrapper relative">
			  <div class="donut-chart">
				<svg viewBox="0 0 40 40" class="donut">
				  <circle 
					class="donut-ring"
					cx="20" 
					cy="20" 
					r="15.91549430918954" 
					fill="transparent" 
					stroke="#e6e6e6"
					stroke-width="4"
				  />
				  <circle 
					class="donut-segment"
					cx="20" 
					cy="20" 
					r="15.91549430918954" 
					fill="transparent" 
					:stroke="'#673AB7'"
					stroke-width="4"
					:stroke-dasharray="`${getDonutPercentage(item.statistics)} ${100 - getDonutPercentage(item.statistics)}`"
					stroke-dashoffset="25"
					@mouseenter="showDonutTooltip(item.line_number, item.statistics, $event, 'stripes')"
					@mouseleave="hideTooltip(item.line_number, 'stripes')"
				  />
				</svg>
			  </div>
			  <div 
				v-if="tooltips[item.line_number]?.stripes?.visible" 
				class="tooltip"
				:style="tooltips[item.line_number]?.stripes?.style"
			  >
				{{ tooltips[item.line_number]?.stripes?.content }}
			  </div>
			</div>
		  </td>
		  <!-- Hi-C Loops Donut -->
		  <td>
			<div class="donut-wrapper relative">
			  <div class="donut-chart">
				<svg viewBox="0 0 40 40" class="donut">
				  <circle 
					class="donut-ring"
					cx="20" 
					cy="20" 
					r="15.91549430918954" 
					fill="transparent" 
					stroke="#e6e6e6"
					stroke-width="4"
				  />
				  <circle 
					class="donut-segment"
					cx="20" 
					cy="20" 
					r="15.91549430918954" 
					fill="transparent" 
					:stroke="'#673AB7'"
					stroke-width="4"
					:stroke-dasharray="`${getDonutPercentage(item.statistics)} ${100 - getDonutPercentage(item.statistics)}`"
					stroke-dashoffset="25"
					@mouseenter="showDonutTooltip(item.line_number, item.statistics, $event, 'hic')"
					@mouseleave="hideTooltip(item.line_number, 'hic')"
				  />
				</svg>
			  </div>
			  <div 
				v-if="tooltips[item.line_number]?.hic?.visible" 
				class="tooltip"
				:style="tooltips[item.line_number]?.hic?.style"
			  >
				{{ tooltips[item.line_number]?.hic?.content }}
			  </div>
			</div>
		  </td>
		  <!-- HiChIP Loops Donut -->
		  <td>
			<div class="donut-wrapper relative">
			  <div class="donut-chart">
				<svg viewBox="0 0 40 40" class="donut">
				  <circle 
					class="donut-ring"
					cx="20" 
					cy="20" 
					r="15.91549430918954" 
					fill="transparent" 
					stroke="#e6e6e6"
					stroke-width="4"
				  />
				  <circle 
					class="donut-segment"
					cx="20" 
					cy="20" 
					r="15.91549430918954" 
					fill="transparent" 
					:stroke="'#673AB7'"
					stroke-width="4"
					:stroke-dasharray="`${getDonutPercentage(item.statistics)} ${100 - getDonutPercentage(item.statistics)}`"
					stroke-dashoffset="25"
					@mouseenter="showDonutTooltip(item.line_number, item.statistics, $event, 'hichip')"
					@mouseleave="hideTooltip(item.line_number, 'hichip')"
				  />
				</svg>
			  </div>
			  <div 
				v-if="tooltips[item.line_number]?.hichip?.visible" 
				class="tooltip"
				:style="tooltips[item.line_number]?.hichip?.style"
			  >
				{{ tooltips[item.line_number]?.hichip?.content }}
			  </div>
			</div>
		  </td>
		  <!-- Actions -->
		  <td v-if="showActions">
			<div class="actions flex items-center justify-end gap-2">
			  <n-button secondary>
				<template #icon>
				  <Icon :name="DeleteIcon" />
				</template>
			  </n-button>
			  <n-button secondary>
				<template #icon>
				  <Icon :name="DownloadIcon" />
				</template>
			  </n-button>
			  <n-popselect
				:options="[
				  { label: 'Share', value: 'Share' },
				  { label: 'View', value: 'View' }
				]"
			  >
				<n-button secondary>
				  <template #icon>
					<Icon :name="MenuIcon" />
				  </template>
				</n-button>
			  </n-popselect>
			</div>
		  </td>
		</tr>
	  </tbody>
	</n-table>

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
  import { NTable, NButton, NPopselect } from "naive-ui"
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
  
  // Constants
  const DeleteIcon = "carbon:delete"
  const MenuIcon = "carbon:overflow-menu-vertical"
  const DownloadIcon = "carbon:cloud-download"
  
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
  
  const { showActions, data } = toRefs(props)
  
  const showModal = ref(false)
  const CloseIcon = "carbon:close"
const selectedItem = ref(null)

const showCompartmentDetails = (item) => {
  selectedItem.value = item
  showModal.value = true
}
  // State
  const tooltips: TooltipState = reactive({})
  
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
  
  const processedData = computed(() => {
	return data.value || []
  })
  </script>
  
  <style scoped lang="scss">
  .statistics-wrapper {
	padding: 4px 0;
	min-width: 20px;
  }
  
  .stacked-bar-container {
	display: flex;
	height: 10px;
	border-radius: 4px;
	overflow: hidden;
  }
  
  .bar-segment {
	height: 100%;
	transition: width 0.3s ease;
	cursor: pointer;
  
	&:hover {
	  opacity: 0.8;
	}
  }
  
  .donut-wrapper {
	padding: 4px 0;
	display: flex;
	justify-content: center;
	align-items: center;
  }
  
  .donut-chart {
	width: 24px;
	height: 24px;
	position: relative;
	cursor: pointer;
  
	&:hover {
	  .donut-segment {
		opacity: 0.8;
	  }
	}
  }
  
  .donut {
	width: 100%;
	height: 100%;
	transform: rotate(-90deg);
	
	.donut-ring {
	  stroke-linecap: round;
	}
	
	.donut-segment {
	  stroke-linecap: round;
	  transition: stroke-dasharray 0.3s ease;
	}
  }
  
  .tooltip {
	position: absolute;
	background-color: rgba(0, 0, 0, 0.8);
	color: white;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	transform: translateX(-50%);
	white-space: nowrap;
	pointer-events: none;
	z-index: 1000;
  
	&::after {
	  content: '';
	  position: absolute;
	  top: 100%;
	  left: 50%;
	  transform: translateX(-50%);
	  border-width: 4px;
	  border-style: solid;
	  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
	}
  }
  
  .actions {
	text-align: right;
  }
  
  .direction-rtl {
	.actions {
	  justify-content: flex-start;
	}
  }
  </style>