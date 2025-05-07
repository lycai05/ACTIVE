<template>
    <div class="card p-4 bg-white rounded-lg w-full">
      <!-- Location Info -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold">
          Region {{ data.chrom }}:{{ formatNumber(data.start) }}-{{ formatNumber(data.end) }}
        </h3>
      </div>
      
      <!-- Charts Container -->
      <div class="flex flex-row gap-4">
        <!-- Compartment Distribution -->
        <div ref="donutChart" class="h-64 flex-1"></div>
        
        <!-- Insulation Score -->
        <div ref="boxChart" class="h-64 flex-1"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import * as echarts from 'echarts/core';
  import { 
    PieChart,
    BarChart,
    CustomChart
  } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
  } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  
  // Register ECharts components
  echarts.use([
    PieChart,
    BarChart,
    CustomChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    CanvasRenderer
  ]);
  
  // Props definition
  const props = defineProps({
    data: {
      type: Object,
      required: true,
      validator: (obj) => {
        return [
          'chrom', 'start', 'end',
          'A_compartment', 'B_compartment', 'NA_compartment',
          'IS_lower_bound', 'IS_average', 'IS_higher_bound'
        ].every(key => key in obj);
      }
    }
  });
  
  // Chart references
  const donutChart = ref(null);
  const boxChart = ref(null);
  let donutInstance = null;
  let boxInstance = null;
  
  // Utility functions
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Chart options
  const getDonutOption = computed(() => ({
    title: {
      text: 'Compartment Distribution',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 11
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4
      },
      label: {
        show: false
      },
      data: [
        { 
          value: props.data.A_compartment, 
          name: 'A Compartment',
          itemStyle: { color: '#FF6384' }
        },
        { 
          value: props.data.B_compartment, 
          name: 'B Compartment',
          itemStyle: { color: '#36A2EB' }
        },
        { 
          value: props.data.NA_compartment, 
          name: 'NA Compartment',
          itemStyle: { color: '#FFCE56' }
        }
      ]
    }]
  }));
  
  const getBoxOption = computed(() => ({
    title: {
      text: 'Insulation Score',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `Insulation Score:<br/>
                Average: ${props.data.IS_average.toFixed(2)}<br/>
                Range: ${props.data.IS_lower_bound.toFixed(2)} - ${props.data.IS_higher_bound.toFixed(2)}`;
      }
    },
    grid: {
      left: '15%',
      right: '15%',
      top: '20%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['Insulation Score']
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    series: [
      {
        type: 'custom',
        renderItem: (params, api) => {
          const yValue = api.value(1);
          const high = props.data.IS_higher_bound;
          const low = props.data.IS_lower_bound;
          const avg = props.data.IS_average;
          
          const coordsys = api.coord([0, yValue]);
          const width = api.size([1, 0])[0] * 0.3;
          
          const highPos = api.coord([0, high])[1];
          const lowPos = api.coord([0, low])[1];
          const avgPos = api.coord([0, avg])[1];
          
          return {
            type: 'group',
            children: [
              {
                type: 'rect',
                shape: {
                  x: coordsys[0] - width / 2,
                  y: highPos,
                  width: width,
                  height: lowPos - highPos
                },
                style: {
                  fill: 'rgba(54, 162, 235, 0.3)',
                  stroke: '#36A2EB'
                }
              },
              {
                type: 'line',
                shape: {
                  x1: coordsys[0] - width / 2,
                  y1: avgPos,
                  x2: coordsys[0] + width / 2,
                  y2: avgPos
                },
                style: {
                  stroke: '#36A2EB',
                  lineWidth: 2
                }
              }
            ]
          };
        },
        data: [[0, props.data.IS_average]]
      }
    ]
  }));
  
  // Initialize charts
  const initCharts = () => {
    if (donutChart.value && boxChart.value) {
      donutInstance = echarts.init(donutChart.value);
      boxInstance = echarts.init(boxChart.value);
      
      donutInstance.setOption(getDonutOption.value);
      boxInstance.setOption(getBoxOption.value);
    }
  };
  
  // Handle window resize
  const handleResize = () => {
    donutInstance?.resize();
    boxInstance?.resize();
  };
  
  // Lifecycle hooks
  onMounted(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    donutInstance?.dispose();
    boxInstance?.dispose();
    window.removeEventListener('resize', handleResize);
  });
  
  // Watch for data changes
  watch(() => props.data, () => {
    donutInstance?.setOption(getDonutOption.value);
    boxInstance?.setOption(getBoxOption.value);
  }, { deep: true });
  </script>
  
  <style scoped>
  .card {
    transition: transform 0.2s;
  }
  
  .card:hover {
    transform: translateY(-5px);
  }
  </style>