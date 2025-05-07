<template>
	<div class="table-container">
		<n-table>
			<thead>
				<tr>
					<th>Image</th>
					<th>Species</th>
					<th>Library Count</th>
					<th>Data Types</th>
					<th class="!text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item of list" :key="item.id">
					<td>
						<div class="species-image">
							<n-image :src="item.image" :width="80" :height="80" object-fit="cover" />
						</div>
					</td>
					<td>
						<div class="species flex items-center gap-3">
							<div class="species-info">
								<div class="species-name">
									{{ item.name }}
								</div>
							</div>
						</div>
					</td>
					<td>
						<div class="count">
							<n-tag :type="item.count > 1000 ? 'success' : item.count > 100 ? 'warning' : 'error'">
								n = {{ item.count }}
							</n-tag>
						</div>
					</td>
					<td>
						<div class="data-types-chart">
							<v-chart class="chart" :option="getChartOption(item.dataTypes)" />
						</div>
					</td>
					<td>
						<div class="actions flex items-center justify-end">
							<n-button @click="navigateToSpecies(item.species)">
								Browse
							</n-button>
						</div>
					</td>
				</tr>
			</tbody>
		</n-table>
		<div class="chart-legend">
			<v-chart class="legend-chart" :option="legendOption" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { NTable, NTag, NButton, NImage } from "naive-ui"
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
	CanvasRenderer,
	PieChart,
	TitleComponent,
	TooltipComponent,
	LegendComponent
])

const router = useRouter()

// 定义所有可能的数据类型及其颜色
const dataTypeColors = {
	'Hi-C': '#5470c6',
	'ChIA-PET': '#91cc75',
	'HiChIP': '#fac858',
	'Others': '#ee6666'
}

const list = ref([
	{
		id: 1,
		name: "Human",
		species: "human",
		count: 1800,
		image: "/images/species/human.jpg",
		dataTypes: [
			{ value: 800, name: 'Hi-C' },
			{ value: 500, name: 'ChIA-PET' },
			{ value: 300, name: 'HiChIP' },
			{ value: 200, name: 'Others' }
		]
	},
	{
		id: 2,
		name: "Mouse",
		species: "mouse",
		count: 500,
		image: "/images/species/mouse.jpg",
		dataTypes: [
			{ value: 300, name: 'Hi-C' },
			{ value: 100, name: 'ChIA-PET' },
			{ value: 50, name: 'HiChIP' },
			{ value: 50, name: 'Others' }
		]
	},
	{
		id: 3,
		name: "Monkey",
		species: "monkey",
		count: 3,
		image: "/images/species/monkey.jpg",
		dataTypes: [
			{ value: 2, name: 'Hi-C' },
			{ value: 1, name: 'ChIA-PET' }
		]
	}
])

// 获取所有唯一的数据类型
const allDataTypes = computed(() => {
	const types = new Set<string>()
	list.value.forEach(item => {
		item.dataTypes.forEach(dt => types.add(dt.name))
	})
	return Array.from(types)
})

// 图例配置
const legendOption = {
	legend: {
		orient: 'horizontal',
		right: 0,
		top: 0,
		itemWidth: 12,
		itemHeight: 12,
		textStyle: {
			fontSize: 12
		},
		data: allDataTypes.value
	},
	series: [{
		type: 'pie',
		radius: 0,
		label: { show: false },
		data: allDataTypes.value.map(type => ({
			name: type,
			value: 0,
			itemStyle: { color: dataTypeColors[type as keyof typeof dataTypeColors] }
		}))
	}]
}

const getChartOption = (dataTypes: any[]) => {
	return {
		tooltip: {
			trigger: 'item',
			formatter: '{b}: {c} ({d}%)'
		},
		series: [
			{
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: '#fff',
					borderWidth: 2,
					color: (params: any) => dataTypeColors[params.name as keyof typeof dataTypeColors]
				},
				label: {
					show: false
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '12',
						fontWeight: 'bold'
					}
				},
				labelLine: {
					show: false
				},
				data: dataTypes
			}
		]
	}
}

const navigateToSpecies = (species: string) => {
	router.push(`/browse/${species}`)
}
</script>

<style scoped lang="scss">
.table-container {
	position: relative;
}

.chart-legend {
	margin-top: 20px;
	width: 300px;
	height: 30px;
	margin-left: auto;
	
	.legend-chart {
		width: 100%;
		height: 100%;
	}
}

.species-image {
	.n-image {
		:deep(img) {
			border-radius: 8px;
			object-fit: cover;
		}
	}
}

.species {
	.species-info {
		.species-name {
			font-weight: 500;
			font-size: 16px;
			line-height: 1.2;
		}
	}
}

.data-types-chart {
	width: 200px;
	height: 100px;
	
	.chart {
		width: 100%;
		height: 100%;
	}
}

.direction-rtl {
	.actions {
		justify-content: flex-start;
	}
}
</style>
