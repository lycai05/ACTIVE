<template>
  <div class="track-container">
    <nav-bar-item 
        v-for="(view, index) in props.trackViews" 
        :key="index"
        :location="view"
        :chromSizes="chromSizes"
        :chromNames="chromNames"
        :showTrackLabel="showTrackLabel"
        :showVerticalLine="showVerticalLine"
        :trackViewIndex="index"
        :sessionId="sessionId"
        @shift="(event, direction, index) => $emit('shift', event, direction, index)"
        @zoomIn="(index) => $emit('zoomIn', index)"
        @zoomOut="(index) => $emit('zoomOut', index)"
        @zoomTo="(chrom, start, end, index) => $emit('zoomTo', chrom, start, end, index)"
        @update:showTrackLabel="$emit('update:showTrackLabel', $event)"
        @update:showVerticalLine="$emit('update:showVerticalLine', $event)"
        :style="getStyle(view, index)"
        :class="[
          index !== props.trackViews.length - 1 ? 'mr-[30px]' : ''
        ]"
      >
      </nav-bar-item>
    </div>
  </template>

<script lang="ts" setup>
import NavBarItem from './NavBarItem.vue'

const props = defineProps({
    chromSizes: {
        type: Object,
        required: true
    },
    chromNames: {
        type: Array,
        required: true
    },
    showTrackLabel: {
        type: Boolean,
        required: true
    },
    showVerticalLine: {
        type: Boolean,
        default: true,
        required: true
    },
    trackViews: {
      type: Object,
      required: true
    },
    sessionId: {
      type: String,
      required: true
    }
})

const getStyle = (view, index) => {
const totalLength = props.trackViews.reduce((acc, view) => acc + (view.end - view.start), 0);
const widthRatio = (view.end - view.start) / totalLength * 100;
let margin = '0 0 0 0px';  // Default margin for middle items

// Adjust margin for the first and last items
if (index === 0) {
  margin = '0 0px 0 0';  // Only right margin for the first item
} else if (index === props.trackViews.length - 1) {
  margin = '0 0 0 0px';  // Only left margin for the last item
}

// Merge the computed styles with the props.style
return {
//   ...props.style,
  width: `${widthRatio}%`,
  margin: margin
}
}


defineEmits([
    'shift',
    'zoomIn',
    'zoomOut',
    'zoomTo',
    'update:showTrackLabel',
    'update:showVerticalLine'
])
</script>
<style>
.track-container {
display: flex;
align-items: center;
}
</style>
