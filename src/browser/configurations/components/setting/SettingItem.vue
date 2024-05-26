<template>
  <div class="setting-item" :style="{ width: width + 'px' }">
    <slot ></slot>
    <n-text class="name" depth="2">{{ name }}</n-text>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: false
  },
  width: {
    type: Number,
    required: false
  }
})
</script>

<style scoped>
.setting-item {
  display: flex;
  flex-direction: column;
  min-width: 110px;
  text-align: start;
  margin-bottom: 5px;
}

.setting-item .name {
  margin-top: 2px;
}
</style>
