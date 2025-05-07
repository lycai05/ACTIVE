<template>
     <div class="flex">
               <div class="w-[30px]  flex-shrink-0 border-r border-black  p-2 before:content-[''] before:absolute before:right-0 before:top-0 before:w-[8px] before:h-[1px] before:bg-black after:content-[''] after:absolute after:right-0 after:bottom-0 after:w-[8px] after:h-[1px] after:bg-black relative">      
      <n-space vertical :size="12" align="center" class="pr-2">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-space vertical :size="4" align="center">
              <n-tag size="small"  class="w-full">
                <n-text depth="3">R</n-text>
              </n-tag>
              <!-- <n-text class="text-[12px]">{{ formatResolution(currentBpResolution) }}</n-text> -->
            </n-space>
          </template>
          <!-- Resolution: {{ formatResolution(currentBpResolution) }} -->
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-space vertical :size="4" align="center">
              <n-tag size="small" class="w-full">
                <n-text depth="1">N</n-text>
              </n-tag>
              <!-- <n-text class="text-[12px]">{{ selectedNormalization }}</n-text> -->
            </n-space>
          </template>
          <!-- Normalization: {{ selectedNormalization }} -->
        </n-tooltip>
      </n-space>
    </div>
    <div class="main-container flex-1" ref="mainContainer">

      <div class="grid-container " :style="gridStyles">
        <template v-for="(label, index) in labels" :key="`${label.i}-${label.j}`">
          <div :class="['content', 'grid-item', { 'diagonal-mirror': label.i !== label.j }]">
  <mrhic-track-item
    v-if="label.j <= label.i"
    :id="label"
    :location="label"
    :option="props.config.option"
    :trackViewIndex="index"
  >
  </mrhic-track-item>
</div>
</template>
      </div>
    </div>
</div>
  </template>
  
  <script setup>
  import { computed, ref, watch } from 'vue';
  import { defineProps } from 'vue'
  import MrhicTrackItem from './MrhicTrackItem.vue'
  import { useElementSize } from '@vueuse/core'

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
  const mainContainer = ref(null);

  const { width }  = useElementSize(mainContainer)
  
  const gridSize = ref(props.trackViews.length);
  
  watch(()=>props.trackViews, ()=>{
    gridSize.value = props.trackViews.length
  },{immediate: true, deep: true})
  
  const labels = computed(() => {
  const labels = [];
  for (let i = gridSize.value - 1; i >= 0; i--) {
    for (let j = 0; j < gridSize.value; j++) {
      // 只跳过对角线右下方的项（不包括对角线）
      //if (j > i) continue;
      
      const label = {
        chrom: props.trackViews[j].chrom,
        start: props.trackViews[j].start,
        end: props.trackViews[j].end,
        chrom2: props.trackViews[i].chrom,
        start2: props.trackViews[i].start,
        end2: props.trackViews[i].end,
        i,
        j
      };
      labels.push(label);
    }
  }
  // console.log(labels)
  return labels;
});

  
  const containerHeight = computed(() => {
    return width.value / Math.sqrt(2);
  });

  const GAP = 30 
  
  const gridStyles = computed(() => {
    const columnWidths = props.trackViews.map(loc => loc.end - loc.start);
    const rowHeights = props.trackViews.map(loc => loc.end - loc.start);
    
    return {
      display: 'grid',
      gap: GAP + 'px',
      width: '100%',
      aspectRatio: '1 / 1',
      transform: 'translate(0, 50%) rotate(45deg) scale(0.705)',
      transformOrigin: 'center center',
      position: 'absolute',
      bottom: '0',
      gridTemplateColumns: columnWidths.map(width => `${width}fr`).join(' '),
      gridTemplateRows: rowHeights.map(height => `${height}fr`).reverse().join(' '),
    };
  });
  
  </script>
  
  <style scoped>
  .main-container {
    width: 100%;
    height: calc(100vw /2); /* 1.4142 ≈ √2 */
    max-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
  }
  
  .grid-item {
    border: 0.1px solid #E5E7EB;
    padding: 0px;
    text-align: center;
  }
  </style>