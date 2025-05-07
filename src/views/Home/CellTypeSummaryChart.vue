<template>
  <n-card :content-style="{ padding: '10px' }" :header-style="{ padding: '10px' }" :segmented="true">
    <template #header>
      <n-skeleton text style="width: 50%" v-if="loading" />
      <template v-else>
        <!-- <div class="text-sm">Cell Types</div> -->
        <!-- <n-h3 prefix="bar" align-text>Cell Types</n-h3> -->
        <n-statistic label="Cell Types">
        138
      </n-statistic>
      </template>
    </template>
    <template #header-extra>
      <button type="button" class="cell-type-button text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2"
      @click="$router.push({name: 'Datalist'})"
      >
<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
</svg>
</button>
        </template> 
    <div class="chart-item-container">
      <n-skeleton text v-if="loading" :repeat="4" />
      <template v-else>
        <div ref="channelsChart" class="chart-item"> </div>
      </template>
  
    </div>
  </n-card>
  
</template>

<script lang="ts" setup>
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { dispose } from 'echarts'
import * as echarts from 'echarts'
// import echarts from ''
function useEcharts(dom: HTMLElement, theme?: string) {
  let instance = echarts.getInstanceByDom(dom)
  if (!instance) {
    instance = echarts.init(dom, theme)
  }
  return instance
}

const loading = ref(true)
const channelsChart = ref<HTMLDivElement | null>(null)
const init = () => {
  const option = {
    color: ['#4878D0', '#6C8EAD', '#9FBBD9', '#B3CDE3'], // Define the custom colors for the pie slices
    grid: {
      left: '12%',
      right: '5%',
      top: '5%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: true,
          length: 5,
          length2: 5,
          smooth: true,
        },
        data: [
          { value: 78, name: 'Cancer' },
          { value: 60, name: 'Non-cancer' }
        ],
      },
    ],
  }
  setTimeout(() => {
    loading.value = false
    nextTick(() => {
      useEcharts(channelsChart.value as HTMLDivElement).setOption(option)
    })
  }, 1000)
}
const updateChart = () => {
  useEcharts(channelsChart.value as HTMLDivElement).resize()
}
onMounted(init)
onBeforeUnmount(() => {
  dispose(channelsChart.value as HTMLDivElement)
})

</script>

<style scoped>
.chart-item-container {
  width: 100%;


}
.chart-item {
    height: 180px;
  }


.cell-type-button {
  background-color: #4878D0;

}  
.cell-type-button:hover {
  background-color: #3561A7;
}
</style>
