<!-- DonutChart.vue -->
<template>
  <n-card :bordered="true">
    <n-skeleton text v-if="loading" :repeat="4" />
    <template v-else>
      <div ref="chartRef" class="chart-item"></div>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { NCard, NSkeleton } from 'naive-ui'
import * as echarts from 'echarts'
import type { EChartsInstance } from 'echarts'

interface Props {
  title: string
  value: number
  loading?: boolean
  color?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  color: '#4878D0',
  height: 180
})

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<EChartsInstance | null>(null)
const loading = ref(props.loading)

// 格式化标题
const formatTitle = (title: string) => {
  return title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// 生成图表配置
const generateChartOption = (title: string, value: number, color: string) => {
  return {
    title: {
      text: formatTitle(title),
      left: 'center',
      top: '-5'
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    color: [color, '#E5E5E5'],
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value.toFixed(2)}%`
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '60%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{d}%',
          position: 'outside'
        },
        labelLine: {
          show: true,
          length: 5,
          length2: 5,
          smooth: true,
        },
        data: [
          { value: value * 100, name: 'Present' },
          { value: (1 - value) * 100, name: 'Absent' }
        ]
      }
    ]
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance.value = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return

  const option = generateChartOption(props.title, props.value, props.color)
  chartInstance.value.setOption(option)
}

// 调整图表大小
const resizeChart = () => {
  chartInstance.value?.resize()
}


// 监听属性变化
watch(() => props.value, () => {
  nextTick(updateChart)
})

watch(() => props.loading, (newVal) => {
  loading.value = newVal
})

// 生命周期钩子
onMounted(() => {
  setTimeout(() => {
    loading.value = false
    nextTick(() => {
      initChart()
      window.addEventListener('resize', resizeChart)
    })
  }, 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})
</script>

<style scoped>
.chart-item {
  height: v-bind('props.height + "px"');
}
</style>