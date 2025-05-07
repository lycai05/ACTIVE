<template>
  <div class="flex">
    <div ref="canvasContainer" class="relative flex-1">
      <!-- 添加trackViews的可视化 -->
      <div v-if="props.trackViews.length >1" class="absolute inset-0 flex">
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

      <curv-track-item 
          :location="locationProps" 
          :option="props.config.option" 
          :style="props.style"
          :dataset="mergedData"
          @zoom-to="handleZoomTo"
          :dispatchDataZoom="true"
          :loading="loading"
          >
      </curv-track-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, computed, watch } from 'vue'
import CurvTrackItem from './CurvTrackItem.vue'
import { useElementSize } from '@vueuse/core'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'

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
    required: true,
  }
})

const isDataReady = ref(false)
const canvasContainer = ref(null)
const mergedData = ref([])
const totalLength = ref(0)

const locationProps = ref({
  chrom: 'chr',
  start: 1,
  end: 0
})

const { width, height } = useElementSize(canvasContainer)

// 检查位置是否在任意trackView中
const isPositionInTrackViews = (chrom, position) => {
  return props.trackViews.some(view => 
    view.chrom === chrom && position >= view.start && position <= view.end
  )
}

// 新增函数：获取染色体的数字索引
const getChromIndex = (chrom) => {
  // 移除 'chr' 前缀
  const chromNum = chrom.replace('chr', '').toLowerCase()
  
  // 处理特殊染色体
  if (chromNum === 'x') return 23
  if (chromNum === 'y') return 24
  if (chromNum === 'm' || chromNum === 'mt') return 25
  
  // 返回数字染色体的索引
  return parseInt(chromNum)
}

// 新增函数：比较两个位置的顺序
const comparePositions = (chrom1, pos1, chrom2, pos2) => {
  const index1 = getChromIndex(chrom1)
  const index2 = getChromIndex(chrom2)
  
  // 如果染色体不同，比较染色体索引
  if (index1 !== index2) {
    return index1 - index2
  }
  
  // 如果染色体相同，比较位置
  return pos1 - pos2
}

// 修改函数：判断不在trackViews中的anchor的位置
const determineOutTrackViewsValue = (chrom1, pos1, chrom2, pos2, inTrackViews1, inTrackViews2) => {
  // 如果两个位置都在trackViews中，返回0
  if (inTrackViews1 && inTrackViews2) {
    return 0
  }
  
  // 比较位置（考虑染色体索引）
  const comparison = comparePositions(chrom1, pos1, chrom2, pos2)
  
  // 如果第一个位置不在trackViews中
  if (!inTrackViews1) {
    return comparison < 0 ? 1 : 2
  }
  
  // 如果第二个位置不在trackViews中
  if (!inTrackViews2) {
    return comparison > 0 ? 1 : 2
  }
  
  return 0
}

const deduplicateArray = (data) => {
  const uniqueEntries = new Set()
  const result = []

  data.forEach((item) => {
    let { chrom, start, end, chrom2, start2, end2 } = item
    
    // 如果是同一条染色体，确保坐标小的在前面
    // 如果是不同染色体，确保染色体索引小的在前面
    if (comparePositions(chrom, start, chrom2, start2) > 0) {
      // 交换位置
      [chrom, start, end, chrom2, start2, end2] = [chrom2, start2, end2, chrom, start, end]
    }

    const original = [chrom, start, end, chrom2, start2, end2]
    const swapped = [chrom2, start2, end2, chrom, start, end]

    const sortTriplet = (triplet) => triplet.sort((a, b) => a - b)
    const originalTriplet1 = sortTriplet(original.slice(0, 3))
    const originalTriplet2 = sortTriplet(original.slice(3, 6))
    const swappedTriplet1 = sortTriplet(swapped.slice(0, 3))
    const swappedTriplet2 = sortTriplet(swapped.slice(3, 6))

    const canonicalOriginal = [...originalTriplet1, ...originalTriplet2].join(',')
    const canonicalSwapped = [...swappedTriplet1, ...swappedTriplet2].join(',')
    const canonical = [canonicalOriginal, canonicalSwapped].sort()[0]

    if (!uniqueEntries.has(canonical)) {
      uniqueEntries.add(canonical)
      
      // 检查两个位置是否在trackViews中
      const inTrackViews1 = isPositionInTrackViews(chrom, start)
      const inTrackViews2 = isPositionInTrackViews(chrom2, start2)
      
      // 判断位置并设置outTrackViews（考虑染色体索引）
      const outTrackViews = determineOutTrackViewsValue(
        chrom,
        start,
        chrom2,
        start2,
        inTrackViews1,
        inTrackViews2
      )
      
      result.push({
        ...item,
        outTrackViews,
        chrom,
        start,
        end,
        chrom2,
        start2,
        end2
      })
    }
  })

  return result
}

async function fetchGeneData(url, chrom, start, end) {
  const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
  })
  let lines = []

  await file.getLines(chrom, start, end, function (line, fileOffset) {
    const splitData = line.split(/;/)
    const score = splitData[0].split(/[,]+/)[1]
    const arr = splitData[0].split(/[,]+/)[0].split(/[\s:-]+/)
    const addedData = {
      chrom: arr[0],
      start: Number(arr[1]),
      end: Number(arr[2]),
      chrom2: arr[3],
      start2: Number(arr[4]),
      end2: Number(arr[5]),
      score: Number(score),
      // snpId: splitData[1],
      // geneName: splitData[2],
      // ref: splitData[3],
      // alt: splitData[4],
    }
    lines.push(addedData)
  })

  lines = deduplicateArray(lines)
  return lines
}

const VIEWGAP = 30

const calculatePosition = (view, index) => {
  let position = 0
  for (let i = 0; i < index; i++) {
    position += props.trackViews[i].end - props.trackViews[i].start
  }
  return position * (width.value / locationProps.value.end)
}

const calculateWidth = (view) => {
  const viewWidth = view.end - view.start
  return viewWidth * (width.value / locationProps.value.end)
}

function convertGenomicPosition(position, chrom, trackViews, VIEWGAP, alpha) {
  let convertedPosition = position;
  let cumulativeSpan = 0;

  for (let i = 0; i < trackViews.length; i++) {
    const region = trackViews[i];
    
    if (i === 0) {
      cumulativeSpan = VIEWGAP / alpha;
    } else {
      cumulativeSpan += trackViews[i - 1].end - trackViews[i - 1].start + VIEWGAP / alpha;
    }

    if (chrom === region.chrom && position >= region.start && position <= region.end) {
      convertedPosition = cumulativeSpan + (position - region.start);
      break;
    }
  }

  return convertedPosition;
}

const fetchAndProcessData = async (width) => {
  let allViewsData = []
  let viewData = []
  let alpha = 0
  let overallLength = 0
  
  for (const view of props.trackViews) {
    const { chrom, start, end } = view
    viewData = await fetchGeneData(props.config.option.url, chrom, start, end)
    allViewsData = allViewsData.concat(viewData)
    overallLength += end - start
  }

  const totalGapLength = (props.trackViews.length) * VIEWGAP
  alpha = (width - totalGapLength) / overallLength
  
  locationProps.value.end = width / alpha

  mergedData.value = allViewsData.map((entry) => {
    const { chrom, start, end, chrom2, start2, end2, score, outTrackViews } = entry;

    const adjustedStart = convertGenomicPosition(start, chrom, props.trackViews, VIEWGAP, alpha);
    const adjustedEnd = convertGenomicPosition(end, chrom, props.trackViews, VIEWGAP, alpha);
    const adjustedStart2 = convertGenomicPosition(start2, chrom2, props.trackViews, VIEWGAP, alpha);
    const adjustedEnd2 = convertGenomicPosition(end2, chrom2, props.trackViews, VIEWGAP, alpha);

    return {
      chrom: 'chr',
      start: adjustedStart,
      end: adjustedEnd,
      chrom2: 'chr',
      start2: adjustedStart2,
      end2: adjustedEnd2,
      score: score,
      outTrackViews: outTrackViews,
      rawChrom1: chrom,
      rawStart1: start,
      rawEnd1: end,
      rawChrom2: chrom2,
      rawStart2: start2,
      rawEnd2: end2
    };
  });
  
  isDataReady.value = true
}

const handleZoomTo = (chrom, start, end, activeTrackViewIndex) => {
  locationProps.value = {
          ...locationProps.value,
          start: start,
          end: end
        };
  emit('zoomTo', chrom, start, end, activeTrackViewIndex)
 
}

onMounted(async () => {
  await fetchAndProcessData(width.value)
  console.log(mergedData.value)
  watch(() => props.trackViews, async () => {
    await fetchAndProcessData(width.value)
  }, { deep: true })
})
</script>

<style scoped>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}
</style>