<template>


  <collapse-item v-if="yAxis.enable" name="Y axis" :expanded="true">
    <template #header>
      <n-switch v-model:value="yAxis.show" size="small"></n-switch>
    </template>

      <setting-item name="颜色">
        <n-color-picker size="small" v-model:value="yAxis.nameTextStyle.color"></n-color-picker>
      </setting-item>
      <setting-item name="大小">
        <n-input-number v-model:value="yAxis.nameTextStyle.fontSize" :min="8" size="small"></n-input-number>
      </setting-item>
      <setting-item name="偏移量">
        <n-input-number v-model:value="yAxis.nameGap" :min="5" size="small"></n-input-number>
      </setting-item>
  </collapse-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// import { GlobalThemeJsonType } from '@/settings/chartThemes/index'
// import { axisConfig } from '@/packages/chartConfiguration/echarts/index'
// import { CollapseItem, SettingItemBox, SettingItem, GlobalSettingPosition } from '@/components/Pages/ChartItemSetting'
// import { icon } from '@/plugins'
// import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
// import EchartsRendererSetting from './EchartsRendererSetting.vue'

// const { HelpOutlineIcon } = icon.ionicons5
import CollapseItem  from './CollapseItem.vue'
import SettingItemBox from './SettingItemBox.vue'
import SettingItem from './SettingItemBox.vue'

const props = defineProps({
  optionData: {
    // type: Object as PropType<GlobalThemeJsonType>,
    type: Object,
    required: true
  },
  // inChart: {
  //   type: Boolean,
  //   required: false,
  //   default: false
  // }
})

// const chartEditStore = useChartEditStore()
// const themeSetting = computed(() => {
//   const chartThemeSetting = chartEditStore.getEditCanvasConfig.chartThemeSetting
//   return chartThemeSetting
// })

const title = computed(() => {
  return props.optionData.title
})

// const xAxis = computed(() => {
//   return props.optionData.xAxis
// })

const yAxis = computed(() => {
  return props.optionData.yAxis
})

const visibilityWindow = computed(() => {
  return props.optionData.visibilityWindow || 0
})

// const legend = computed(() => {
//   return props.optionData.legend
// })

// const grid = computed(() => {
//   return props.optionData.grid
// })

// const visualMap = computed(() => {
//   return props.optionData.visualMap
// })
</script>
