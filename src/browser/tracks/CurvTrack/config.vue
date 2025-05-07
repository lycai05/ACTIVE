<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem v-for="(item, index) in seriesList" :key="index" name="Track options" :expanded="true">
    <SettingItemBox name="Line">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.lineStyle.color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Width">
        <n-input-number
            v-model:value="item.lineStyle.width"
            :min="1"
            size="small"
            placeholder="自动计算"
        ></n-input-number>
        
      </SettingItem>
      <SettingItem name="Opacity">
        <n-input-number
            v-model:value="item.lineStyle.opacity"
            :min="0"
            :max="1"
            size="small"
            :step="0.1"
        ></n-input-number>
      </SettingItem>
      <!-- <SettingItem name="Type">
        <n-select v-model:value="item.lineStyle.type" size="small" :options="items.lineConf.lineStyle.type"></n-select>
      </SettingItem> -->
    </SettingItemBox>
    <SettingItemBox name="Area">
      <SettingItem name="Fill">
        <n-color-picker
          size="small"
          :modes="['hex']"
          :show-alpha="false"
          v-model:value="item.areaStyle.color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Opacity">
        <n-input-number
            v-model:value="item.areaStyle.opacity"
            :min="0"
            :max="1"
            size="small"
            :step="0.1"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox>
    <SettingItemBox name="yAxis">
      <SettingItem name="Scale">
        <n-select
            v-model:value="props.optionData.yAxis.scale"
            default-value="Auto"
            :options="[
            { label: 'Auto', value: 'auto' },
            { label: 'Fixed', value: 'fixed' }
          ]"
        />
      </SettingItem>
      <SettingItem name="yAxis Max" >
        <n-input-number
            v-model:value="props.optionData.yAxis.max"
            :disabled="props.optionData.yAxis.scale=='auto'"
            size="small"
            :step="0.1"
        ></n-input-number>
      </SettingItem>
      <SettingItem name="yAxis Min">
        <n-input-number
            v-model:value="props.optionData.yAxis.min"
            :disabled="props.optionData.yAxis.scale=='auto'"
            size="small"
            :step="0.1"
        ></n-input-number>
      </SettingItem>
      <!-- <SettingItem name="yAxis Max" >
        <n-input-number
            v-model:value="props.optionData.yAxis.max"
            :min="0"
            :max="10000"
            size="small"
            :step="1"
        ></n-input-number> -->
      <!-- </SettingItem> -->
      <SettingItem name="Log2">
        <n-space>
          <n-switch v-model:value="props.optionData.yAxis.log" size="small" />
        </n-space>
      </SettingItem>
      <SettingItem name="Flip">
        <n-space>
          <n-switch v-model:value="props.optionData.yAxis.flip" size="small" />
        </n-space>
      </SettingItem>
    </SettingItemBox>

    <SettingItemBox name="Data">
      <SettingItem name="Show">
        <n-select
            v-model:value="props.optionData.data.show"
            default-value="both"
            :options="[
            { label: 'Both anchor in the view', value: 'both' },
            { label: 'Either anchor in the view', value: 'one' }
          ]"
        />
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
