<template>
  <div class="track-container">
    <comp-track-item v-for="(loc, index) in props.location" :key="index" :location="loc.initPos"
      :option="props.config.option" :style="getStyle(loc.initPos, index)" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import CompTrackItem from './CompTrackItem.vue'

const props = defineProps({
config: {
  type: Object,
  required: true
},
location: {
  type: Array,
  required: true
},
style: {
  type: Object,
  required: false
}
})

console.log(props.config)
const getStyle = (loc, index) => {
const totalLength = props.location.reduce((acc, item) => acc + (item.initPos.end - item.initPos.start), 0);
const widthRatio = (loc.end - loc.start) / totalLength * 100;
let margin = '0 15px';  // Default margin for middle items

// Adjust margin for the first and last items
if (index === 0) {
  margin = '0 15px 0 0';  // Only right margin for the first item
} else if (index === props.location.length - 1) {
  margin = '0 0 0 15px';  // Only left margin for the last item
}

// Merge the computed styles with the props.style
return {
  ...props.style,
  width: `${widthRatio}%`,
  margin: margin
}
}
</script>

<style scoped>
.track-container {
display: flex;
align-items: center;
}
</style>