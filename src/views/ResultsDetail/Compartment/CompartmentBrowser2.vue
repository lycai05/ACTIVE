<template>
    <div class="chart-container">
      <div ref="chartRef" class="chart"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';
  
  // 生成 1000 条线，每条线有 100 个数据点
  const generateFakeData = (lines = 1000, points = 100) =>
    Array.from({ length: lines }, (_, lineIndex) => ({
      name: `Line ${lineIndex + 1}`,
      data: Array.from({ length: points }, (_, pointIndex) =>
        Math.floor(Math.random() * 500) // 随机生成 0~500 的数据点
      ),
    }));
  
  const fakeData = generateFakeData();
  
  // 图表初始化
  const chartRef = ref<HTMLElement | null>(null);
  
  const initChart = () => {
    if (!chartRef.value) return;
  
    const chart = echarts.init(chartRef.value);
  
    const option = {
      title: {
        text: '1000 Lines with 100 Points Each',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        type: 'scroll', // 当 legend 太多时可以滚动显示
        data: fakeData.map((line) => line.name),
        left: 'left',
        top: 'top',
        orient: 'vertical', // 垂直排列
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Array.from({ length: 100 }, (_, i) => `Point ${i + 1}`), // x 轴数据点
      },
      yAxis: {
        type: 'value',
      },
      series: fakeData.map((line, index) => ({
        name: line.name,
        type: 'line',
        smooth: true, // 平滑线条
        symbol: 'none', // 不显示点
        lineStyle: {
          width: 1, // 线条宽度
        },
        areaStyle: {
          opacity: 0.3, // 区域图透明度
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `hsl(${(index * 360) / fakeData.length}, 70%, 50%)` },
            { offset: 1, color: `hsl(${(index * 360) / fakeData.length}, 70%, 70%)` },
          ]),
        },
        data: line.data,
      })),
    };
  
    chart.setOption(option);
  
    // 监听窗口大小变化，自动调整图表大小
    window.addEventListener('resize', chart.resize);
  
    // 销毁图表时清除事件监听
    onBeforeUnmount(() => {
      window.removeEventListener('resize', chart.resize);
      chart.dispose();
    });
  };
  
  // 在组件挂载后初始化图表
  onMounted(initChart);
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: 100%;
  }
  .chart {
    width: 100%;
    height: 600px;
  }
  </style>