<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem v-for="(item, index) in seriesList" :key="index" name="Track options" :expanded="true">
    <SettingItemBox name="Fill color">
      <SettingItem name="Pos fill">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.itemStyle.positiveE1Color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Neg fill">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.itemStyle.negativeE1Color"
        ></n-color-picker>
      </SettingItem>
    </SettingItemBox>
  </CollapseItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GlobalSetting from '../../configurations/components/setting/GlobalSetting.vue'
import CollapseItem from '../../configurations/components/setting/CollapseItem.vue'
import SettingItemBox from '../../configurations/components/setting/SettingItemBox.vue'
import SettingItem from '../../configurations/components/setting/SettingItem.vue'

const props = defineProps({
  optionData: {
    type: Object,
    required: true
  }
})

const seriesList = computed(() => {
  return props.optionData.series
})
</script>
