<template>
  <setting-item-box name="Title" :alone="true">
    <n-input
      type="text"
      maxlength="12"
      minlength="1"
      placeholder="Please enter a track name"
      size="small"
      clearable
      v-model:value="trackConfig.name"
      @focus="handleFocus"
      @blur="handleBlur"
    ></n-input>
  </setting-item-box>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import SettingItemBox from './SettingItemBox.vue'
// import { ConfigType } from '@/packages/index.d'

const props = defineProps({
  trackConfig: {
    type: Object,
    required: true
  },
})

let valueCatch = ''

const handleFocus = () => {
  valueCatch = props.trackConfig.name
}

const handleBlur = () => {
  if(!props.trackConfig.name.length) {
    window['$message'].warning('请输入至少一个字符!')
    props.trackConfig.name = valueCatch 
  }
}
</script>
