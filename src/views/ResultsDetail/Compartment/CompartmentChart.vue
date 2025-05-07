<template>
    <n-card :content-style="{ padding: '10px' }" :header-style="{ padding: '10px' }" :segmented="true">
      <template #header>
        <ul>
          <li v-for="(item, index) in headerItems" :key="index" class="flex space-x-3 items-center mb-4">
            <svg class="flex-shrink-0 w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-xl font-light text-gray-500" v-html="item"></p>
          </li>
        </ul>
      </template>
  
      <div class="chart-container">
        <div ref="barChart" class="chart-item"></div>
        <!-- <div class="chart-row" v-for="(chartRefs, index) in chartRows" :key="index">
          <div v-for="(chartRef, i) in chartRefs" :key="i" :ref="chartRef" class="chart-item"></div>
        </div> -->
      </div>
    </n-card>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';
  
  // 组件属性
  const props = defineProps({
    gene_id: {
      type: String,
      required: true,
      default: 'NEAT1',
    },
  });
  
  // Header 文本
  const headerItems = [
    `Rank of all the biosamples by <n-tag>{{ gene_id }}</n-tag> compartmentation E1 values along with metadata`,
    'Please click the button to view color legend',
  ];
  
  // Chart refs
  const barChart = ref<HTMLElement | null>(null);
  const chartRows = [
    ['tissuePositiveChart', 'tissueNegativeChart'],
    ['healthStatusPositiveChart', 'healthStatusNegativeChart'],
    ['biomaterialPositiveChart', 'biomaterialNegativeChart'],
  ].map((row) => row.map((ref) => ref<HTMLElement | null>));
  
  // 颜色配置
  const colors = {
    tissue: [
      { name: 'Skin', value: '#854922' },
      { name: 'Blood', value: '#BD2321' },
      { name: 'Brain', value: '#F6BBA7' },
      { name: 'hESC derived', value: '#543184' },
    ],
    healthStatus: [
      { name: 'Cancer', value: '#074150' },
      { name: 'Non-cancer diseases', value: '#2B7186' },
      { name: 'Healthy', value: '#9CC6D4' },
    ],
    biomaterial: [
      { name: 'Cell line', value: '#543184' },
      { name: 'Primary cell', value: '#7A7200' },
      { name: 'Tissue', value: '#2C58A7' },
    ],
  };
  
  // 生成 1000 条 fake 数据
  const mockData = Array.from({ length: 1000 }, (_, i) => ({
    sample_name: `GSM${1023732 + i}`,
    value: (Math.random() * 2 - 1).toFixed(4), // -1 到 1 的随机数
    tissue: ['Skin', 'Blood', 'Brain', 'hESC derived'][Math.floor(Math.random() * 4)],
    health_status: ['Healthy', 'Cancer', 'Non-cancer diseases'][Math.floor(Math.random() * 3)],
    biomaterial_type: ['Cell Line', 'Primary cell', 'Tissue'][Math.floor(Math.random() * 3)],
  }));
  
  // 初始化 ECharts
  function initEChart(el: HTMLElement) {
    let chart = echarts.getInstanceByDom(el);
    if (!chart) {
      chart = echarts.init(el);
    }
    return chart;
  }
  
  // 数据处理函数
  function calculateProportions(data, key, colors, isPositive) {
    const counts = data.reduce((acc, item) => {
      const category = item[key];
      if ((isPositive && item.value > 0) || (!isPositive && item.value < 0)) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors.find((color) => color.name === name)?.value || '#000000',
    }));
  }
  
  // 图表配置
  function generateBarChartOption(data) {
  // 按 value 值从大到小排序
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return {
    toolbox: { feature: { saveAsImage: {} } },
    tooltip: {
      trigger: 'axis',
      formatter: ({ 0: { data } }) =>
        `Sample: ${data.sample_name}<br/>Value: ${data.value}<br/>Tissue: ${data.tissue}<br/>Health Status: ${data.health_status}`,
    },
    xAxis: {
      type: 'category',
      data: sortedData.map((item) => item.sample_name), // 按排序后的数据生成 x 轴
      axisLabel: { show: false },
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: sortedData, // 按排序后的数据生成 bar
        type: 'bar',
        encode: { x: 'sample_name', y: 'value' },
      },
    ],
    visualMap: {
      show: false,
      dimension: 1,
      pieces: [
        { min: 0, color: '#FBC20A' }, // 正值颜色
        { max: 0, color: '#7172B5' }, // 负值颜色
      ],
    },
  };
}
  
  function generatePieChartOption(data, title) {
    return {
      title: { text: title, left: 'center' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          data: data.map(({ name, value, color }) => ({ name, value, itemStyle: { color } })),
        },
      ],
    };
  }
  
  // 初始化所有图表
  function initCharts() {
    if (!mockData.length) return;
  
    const barChartInstance = initEChart(barChart.value!);
    barChartInstance.setOption(generateBarChartOption(mockData));
  
    // [['tissue', colors.tissue], ['health_status', colors.healthStatus], ['biomaterial_type', colors.biomaterial]].forEach(
    //   ([key, colorConfig], rowIndex) => {
    //     ['Positive', 'Negative'].forEach((type, colIndex) => {
    //       const isPositive = type === 'Positive';
    //       const data = calculateProportions(mockData, key, colorConfig, isPositive);
    //       const chartInstance = initEChart(chartRows[rowIndex][colIndex].value!);
    //       chartInstance.setOption(generatePieChartOption(data, `${key.charAt(0).toUpperCase() + key.slice(1)} (${type})`));
    //     });
    //   }
    // );
  }
  
  // 生命周期钩子
  onMounted(() => {
    initCharts();
    window.addEventListener('resize', () => {
      [barChart.value, ...chartRows.flat()].forEach((chart) => {
        if (chart) echarts.getInstanceByDom(chart)?.resize();
      });
    });
  });
  
  onBeforeUnmount(() => {
    [barChart.value, ...chartRows.flat()].forEach((chart) => {
      if (chart) echarts.getInstanceByDom(chart)?.dispose();
    });
  });
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
  }
  .chart-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  .chart-item {
    flex: 1;
    height: 300px;
  }
  </style>