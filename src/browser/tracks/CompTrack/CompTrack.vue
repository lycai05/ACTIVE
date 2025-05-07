<!-- <template>
    <comp-track-item
    :location="props.location"
    :option="props.config.option"
    @zoomTo="handleZoomTo"
    >
    </comp-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import CompTrackItem from './CompTrackItem.vue'

const props = defineProps({
    config: {
        type: Object,
        required: true
    },
    trackViews: {
        type: Object,
        required: true
    }
})
const emit = defineEmits(['zoomTo'])

const handleZoomTo = (chrom, start, end) => {
  emit('zoomTo', chrom, start, end)
}
</script> -->


<template>
  <div class="track-container">
    <comp-track-item v-for="(view, index) in props.trackViews" :key="index" :location="view"
      :option="props.config.option" :style="getTrackViewStyle(view, index, props.trackViews, props.style)" 
      :trackViewIndex="index"
      @zoom-to="handleZoomTo"
      />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import CompTrackItem from './CompTrackItem.vue'
import { getTrackViewStyle } from '../utils/trackViewUtils'
import type { TrackView } from '../utils/trackViewUtils'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  trackViews: {
    type: Array as () => TrackView[],
    required: true
  },
  style: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const emit = defineEmits(['zoomTo'])

const handleZoomTo = (chrom: string, start: number, end: number, activeTrackViewIndex: number) => {
  emit('zoomTo', chrom, start, end, activeTrackViewIndex)
}
</script>

<style scoped>
.track-container {
  display: flex;
  align-items: center;
}
</style>