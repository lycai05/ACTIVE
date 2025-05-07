<template>
  <div class="flex">
    <div ref="canvasContainer" class="relative flex-1">
      <!-- 添加trackViews的可视化 -->
      <div class="absolute inset-0 flex">
        <div v-for="(view, index) in props.trackViews" 
             :key="index"
             class="border border-gray-200"
             :style="{
                'margin-left': '30px',
                left: `${calculatePosition(view, index)}px`,
                width: `${calculateWidth(view)}px`,
                height: '100%',
                top: '0'
             }">
        </div>
      </div>

      <mcls-track-item 
          :location="locationProps" 
          :option="props.config.option" 
          :style="props.style"
          :processedData="mergedData"
          :trackViewIndex="0"
          @zoom-to="handleZoomTo">
      </mcls-track-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import MclsTrackItem from './MclsTrackItem.vue';
import { useElementSize } from '@vueuse/core';
import { TabixIndexedFile } from '@gmod/tabix';
import { RemoteFile } from 'generic-filehandle';

interface Location {
  chrom: string;
  start: number;
  end: number;
}

interface MclsData {
  chrom: string;
  start: number;
  end: number;
  id: string;
  row?: number;
  // Additional properties for processed data
  adjustedStart?: number;
  adjustedEnd?: number;
  rawChrom?: string;
  rawStart?: number;
  rawEnd?: number;
}

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  trackViews: {
    type: Array as () => Location[],
    required: true
  },
  style: {
    type: Object,
    required: false,
    default: () => ({})
  }
});

const emit = defineEmits(['zoomTo']);

const canvasContainer = ref<HTMLElement | null>(null);
const mergedData = ref<MclsData[]>([]);
const locationProps = ref({
  chrom: 'chr',
  start: 1,
  end: 0
});

const { width } = useElementSize(canvasContainer);

// Calculate position for trackViews visualization
const calculatePosition = (view: Location, index: number): number => {
  let position = 0;
  for (let i = 0; i < index; i++) {
    position += props.trackViews[i].end - props.trackViews[i].start;
  }
  return position * (width.value / locationProps.value.end);
};

// Calculate width for trackViews visualization
const calculateWidth = (view: Location): number => {
  const viewWidth = view.end - view.start;
  return viewWidth * (width.value / locationProps.value.end);
};

// View gap constant
const VIEWGAP = 30;

// Convert genomic position to screen position
function convertGenomicPosition(position: number, chrom: string, trackViews: Location[], viewGap: number, alpha: number): number {
  let convertedPosition = position;
  let cumulativeSpan = 0;

  for (let i = 0; i < trackViews.length; i++) {
    const region = trackViews[i];
    
    if (i === 0) {
      cumulativeSpan = viewGap / alpha;
    } else {
      cumulativeSpan += trackViews[i - 1].end - trackViews[i - 1].start + viewGap / alpha;
    }

    if (chrom === region.chrom && position >= region.start && position <= region.end) {
      convertedPosition = cumulativeSpan + (position - region.start);
      break;
    }
  }

  return convertedPosition;
}

// Fetch data from the tabix file for a specific region
async function fetchData(url: string, chrom: string, start: number, end: number): Promise<MclsData[]> {
  const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
  });
  
  const lines: MclsData[] = [];

  await file.getLines(chrom, start, end, function(line: string) {
    const arr = line.split(/[\s]+/);
    const addedData: MclsData = {
      chrom: arr[0],
      start: Number(arr[1]),
      end: Number(arr[2]),
      id: arr[3]
    };
    lines.push(addedData);
  });

  return lines;
}

// Fetch and process data for all trackViews
const fetchAndProcessData = async (width: number) => {
  let allViewsData: MclsData[] = [];
  let overallLength = 0;
  
  // Fetch data for each trackView
  for (const view of props.trackViews) {
    const { chrom, start, end } = view;
    const viewData = await fetchData(props.config.option.url, chrom, start, end);
    allViewsData = allViewsData.concat(viewData);
    overallLength += end - start;
  }

  // Calculate scaling factor
  const totalGapLength = props.trackViews.length * VIEWGAP;
  const alpha = (width - totalGapLength) / overallLength;
  
  // Set end coordinate for location props
  locationProps.value.end = width / alpha;

  // Convert genomic coordinates to screen coordinates
  mergedData.value = allViewsData.map((entry) => {
    const { chrom, start, end, id } = entry;

    const adjustedStart = convertGenomicPosition(start, chrom, props.trackViews, VIEWGAP, alpha);
    const adjustedEnd = convertGenomicPosition(end, chrom, props.trackViews, VIEWGAP, alpha);

    return {
      chrom: 'chr',
      start: adjustedStart,
      end: adjustedEnd,
      id: id,
      rawChrom: chrom,
      rawStart: start,
      rawEnd: end
    };
  });
};

// Handle zoom event from the child component
const handleZoomTo = (chrom: string, start: number, end: number, activeTrackViewIndex: number) => {
  emit('zoomTo', chrom, start, end, activeTrackViewIndex);
};

onMounted(async () => {
  await fetchAndProcessData(width.value);
  
  // Watch for changes in trackViews to reload data
  watch(() => props.trackViews, async () => {
    await fetchAndProcessData(width.value);
  }, { deep: true });
  
  // Watch for width changes to recalculate positions
  watch(() => width.value, async () => {
    if (width.value > 0) {
      await fetchAndProcessData(width.value);
    }
  });
});
</script>

<style scoped>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}
</style>