<script setup lang="ts">
import { ref } from 'vue'
import HumanBodyMap from './HumanBodyMap.vue';

const selectedOrgans = ref(['Heart', 'Brain'])

const handleOrganClick = (organName) => {
  console.log('Clicked organ:', organName)
  // 在这里处理器官点击事件
  // 例如：可以更新选中的器官列表
  // selectedOrgans.value = [organName]
}

</script>

<template>
    <HumanBodyMap
    :highlighted-organs="selectedOrgans"
      @organ-click="handleOrganClick"
    ></HumanBodyMap>
</template>