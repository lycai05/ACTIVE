<template>
  <div class="track-container">
    <gene-track-item v-for="(view, index) in props.trackViews" :key="index" :location="view"
      :option="props.config.option" :style="getStyle(view, index)" 
      :trackViewIndex="index"
      @zoom-to="handleZoomTo"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import GeneTrackItem from './GeneTrackItem.vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  trackViews: {
    type: Object,
    required: true
  },
  style: {
    type: Object,
    required: false
  }
})

const getStyle = (view, index) => {
  const totalLength = props.trackViews.reduce((acc, view) => acc + (view.end - view.start), 0);
  const widthRatio = (view.end - view.start) / totalLength * 100;
  let margin = '0 0px';  // Default margin for middle items

  // Adjust margin for the first and last items
  if (index === 0) {
    margin = '0 0px 0 0';  // Only right margin for the first item
  } else if (index === props.trackViews.length - 1) {
    margin = '0 0 0 0px';  // Only left margin for the last item
  }

  // Merge the computed styles with the props.style
  return {
    ...props.style,
    width: `${widthRatio}%`,
    margin: margin
  }
}

const emit = defineEmits(['zoomTo'])

const handleZoomTo = (chrom, start, end, activeTrackViewIndex) => {
  emit('zoomTo', chrom, start, end, activeTrackViewIndex)
}
</script>

<style scoped>
.track-container {
  display: flex;
  align-items: center;
}
</style>
