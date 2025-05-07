<template>
    <div ref="chartContainer" :style="{ width: width + 'px', height: height + 'px', position: 'absolute', left: '0', bottom: '0', zIndex: 50 }"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  import * as echarts from 'echarts/core';
  import { GridComponent } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  
  echarts.use([GridComponent, CanvasRenderer]);
  
  const props = defineProps({
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    show: {
      type: Boolean,
      default: true
    }
  });
  
  const chartContainer = ref(null);
  let chart = null;
  
  const initChart = () => {
    if (chart) {
      chart.dispose();
    }
  
    chart = echarts.init(chartContainer.value);
    
    const option = {
      animation: false,
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: props.width,
        show: false
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: props.height,
        show: false
      },
      tooltip: {
        show: false
      },
      axisPointer: {
        show: true,
        type: 'line',
        lineStyle: {
          type: 'solid',
          width: 2,
          color: 'blue'
        },
        snap: false
      },
      series: []
    };
  
    chart.setOption(option);
  
    if (props.show) {
      chart.getZr().on('mousemove', (params) => {
        chart.setOption({
          axisPointer: {
            show: true,
            value: params.offsetX,
            axis: 'x'
          }
        });
      });
  
      chart.getZr().on('globalout', () => {
        chart.setOption({
          axisPointer: {
            show: false
          }
        });
      });
    }
  };
  
  watch(() => [props.width, props.height, props.show], () => {
    if (chart) {
      chart.resize();
      initChart();
    }
  });
  
  onMounted(() => {
    initChart();
  });
  
  onUnmounted(() => {
    if (chart) {
      chart.dispose();
      chart = null;
    }
  });
  </script>