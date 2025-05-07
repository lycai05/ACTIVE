<template>
  <!-- Echarts 全局设置 -->
  <global-setting :optionData="optionData"></global-setting>
  <CollapseItem v-for="(item, index) in seriesList" :key="index" name="Track options" :expanded="true">
    <SettingItemBox name="Line">
      <SettingItem name="Color">
        <n-color-picker
          size="small"
          :modes="['rgb']"
          v-model:value="item.lineStyle.color"
        ></n-color-picker>
      </SettingItem>
      <SettingItem name="Width">
        <n-input-number
            v-model:value="item.lineStyle.width"
            :min="1"
            size="small"
        ></n-input-number>
      </SettingItem>
      <!-- <SettingItem name="Type">
        <n-select v-model:value="item.lineStyle.type" size="small" :options="lineConf.lineStyle.type"></n-select>
      </SettingItem> -->
    </SettingItemBox>
    <SettingItemBox name="Anchor">
      <SettingItem name="Fill">
        <n-color-picker
          size="small"
          :modes="['rgb']"
          :show-alpha="false"
          v-model:value="item.itemStyle.color"
        ></n-color-picker>
      </SettingItem>
      <!-- <SettingItem name="Opacity">
        <n-input-number
            v-model:value="item.itemStyle.opacity"
            :min="0"
            :max="1"
            size="small"
        ></n-input-number>
      </SettingItem> -->
    </SettingItemBox>
    <!-- <SettingItemBox name="实心点">
      <SettingItem name="大小">
        <n-input-number
            v-model:value="item.symbolSize"
            :min="1"
            :max="100"
            size="small"
            placeholder="自动计算"
        ></n-input-number>
      </SettingItem>
    </SettingItemBox> -->
    <!-- <setting-item-box name="标签">
      <setting-item>
        <n-space>
          <n-switch v-model:value="item.label.show" size="small" />
          <n-text>展示标签</n-text>
        </n-space>
      </setting-item>
      <setting-item name="大小">
        <n-input-number v-model:value="item.label.fontSize" size="small" :min="1"></n-input-number>
      </setting-item>
      <setting-item name="颜色">
        <n-color-picker size="small" :modes="['hex']" v-model:value="item.label.color"></n-color-picker>
      </setting-item>
      <setting-item name="位置">
        <n-select
            v-model:value="item.label.position"
            :options="[
            { label: 'top', value: 'top' },
            { label: 'left', value: 'left' },
            { label: 'right', value: 'right' },
            { label: 'bottom', value: 'bottom' }
          ]"
        />
      </setting-item>
    </setting-item-box> -->
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
