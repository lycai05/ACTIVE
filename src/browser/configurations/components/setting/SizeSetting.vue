<template>
  <setting-item-box name="Height">
    <!-- <n-input-number
      v-model:value="chartAttr.w"
      :min="50"
      :disabled="isGroup"
      size="small"
      placeholder="px"
    >
      <template #prefix>
        <n-text depth="3">宽度</n-text>
      </template>
    </n-input-number> -->
    <n-input-number
      v-model:value="chartAttr.h"
      :min="chartAttr.minHeight"
      :max="chartAttr.maxHeight"
      :disabled="isGroup"
      size="small"
      placeholder="px"
    >
      <!-- <template #prefix>
        <n-text depth="3">高度</n-text>
      </template> -->
    </n-input-number>
  </setting-item-box>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
// import { PickCreateComponentType } from '@/packages/index.d'
import SettingItemBox from './SettingItemBox.vue'

const props = defineProps({
  chartAttr: {
    type: Object,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  }
})
</script>
