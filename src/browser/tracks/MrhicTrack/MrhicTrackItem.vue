<template>
<div>
      
      <div ref="canvasContainer" class="aspect-ratio relative overflow-hidden" >
        <div v-if="isVisible">
          <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2 z-10"></n-spin>
        </div>
        <div v-else>
          <n-alert title="" type="warning">
            No data in this region.
          </n-alert>
        </div>
      </div>
      <n-popover 
  :show="showPopOver"
  :x="mouseClickPos.mousePosition[0]"
  :y="mouseClickPos.mousePosition[1]"
  trigger="manual"
  :style="{
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: '#333',
    padding: '5px',
    color: '#fff',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
    fontSize: '14px'
  }"
  :arrow-style="{
    backgroundColor: 'rgba(50, 50, 50, 0.9)'
  }"
>
<div style="display: flex; flex-direction: column; gap: 4px;">
  <span>Position1: {{ mouseClickPos.Position1.start }} - {{ mouseClickPos.Position1.end }}</span>
  <span>Position2: {{ mouseClickPos.Position2.start }} - {{ mouseClickPos.Position2.end }}</span>  
  <span>Counts: {{ mouseClickPos.counts }}</span>
  </div>
</n-popover>

  <!-- </div> -->
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, defineProps, onBeforeUnmount } from 'vue';
import { useElementSize } from '@vueuse/core'
import * as d3 from "d3";
import { createHiCStrawService } from './HiCStrawService';
import { useMouseInElement } from '@vueuse/core'
import { init } from '../../utils/echartsWorker/index2.ts'
import { SERVFAIL } from 'dns';

const props = defineProps({
  location: {
    type: Object,
    required: true
  },
  option: {
    type: Object,
    required: true
  },
  // style: {
  //   type: Object,
  //   required: true
  // },
  dataLoaded: {
    type: Boolean,
    required: false
  },
  trackViewIndex: {
        default: 0
    }
});

const chrom = computed(() => props.location.chrom);
const start = computed(() => props.location.start);
const end = computed(() => props.location.end);
const chrom2 = computed(() => props.location.chrom2);
const start2 = computed(() => props.location.start2);
const end2 = computed(() => props.location.end2);

const currentBpResolution = ref(5000);
const isVisible = ref(true);
const showSpin = ref(false);

const canvasContainer = ref(null);
const { width, height } = useElementSize(canvasContainer);
const hicService = createHiCStrawService(props.option.url);
const showPopOver = ref(false)

const resolutionMode = computed(() => props.option.series[0].resolution.mode)
const selectedResolution = computed(() => props.option.series[0].resolution.selectedResolution)
const availableResolutions = computed({
  get() {
    return props.option.series[0].resolution.availableResolutions || [];
  },
  set(value) {
    if (props.option && props.option.series && props.option.series[0] && props.option.series[0].resolution) {
      props.option.series[0].resolution.availableResolutions = [...value];
    }
  }
});

const selectedNormalization = computed(() => props.option.series[0].normalization.selectedNormalization)
const normalizationMethods = computed({
  get() {
    return props.option.series[0].normalization.normalizationMethods || [];
  },
  set(value) {
    if (props.option && props.option.series && props.option.series[0] && props.option.series[0].normalization) {
      props.option.series[0].normalization.normalizationMethods = [...value];
    }
  }
});


const {elementX, elementY, x, y, isOutside} = useMouseInElement(canvasContainer)
const option = computed(() => props.option);


// 计算缓冲区大小
function calculateBufferSize(start: number, end: number): number {
    const viewportSize = end - start;
    return Math.round(viewportSize * 1); // 设置缓冲区为可视区域的50%
}


// 计算带缓冲区的范围
let bufferSize 
let bufferedStart
let bufferedEnd


function makeSerializable(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

const updateResolution = () => {
  if (resolutionMode.value === 'auto') {
    currentBpResolution.value = hicService.calculateOptimalResolution({
      start: start.value,
      end: end.value,
      windowWidth: width.value,
      availableResolutions: availableResolutions.value
    });
  } else {
    currentBpResolution.value = selectedResolution.value;
  }
};

const initializeData = async () => {
  try {
    const [resolutions, normMethods] = await Promise.all([
      hicService.fetchResolutions(),
      hicService.fetchNormalizationMethods()
    ]);

    availableResolutions.value = resolutions;
    normalizationMethods.value = normMethods;
    selectedNormalization.value = normalizationMethods[0];
    updateResolution()
  } catch (error) {
    console.error('Initialization error:', error);
  }
};

const loading = ref(false);
const matrixData = ref(null);

// const worker = new MyWorker()

// let worker = new Worker(new URL('./HiCWorker_echarts.js', import.meta.url), { type: 'module' });

const mouseClickPos = ref({
  mousePosition: [0,0],
  Position1: 0,
  Position2: 0,
  counts: 0
})

function binToPosition(binIndex, resolution) {
  const start = binIndex * resolution;
  const end = start + resolution;
  return {start, end};
}

let instance
let canvas
const initalizeChart = async (needNewData = true) => {
  loading.value = true;
  
  bufferSize = calculateBufferSize(start.value, end.value);
 bufferedStart = Math.max(1, start.value - bufferSize);
 bufferedEnd = end.value + bufferSize;

  // if (!echartsInstance.value) {
     canvas = d3.select(canvasContainer.value)
      .append("canvas")
      .attr("width", width.value  )
      .attr("height", width.value )
      .style("width",width.value + "px")
      .style("height",width.value + "px")
      .style(option.value.yAxis.flip ? "top" : "bottom", "0px")
      // .style("position", "absolute")
      // .style("left", "-" + width.value  + "px")
      .node();
    // const offscreen = canvas.transferControlToOffscreen();

    instance =  init(canvas)


    instance.fetchAndRenderData(makeSerializable({
      normalization: selectedNormalization.value,
      chrom: chrom.value,
      start: start.value,
      end: end.value,
      chrom2: chrom2.value,
      start2: start2.value,
      end2: end2.value,
      bufferedStart: bufferedStart, 
      bufferedEnd: bufferedEnd,
      resolution: currentBpResolution.value,
      url: props.option.url,
      canvasWidth: width.value,
      canvasHeight: height.value,
      itemStyle: props.option.series[0].itemStyle,
      flip: option.value.yAxis.flip,
    }))

  instance.on('click', (event)=> {
    console.log(event)
  // mouseClickPos.value.x  = event.x
  // mouseClickPos.value.y = event.y
  mouseClickPos.value.mousePosition = [ x.value, y.value ]
  mouseClickPos.value.Position1  = binToPosition(event.data[0], currentBpResolution.value)
  mouseClickPos.value.Position2  = binToPosition(event.data[1], currentBpResolution.value)
  mouseClickPos.value.counts = event.data[2]
  console.log(mouseClickPos.value)
  showPopOver.value = true
  })
}

const accumulatedOffset = ref(0);


onMounted(async () => {
  showSpin.value = true;
  await initializeData()
 await initalizeChart()
 showSpin.value = false;
  // Watch for data changes
  // watch([
  //   () => chrom.value,
  //   () => start.value,
  //   () => end.value,
  // ], async () => {
  //   showSpin.value = true;
  //   updateResolution();
  //   await fetchAndRenderData(true); // Need new data
  //   showSpin.value = false;
  // });

  watch([chrom, start, end, chrom2, start2, end2], async (newValues, oldValues) => {
    const [newChrom, newStart, newEnd, newChrom2, newStart2, newEnd2] = newValues;
    const [oldChrom, oldStart, oldEnd] = oldValues;
    showSpin.value = true;

    // if (newChrom === oldChrom && 
    //     newStart > bufferedStart && 
    //     newEnd < bufferedEnd && ((newEnd - newStart) == (oldEnd - oldStart))) {
        
        // 使用 nextTick 确保 DOM 更新后再触发事件
        // await nextTick();
        
        // if (chartInstance) {
        //     chartInstance.dispatchAction({
        //         type: 'dataZoom',
        //         zoomLock: true,
        //         startValue: newStart,
        //         endValue: newEnd
        //     });
        // }
                // 发送 dataZoom 事件到 worker
        //         instance.worker.postMessage({
        //     type: 'dataZoom',
        //     args: {
        //         startValue: newStart,
        //         endValue: newEnd,
        //         resolution: currentBpResolution.value
        //     }
        // });
    // 计算本次移动距离
    // const moveDistance = newStart - oldStart;
    // const pixelMove = (moveDistance / (oldEnd - oldStart)) * width.value;
    
    // // 更新累积偏移量
    // accumulatedOffset.value -= pixelMove;
    
    // // 设置新位置
    // const newLeft = -width.value + accumulatedOffset.value;
    
    // d3.select(canvas)
    //   .style("left", newLeft + "px");
        
    // } else {

      updateResolution()
      bufferSize = calculateBufferSize(newStart, newEnd);
      bufferedStart = Math.max(1, newStart - bufferSize);
      bufferedEnd = newEnd + bufferSize;
      instance.fetchAndRenderData(makeSerializable({
        normalization: selectedNormalization.value,
        chrom: newChrom,
        start: newStart,
        end: newEnd,
        chrom2: newChrom2,
      start2: newStart2,
      end2: newEnd2,
        bufferedStart: bufferedStart, 
        bufferedEnd: bufferedEnd,
        resolution: currentBpResolution.value,
        url: props.option.url,
        canvasWidth: width.value,
        canvasHeight: height.value,
        itemStyle: props.option.series[0].itemStyle,
        flip: option.value.yAxis.flip,
      }))
      accumulatedOffset.value = 0
      d3.select(canvas)
      // .attr("width", width.value * 3 )
      // .attr("height", width.value * 3)
      // .style("width",width.value * 3 + "px")
      // .style("height",width.value * 3 + "px")
      // .style(option.value.yAxis.flip ? "top" : "bottom", "0px")
      // .style("position", "absolute")
      // .style("left", "-" + width.value  + "px")
      // .node();
    // }


    showSpin.value = false;
})

  // Watch for visualization parameter changes
  watch([
    () => width.value,
    () => option.value,
    () => resolutionMode.value,
    () => selectedResolution.value,
    () => selectedNormalization.value
  ], async () => {
    showSpin.value = true;
    // updateResolution();
    // await fetchAndRenderData(false); // Only update options
    bufferSize = calculateBufferSize(start.value, end.value);
 bufferedStart = Math.max(1, start.value - bufferSize);
 bufferedEnd = end.value + bufferSize;
    instance.fetchAndRenderData(makeSerializable({
      normalization: selectedNormalization.value,
      chrom: chrom.value,
      start: start.value,
      end: end.value,
      chrom2: chrom2.value,
      start2: start2.value,
      end2: end2.value,
      bufferedStart: bufferedStart, 
      bufferedEnd: bufferedEnd,
      resolution: currentBpResolution.value,
      url: props.option.url,
      canvasWidth: width.value,
      canvasHeight: height.value,
      itemStyle: props.option.series[0].itemStyle,
      flip: option.value.yAxis.flip,
    }))
    showSpin.value = false;
  }, { deep: true });

   window.addEventListener('resize', () => instance?.resize());
});

watch(isOutside, ()=>{
  if (isOutside.value) {
    showPopOver.value = false
  }
})

onBeforeUnmount(() => {
  
})
</script>

<style >
.echarts-tooltip {
  transform: 'rotate(45deg)';
  background-color: 'red'
}
</style>