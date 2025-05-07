<template>
    <!-- <div class="visualization-container">
      <div class="body-map">
        <human-body-map 
          :highlightedOrgans="highlightedOrgans"
          @organClick="handleOrganClick"
        />
      </div>
      <div class="heatmap">
        <heat-map 
          :customRows="orderedTissues"
          :customColumns="columns"
          :customColorMap="colorMap"
          @rowLabelClick="handleRowLabelClick" 
        />
      </div>
    </div> -->
    <div v-for="(value, key) in portions" :key="key" class="donut-plot-item">
        <DonutChart
          :title="key"
          :value="value"
          :color="getColorForType(key)"
        />
      </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  // import HumanBodyMap from './HumanBodyMap.vue'
  // import HeatMap from './HeatmapHalfCircle.vue'
  import DonutChart from './DonutChart.vue'

const props = defineProps(
  ['data']
)

const getColorForType = (type) => {
  const colorMap  = {
    a_compartment: '#4878D0',
    contact_domains: '#6C8EAD',
    loops: '#9FBBD9',
    enhancer: '#B3CDE3'
  }
  return colorMap[type] || '#4878D0'
}

const portions = computed(() => {
  console.log(props.data)
  return props.data?.data.summary.portions || {}
})

  </script>
  
  <style scoped>
  .visualization-container {
    display: flex;
    align-items: flex-start;
    /* /* gap: 20px; */
    padding-left: 110px; 
    /* height: 1000px */
    margin: 0px auto
  }
  
  .body-map {
    /* flex: 0 0 auto; */
    margin-top: 40px;
    margin-right: 10px;
    width: 120px;
  }
  
  .heatmap {
    /* flex: 1; */
    /* height: 800px;  */
  }
  </style>