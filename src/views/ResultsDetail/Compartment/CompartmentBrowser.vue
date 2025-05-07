<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

// 生成随机 1000 x 50 矩阵数据
const generateRandomMatrixData = (rows = 1000, cols = 50) => {
  const data = [];
  const xData = [];
  const yData = [];

  // 填充 Y 轴数据（列）
  for (let j = 0; j < cols; j++) {
    yData.push(`Col ${j}`);
  }

  // 填充 X 轴数据（行）和随机值
  for (let i = 0; i < rows; i++) {
    xData.push(`Row ${i}`);
    for (let j = 0; j < cols; j++) {
      const value = Math.random(); // 随机值在 [0, 1] 范围内
      data.push([j, i, value]); // 注意这里的索引是 [列索引, 行索引, 值]
    }
  }

  return { data, xData, yData };
};

// 生成数据
const { data, xData, yData } = generateRandomMatrixData();

// 初始化图表
const chartRef = ref<HTMLElement | null>(null);

const initChart = () => {
  if (!chartRef.value) return;

  const chart = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      position: 'top',
    },
    xAxis: {
      type: 'category',
      data: yData, // 列数据作为 X 轴
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: xData, // 行数据作为 Y 轴
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      realtime: false,
      inRange: {
        color: [
          '#313695',
          '#4575b4',
          '#74add1',
          '#abd9e9',
          '#e0f3f8',
          '#ffffbf',
          '#fee090',
          '#fdae61',
          '#f46d43',
          '#d73027',
          '#a50026',
        ],
      },
    },
    series: [
      {
        name: 'Heatmap',
        type: 'heatmap',
        data,
        emphasis: {
          itemStyle: {
            borderColor: '#333',
            borderWidth: 1,
          },
        },
        progressive: 1000,
        animation: false,
      },
    ],
  };

  chart.setOption(option);

  // 监听窗口大小调整
  window.addEventListener('resize', chart.resize);

  // 销毁时清理事件
  onBeforeUnmount(() => {
    window.removeEventListener('resize', chart.resize);
    chart.dispose();
  });
};

// 挂载时初始化图表
onMounted(initChart);
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 600px;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>