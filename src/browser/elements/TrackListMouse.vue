<template>
  <div ref="trackList" v-if="isLoaded" :id="props.sessionId" class="track-list flex flex-col pl-2 pr-2 w-full">
    <div id="screenshot-holder" ref="screenshotHolder">

      <div ref="trackholderRef" class="track-holder" style="position: relative">
        <template v-for="(trackComponent, index) in trackComponents">
          <track-item :trackId="trackComponent.key" :sessionId="$props.sessionId">
            <template #trackTitle>
              <p v-show="isShowTrackLabel" class="text-lg absolute top-0 right-1 z-20">{{ trackComponent.trackConfig.name }}
              </p>
            </template>
            <template #canvas>
              <DynamicComponent :componentKey="trackComponent.trackConfig.chartKey" :props="{
                config: trackComponent,
                dataLoaded: isLoaded,
                location: corenavStore,
                sessionId: sessionId,
                trackId: trackComponent.key,
                style: useHeightStyle(trackComponent.attr)
              }" @zoom-to="zoomTo"></DynamicComponent>
            </template>
            <template #controller>
              <component :is="trackComponent.trackConfig.controllerKey" v-if="trackComponent.trackConfig.controllerKey"
                :key="index" :controllerConfig="trackComponent.controllerConfig" :location="corenavStore">
              </component>
            </template>
          </track-item>
        </template>

        <!-- 添加高亮canvas层 -->
        <canvas ref="highlightCanvas" 
        id="highlightregionHuman"
          class="z-20"
          style="position: absolute; top: 0; left: 0;">
        </canvas>
        
        <canvas v-show="isShowVerticalLine" 
          ref="verticalLine" 
          class="z-30"
          @mousedown="handleDragStart"
          @mousemove="handleDragMove"
          @mouseup="handleDragEnd"
          @click="handleVerticalLineClick">
        </canvas>
      </div>
    </div>
    <div class="mt-6"></div>
    <chrom-view-h :chrom="corenavStore.chrom" :chromBands="chromBands" :chromNames="chromNames" :chromSizes="chromSizes"
        :end="corenavStore.end" :isSelectorVisible="true" :labelWidth="0" :max="corenavStore.max" :min="corenavStore.min"
        :start="corenavStore.start" :type="props.config.style" @zoomTo="zoomTo">
      </chrom-view-h>
      <div class="flex items-center ">
     <n-h3> Mouse</n-h3>
     <div class="flex-1 ml-10">
    <nav-bar v-model:chrom="corenavStore.chrom" :asm="$props.assembly.label" :chromNames="chromNames"
      :chromSizes="chromSizes" :end="corenavStore.end" :max="corenavStore.max" :min="corenavStore.min"
      :start="corenavStore.start" @shift="handleShift" @zoomIn="zoomIn" @zoomOut="zoomOut" @zoomTo="zoomTo"
      v-model:showTrackLabel="isShowTrackLabel" v-model:showVerticalLine="isShowVerticalLine">
    </nav-bar>
  </div>
    </div>
  </div>

  <!-- Context Menu -->
  <div v-if="showMenu" class="fixed bg-white border rounded shadow-lg z-50 py-1" 
       :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }">
    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleMenuSelect('showSynteny')">
      Selected Region: {{ selectedRegion.chrom }} : {{ selectedRegion.start }} - {{ selectedRegion.end }}
    </div>
    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleMenuSelect('annotation')">
      Annotate the above region
    </div>
    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleMenuSelect('cancel')">
      Cancel
    </div>
  </div>
  
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import NavBar from "../tracks/NavBar.vue";
import ChromViewH from "../tracks/ChromViewH.vue";
import DynamicComponent from './DynamicComponent.vue'
import TrackItem from '@/browser/elements/TrackItem.vue'
import { useHeightStyle } from "@/browser/hooks/useStyle";
import Sortable from 'sortablejs';
import { useTrackStore } from '@/browser/store'
import { useSessionStore } from '@/browser/store'
import { useElementSize } from '@vueuse/core'
import * as d3 from "d3";
import { useModalStore } from '@/stores/modalStore'
const modalStore = useModalStore()
const emit = defineEmits(['update:location'])

const props = defineProps({
  assembly: { type: Object, required: true },
  sessionId: { type: String, required: true },
  tracks: { type: Array, required: true },
  session: { type: Object, required: true },
  config: {
    type: Object,
    required: false,
    default: () => ({ style: 'full' })
  },
  // 新增: 接收要高亮的区域
  highlightRegion: {
    type: Object,
    required: false,
    default: () => null,
    // 期望的格式: { chrom: 'chr1', start: 1000, end: 2000 }
  }
})

// Stores
const trackStore = useTrackStore();
const sessionStore = useSessionStore();

// State refs
const isShowTrackLabel = ref(true)
const isShowVerticalLine = ref(false)
const isLoaded = ref(false)
const trackList = ref(null)
const trackholderRef = ref(null)
const screenshotHolder = ref(null)
const verticalLine = ref(null)
const highlightCanvas = ref(null)
const trackComponents = ref([])
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const clickPosition = ref(null)

// Drag selection state
const isDragging = ref(false)
const dragStart = ref({ x: 0, genomicPos: 0 })
const dragEnd = ref({ x: 0, genomicPos: 0 })
const selectedRegion = ref(null)

// Core navigation state
const assemblyRef = computed(() => props.assembly)
const corenavStore = ref({
  chrom: assemblyRef.value.initPos.chrom || 'chr1',
  start: assemblyRef.value.initPos.start || 1000000,
  end: assemblyRef.value.initPos.end || 1500000,
  max: 0,
  min: 0,
  size: 0
})

// Chromosome data
let chromSizes = props.assembly.chromSizes
let chromBands = props.assembly.chromBands || null
let chromNames = []
const { width } = useElementSize(trackholderRef)
const { height } = useElementSize(screenshotHolder)
const minRegionSize = 50

const trackholderSize = useElementSize(trackholderRef)
const screenshotHolderSize = useElementSize(screenshotHolder)

// Setup chromosome data
const setupChromSizesAndBands = async () => {
  for (let chromName in chromSizes) {
    chromNames.push(chromName);
  }
  
  chromNames.sort((p, q) => {
    var a = 0, b = 0, x = 0;
    if (p.substr(0, 3) == 'chr') {
      x = 3;
    } else if (p.substr(0, 9) == 'scaffold_') {
      x = 9;
    }

    a = parseInt(p.substr(x));
    b = parseInt(q.substr(x));
    var c = a - b;

    if (!isNaN(c)) return c;
    if (isNaN(a) && isNaN(b)) return p < q ? -1 : 1;
    if (isNaN(a)) return 1;
    if (isNaN(b)) return -1;
  });

  corenavStore.value.max = chromSizes[corenavStore.value.chrom]
  corenavStore.value.size = chromSizes[corenavStore.value.chrom]
  isLoaded.value = true
}

// 新增: 绘制高亮区域的方法
const drawHighlight = () => {
  const canvas = highlightCanvas.value
  if (!canvas || !trackholderSize.width.value || !screenshotHolderSize.height.value) return
  
  const ctx = canvas.getContext('2d')
  
  // 设置canvas尺寸
  canvas.width = trackholderSize.width.value - 32
  canvas.height = screenshotHolderSize.height.value
  
  // 清除之前的绘制
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 只有当有高亮区域且在当前视图范围内时才绘制
  if (props.highlightRegion?.chrom === corenavStore.value.chrom) {
    const regionSize = corenavStore.value.end - corenavStore.value.start
    const basePerPixel = regionSize / canvas.width
    
    const startX = (props.highlightRegion.start - corenavStore.value.start) / basePerPixel
    const endX = (props.highlightRegion.end - corenavStore.value.start) / basePerPixel
    
    // 绘制高亮
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'
    ctx.fillRect(startX, 0, endX - startX, canvas.height)
    
    // 绘制边框
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(startX, 0, endX - startX, canvas.height)
  }
}

// Throttle function
function throttle(func, limit) {
  let previous = 0;
  return function() {
    let now = Date.now();
    let context = this;
    let args = arguments;
    if (now - previous > limit) {
      func.apply(context, args);
      previous = now;
    }
  }
}

// Navigation functions
const zoomTo2 = (chrom, start, end) => {
  if (!chrom) {
    chrom = corenavStore.value.chrom
  }
  
  var size = corenavStore.value.size,
    s = Math.max(start, 1) || 1,
    e = Math.min(end, size) || size;
    
  start = Math.round(s)
  end = Math.round(e)
  
  if (end - start >= minRegionSize) {
    corenavStore.value.chrom = chrom
    corenavStore.value.start = start
    corenavStore.value.end = end
    corenavStore.value.max = chromSizes[chrom]
    corenavStore.value.size = chromSizes[chrom]
  }
}

const zoomTo = throttle(zoomTo2, 1000)

const zoomIn = () => {
  const s = corenavStore.value.start,
    e = corenavStore.value.end,
    m = (s + e) / 2,
    x = (e - s + 1) / 4;
  zoomTo(corenavStore.value.chrom, Math.round(m - x), Math.round(m + x) - 1);
}

const zoomOut = () => {
  const s = corenavStore.value.start,
    e = corenavStore.value.end,
    m = (s + e) / 2,
    x = Math.max(1, e - s);
  zoomTo(corenavStore.value.chrom, Math.round(m - x), Math.round(m + x) + 1);
}

const handleShift = (ev, direction) => {
  var span = corenavStore.value.end - corenavStore.value.start + 1,
    delta = ev.ctrlKey ? (ev.shiftKey ? 0.95 : 0.475) : 0.1;
  delta *= direction * span;
  zoomTo(corenavStore.value.chrom, corenavStore.value.start + delta, corenavStore.value.end + delta)
}

// Calculate genomic position from screen coordinates
const calculateGenomicPosition = (clientX) => {
  const canvas = verticalLine.value
  const rect = canvas.getBoundingClientRect()
  const x = clientX - rect.left
  const canvasWidth = width.value - 32
  const regionSize = corenavStore.value.end - corenavStore.value.start
  const basePerPixel = regionSize / canvasWidth
  const position = Math.round(corenavStore.value.start + (x * basePerPixel))
  
  return {
    chrom: corenavStore.value.chrom,
    position: position,
    x: x
  }
}

// Drag handlers
const handleDragStart = (event) => {
  isDragging.value = true
  const pos = calculateGenomicPosition(event.clientX)
  dragStart.value = {
    x: pos.x,
    genomicPos: pos.position
  }
  event.preventDefault()
}

const handleDragMove = (event) => {
  if (!isDragging.value) return
  
  const pos = calculateGenomicPosition(event.clientX)
  dragEnd.value = {
    x: pos.x,
    genomicPos: pos.position
  }
  
  // Draw selection rectangle
  const ctx = verticalLine.value.getContext('2d')
  ctx.clearRect(0, 0, verticalLine.value.width, verticalLine.value.height)
  
  const startX = Math.min(dragStart.value.x, dragEnd.value.x)
  const width = Math.abs(dragEnd.value.x - dragStart.value.x)
  
  ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
  ctx.fillRect(startX, 0, width, verticalLine.value.height)
  
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'
  ctx.strokeRect(startX, 0, width, verticalLine.value.height)
}

const handleDragEnd = (event) => {
  if (!isDragging.value) return
  
  isDragging.value = false
  const pos = calculateGenomicPosition(event.clientX)
  dragEnd.value = {
    x: pos.x,
    genomicPos: pos.position
  }
  
  // Store selected region
  selectedRegion.value = {
    chrom: corenavStore.value.chrom,
    start: Math.min(dragStart.value.genomicPos, dragEnd.value.genomicPos),
    end: Math.max(dragStart.value.genomicPos, dragEnd.value.genomicPos)
  }
  
  // Show context menu
  menuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  showMenu.value = true
}

// Vertical line and menu handling
const handleVerticalLineClick = (event) => {
  if (isDragging.value) return
  
  clickPosition.value = calculateGenomicPosition(event.clientX)
  menuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  showMenu.value = true
  event.stopPropagation()
}

const handleMenuSelect = (action) => {
  if (action === 'showSynteny') {
    console.log('Selected region:', selectedRegion.value)
    alert(`Selected region:\nChrom: ${selectedRegion.value.chrom}\nStart: ${selectedRegion.value.start}\nEnd: ${selectedRegion.value.end}`)
  } else if (action === 'annotation') {
    console.log('Selected position:', clickPosition.value)
    modalStore.openModal({chrom: `${selectedRegion.value.chrom}`, start: `${selectedRegion.value.start}`, end: `${selectedRegion.value.end}`})
  }
  showMenu.value = false
  
  // Clear selection
  const ctx = verticalLine.value.getContext('2d')
  ctx.clearRect(0, 0, verticalLine.value.width, verticalLine.value.height)
}

// Setup vertical line
const setupVerticalLine = () => {
  if (width.value > 0 && (isShowVerticalLine.value || isDragging.value)) {
    let canvasOverlay = d3.select(verticalLine.value)
      .attr("width", width.value - 32)
      .attr("height", height.value)
      .style("left", "0px")
      .style("bottom", "0px")
      .style("position", "absolute")
      
    if (isShowVerticalLine.value) {
      canvasOverlay
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
    }
      
    const ctxOverlay = canvasOverlay.node().getContext("2d");

    function drawCrosshair(ctx, canvas, x) {
      if (isDragging.value) return
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    function mousemove(event) {
      if (isDragging.value) return
      const rect = canvasOverlay.node().getBoundingClientRect();
      const x = event.clientX - rect.left;
      drawCrosshair(ctxOverlay, canvasOverlay.node(), x);
    }

    function mouseout() {
      if (isDragging.value) return
      ctxOverlay.clearRect(0, 0, canvasOverlay.node().width, canvasOverlay.node().height);
    }
  }
}

// Computed and watchers
const sessionTracks = computed(() => {
  return sessionStore.getSessionTracks(props.session)
})

watch(sessionTracks, (newTracks, oldTracks) => {
  if (newTracks.length > oldTracks.length) {
    trackComponents.value = newTracks;
  }
}, {immediate: false})

// Watch for vertical line updates
watch([() => width.value, () => isShowVerticalLine.value], () => {
  setupVerticalLine()
}, { immediate: true})

// Watch location changes and highlight region
watch(
  [
    () => corenavStore.value,
    () => props.highlightRegion,
    () => trackholderSize.width.value,
    () => screenshotHolderSize.height.value
  ],
  () => {
    // 确保所有必要的值都已经计算出来
    if (trackholderSize.width.value && screenshotHolderSize.height.value) {
      drawHighlight()
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => corenavStore.value,
  (newValue) => {
    emit('update:location', newValue)  // 向父组件发送更新
  },
  { deep: true, immediate: true }
)

// Lifecycle hooks
onMounted(async () => {
  await setupChromSizesAndBands()
  trackComponents.value = sessionTracks.value
  
  // 如果有高亮区域，跳转到该区域并显示高亮
  // if (props.highlightRegion) {
  //   const { chrom, start, end } = props.highlightRegion
  //   // 确保视图范围略大于高亮区域
  //   const padding = (end - start) * 0.2 // 添加20%的padding
  //   zoomTo(chrom, start - padding, end + padding)
    // nextTick(() => {
      // drawHighlight()
    // })
  // }
  nextTick(() => {
    if (trackholderSize.width.value && screenshotHolderSize.height.value) {
      drawHighlight()
    }
  })

  // Initialize sortable
  Sortable.create(trackholderRef.value, {
    handle: '.track-item-drag-handler',
    draggable: ".track-item-sortable",
    group: { name: "trackItem" },
    animation: 150,
    ghostClass: "ghost",
    dragClass: "drag",
  })

  // Setup dragging behavior
  let dragged = false
  let oldX = 0
  let direction

  trackholderRef.value.addEventListener('mousedown', (e) => {
    oldX = e.pageX
    dragged = false
    document.body.classList.add('cursor-move')
  })

  trackholderRef.value.addEventListener('mouseup', (e) => {
    document.body.classList.remove('cursor-move')
    if (dragged && Math.abs(e.pageX - oldX) > 50) {
      direction = e.pageX < oldX ? 1 : -1
      handleShift(e, direction)
    }
  })

  // Keyboard navigation
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowLeft" || ev.key === "Left") {
      handleShift(ev, -1)
    } else if (ev.key === "ArrowRight" || ev.key === "Right") {
      handleShift(ev, 1)
    }
  })
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  border: 2px dashed #CCCCCC;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.drag {
  opacity: 0.7;
  border-color: #666666;
  background-color: #f4f4f4;
  transform: scale(1.05);
  z-index: 1000;
}

.track-holder {
  user-select: none;
}
</style>