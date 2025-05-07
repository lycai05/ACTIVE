<template>
  <div>
    <!-- Common setting -->
    <!-- <name-setting :trackConfig="targetData.trackConfig"></name-setting> -->

    <size-setting :isGroup="targetData.isGroup" :chartAttr="targetData.attr"></size-setting>

    <!-- Custom setting -->
    <!-- <component :is="targetData.trackConfig.conKey" :optionData="targetData.option"></component> -->
    <DynamicComponent 
          :componentKey="targetData.trackConfig.conKey"
      :props="{
        optionData: targetData.option,
      }"
      ></DynamicComponent>
  </div>
</template>
  
<script setup lang="ts">
import NameSetting from './NameSetting.vue'
import SizeSetting from './SizeSetting.vue';
import { computed, ref } from 'vue'
import type { CreateTrackType } from '../../../elements'
import { useTrackStore } from '../../../store/TrackStore/TrackStore';
import DynamicComponent from '../../../elements/DynamicComponent.vue'

// 获取当前对象数据
 const useTargetData = () => {
  const trackStore = useTrackStore()
  const targetData: ref<CreateTrackType> = computed(() => {
    // const list = trackStore.getTrackList
    // const targetIndex = trackStore.fetchTargetIndex()
    // return list[targetIndex]
    //console.log(trackStore.getTargetTrackInstance)
    return trackStore.getTargetTrackInstance
  })
  return { targetData, trackStore }
}

const { targetData, trackStore } = useTargetData()

</script>
  
<style lang="scss" scoped></style>
