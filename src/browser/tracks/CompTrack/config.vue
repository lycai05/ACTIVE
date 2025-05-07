<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem v-for="(item, index) in seriesList" :key="index" name="Track options" :expanded="true">
    <SettingItemBox name="Fill color">
      <SettingItem name="Pos fill">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.itemStyle.posColor"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Neg fill">
        <n-color-picker
          size="small"
          :modes="['hex']"
          v-model:value="item.itemStyle.negColor"
        ></n-color-picker>
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
    <SettingItemBox name="Renderer">
      <SettingItem name="">
        <n-select
            v-model:value="props.optionData.renderer"
            default-value="canvas"
            :options="[
            { label: 'canvas', value: 'canvas' },
            { label: 'svg', value: 'svg' }
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
