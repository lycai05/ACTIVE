<template>
  <div class="config-item-box">
    <n-text class="item-left" depth="1" strong>
      {{ name }}
      <n-space :size="3">
        <slot name="name"></slot>
      </n-space>
    </n-text>
    <div
      class="item-right"
      :style="{
        gridTemplateColumns: alone ? '1fr' : '1fr',
        ...itemRightStyle
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: false
  },
  alone: {
    type: Boolean,
    default: false,
    required: false
  },
  itemRightStyle: {
    type: Object,
    default: () => {},
    required: false
  }
})
</script>

<style scoped>
.config-item-box {
  position: relative;
  display: flex;
  margin: 10px 0;
}

.config-item-box .item-left {
  width: 90px;
  text-align: left;
  margin-top: 4px;
  margin-left: 10px;
  font-size: 14px;
}

.config-item-box .item-right {
  display: grid;
  grid-column-gap: 10px;
  width: calc(100% - 60px);
}
</style>
