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
                left: `${calculatedPositionFunc(view, index)}px`,
                width: `${calculatedWidthFunc(view)}px`,
                height: '100%',
                top: '0'
             }">
        </div>
      </div>

      <pcls-track-item 
          :location="locationProps" 
          :option="props.config.option" 
          :style="props.style"
          :processedData="mergedData">
      </pcls-track-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, computed, watch } from 'vue'
import PclsTrackItem from './PclsTrackItem.vue'
import { useElementSize } from '@vueuse/core'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
import { 
  VIEWGAP, 
  calculatePosition, 
  calculateWidth, 
  convertGenomicPosition 
} from '../utils/trackViewUtils'
import type { TrackView } from '../utils/trackViewUtils'

// 定义数据项的类型
interface DataItem {
  chrom: string;
  start: number;
  end: number;
  chrom2: string;
  start2: number;
  end2: number;
  score: number;
  outTrackViews?: number;
  [key: string]: any; // 允许其他属性
}

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
    required: true,
  }
})

const isDataReady = ref(false)
const canvasContainer = ref(null)
const mergedData = ref<DataItem[]>([])
const totalLength = ref(0)

const locationProps = ref({
  chrom: 'chr',
  start: 1,
  end: 0
})

const { width, height } = useElementSize(canvasContainer)

// 创建一个计算属性，确保在模板中直接使用的函数可以访问正确的width和locationProps值
const calculatedPositionFunc = (view: TrackView, index: number) => {
  return calculatePosition(view, index, props.trackViews, width.value, locationProps.value.end);
}

const calculatedWidthFunc = (view: TrackView) => {
  return calculateWidth(view, width.value, locationProps.value.end);
}

// 检查位置是否在任意trackView中
const isPositionInTrackViews = (chrom: string, position: number) => {
  return (props.trackViews as TrackView[]).some(view => 
    view.chrom === chrom && position >= view.start && position <= view.end
  )
}

// 检查整个区域是否在任意trackView中
const isRegionFullyInTrackViews = (chrom: string, start: number, end: number) => {
  return (props.trackViews as TrackView[]).some(view => 
    view.chrom === chrom && start >= view.start && end <= view.end
  )
}

// 裁剪区域使其适合trackView的边界
const clipRegionToTrackView = (chrom: string, start: number, end: number) => {
  for (const view of props.trackViews as TrackView[]) {
    if (view.chrom === chrom) {
      // 检查是否有重叠
      if (end >= view.start && start <= view.end) {
        // 裁剪到trackView边界
        return {
          chrom,
          start: Math.max(start, view.start),
          end: Math.min(end, view.end)
        }
      }
    }
  }
  // 如果没有重叠，返回原始值
  return { chrom, start, end }
}

// 新增函数：获取染色体的数字索引
const getChromIndex = (chrom: string): number => {
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
const comparePositions = (chrom1: string, pos1: number, chrom2: string, pos2: number): number => {
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
// 注释：这个函数在当前版本中不再使用，因为我们只显示两个anchor都在trackView中的循环
/*
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
*/

const deduplicateArray = (data: DataItem[]): DataItem[] => {
  const uniqueEntries = new Set()
  const result: DataItem[] = []

  data.forEach((item: DataItem) => {
    let { chrom, start, end, chrom2, start2, end2, score } = item
    
    // 如果是同一条染色体，确保坐标小的在前面
    // 如果是不同染色体，确保染色体索引小的在前面
    if (comparePositions(chrom, start, chrom2, start2) > 0) {
      // 交换位置
      [chrom, start, end, chrom2, start2, end2] = [chrom2, start2, end2, chrom, start, end]
    }

    const original: (string | number)[] = [chrom, start, end, chrom2, start2, end2]
    const swapped: (string | number)[] = [chrom2, start2, end2, chrom, start, end]

    const sortTriplet = (triplet: (string | number)[]) => {
      // 只对数字部分排序（即第二个和第三个元素）
      const numOnly = triplet.slice(1) as number[];
      numOnly.sort((a, b) => a - b);
      return [triplet[0], ...numOnly];
    }
    
    const originalTriplet1 = sortTriplet(original.slice(0, 3))
    const originalTriplet2 = sortTriplet(original.slice(3, 6))
    const swappedTriplet1 = sortTriplet(swapped.slice(0, 3))
    const swappedTriplet2 = sortTriplet(swapped.slice(3, 6))

    const canonicalOriginal = [...originalTriplet1, ...originalTriplet2].join(',')
    const canonicalSwapped = [...swappedTriplet1, ...swappedTriplet2].join(',')
    const canonical = [canonicalOriginal, canonicalSwapped].sort()[0]

    if (!uniqueEntries.has(canonical)) {
      uniqueEntries.add(canonical)
      
      // 根据显示模式参数处理anchors
      // anchorDisplayMode参数控制anchor的显示方式:
      // 'full': 只显示完全在trackView中的anchors
      // 'partial': 显示部分在trackView中的anchors，并将其裁剪到trackView边界(默认)
      const anchorDisplayMode = props.config.option.anchorDisplayMode || 'partial' // 默认为部分显示模式
      
      if (anchorDisplayMode === 'full') {
        // 模式1: 只显示anchor全部在trackview中的循环
        const isAnchor1FullyIn = isRegionFullyInTrackViews(chrom, start, end)
        const isAnchor2FullyIn = isRegionFullyInTrackViews(chrom2, start2, end2)
        
        if (isAnchor1FullyIn && isAnchor2FullyIn) {
          result.push({
            ...item,
            outTrackViews: 0,
            chrom,
            start,
            end,
            chrom2,
            start2,
            end2,
            score
          })
        }
      } else {
        // 模式2: 显示部分在trackview中的循环，但进行裁剪
        const inTrackViews1 = isPositionInTrackViews(chrom, start) || isPositionInTrackViews(chrom, end)
        const inTrackViews2 = isPositionInTrackViews(chrom2, start2) || isPositionInTrackViews(chrom2, end2)
        
        if (inTrackViews1 && inTrackViews2) {
          // 裁剪anchors到trackView边界
          const clippedAnchor1 = clipRegionToTrackView(chrom, start, end)
          const clippedAnchor2 = clipRegionToTrackView(chrom2, start2, end2)
          
          result.push({
            ...item,
            outTrackViews: 0,
            chrom: clippedAnchor1.chrom,
            start: clippedAnchor1.start,
            end: clippedAnchor1.end,
            chrom2: clippedAnchor2.chrom,
            start2: clippedAnchor2.start,
            end2: clippedAnchor2.end,
            score
          })
        }
      }
    }
  })

  return result
}

async function fetchGeneData(url: string, chrom: string, start: number, end: number): Promise<DataItem[]> {
  const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
  })
  let lines: DataItem[] = []

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

const fetchAndProcessData = async (widthValue: number) => {
  let allViewsData: DataItem[] = []
  let viewData: DataItem[] = []
  let alpha = 0
  let overallLength = 0
  
  for (const view of props.trackViews) {
    const { chrom, start, end } = view
    viewData = await fetchGeneData(props.config.option.url, chrom, start, end)
    allViewsData = allViewsData.concat(viewData)
    overallLength += end - start
  }

  const totalGapLength = (props.trackViews.length) * VIEWGAP
  alpha = (widthValue - totalGapLength) / overallLength
  
  locationProps.value.end = widthValue / alpha

  mergedData.value = allViewsData.map((entry: DataItem) => {
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