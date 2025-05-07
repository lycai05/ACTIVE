<template>
  <div class="go-chart-configurations-setting" v-if="targetData">
    <!-- 名称 -->
    <name-setting :trackConfig="targetData.trackConfig"></name-setting>
    <!-- 尺寸 -->
    <size-setting :isGroup="targetData.isGroup" :chartAttr="targetData.attr"></size-setting>
    <!-- 位置 -->
    <!-- <position-setting :chartAttr="targetData.attr" :canvasConfig="trackStore.getEditCanvasConfig" /> -->
    <!-- 滤镜 -->
    <!-- <styles-setting :isGroup="targetData.isGroup" :chartStyles="targetData.styles"></styles-setting> -->
    <!-- 自定义配置项 -->
    <component :is="targetData.chartConfig.conKey" :optionData="targetData.option"></component>
  </div>
</template>

<script setup lang="ts">
// import { NameSetting, PositionSetting, SizeSetting, StylesSetting } from '.'
import NameSetting from './NameSetting.vue';
import PositionSetting from './PositionSetting.vue';
import SizeSetting from './SizeSetting.vue';
import StylesSetting from './StylesSetting.vue';
import { useTargetData } from '../../../../hooks/useTargetData'
const { targetData, trackStore } = useTargetData()
</script>

<style lang="scss" scoped>
//@include go('chart-configurations-setting') {
//}
</style>
