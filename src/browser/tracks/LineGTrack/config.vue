<template>
    <!-- Echarts 全局设置 -->
    <global-setting :optionData="optionData"></global-setting>
    <CollapseItem v-for="(item, index) in seriesList" :key="index" name="Track options" :expanded="true">
      <SettingItemBox name="Line">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          :show-alpha="false"
          v-model:value="item.lineStyle.color"
        ></n-color-picker>
      </SettingItem>
      <!-- <SettingItem name="Width">
        <n-input-number
            v-model:value="item.lineStyle.width"
            :min="1"
            size="small"
            placeholder="自动计算"
        ></n-input-number>
      </SettingItem> -->
      <!-- <SettingItem name="Type">
        <n-select v-model:value="item.lineStyle.type" size="small" :options="items.lineConf.lineStyle.type"></n-select>
      </SettingItem> -->
    </SettingItemBox>
      <!-- <SettingItemBox name="Area">
        <SettingItem name="Fill">
          <n-color-picker
            size="small"
            :modes="['hex']"
            v-model:value="item.areaStyle.color"
          ></n-color-picker>
        </SettingItem>
        <SettingItem name="Opacity">
          <n-input-number
              v-model:value="item.areaStyle.opacity"
              :min="0"
              :max="1"
              size="small"
          ></n-input-number>
        </SettingItem>
      </SettingItemBox> -->
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
  