<template>
  <div ref="trackList" v-if="isLoaded" :id="props.sessionId" class="track-list flex flex-col pl-2 pr-2 w-full">
    <nav-bar v-model:chrom="corenavStore.chrom" :asm="$props.assembly.label" :chromNames="chromNames"
      :chromSizes="chromSizes" :end="corenavStore.end" :max="corenavStore.max" :min="corenavStore.min"
      :start="corenavStore.start" @shift="handleShift" @zoomIn="zoomIn" @zoomOut="zoomOut" @zoomTo="zoomTo"
      v-model:showTrackLabel="isShowTrackLabel" v-model:showVerticalLine="isShowVerticalLine">
    </nav-bar>
    <div id="screenshot-holder">

      <chrom-view-h :chrom="corenavStore.chrom" :chromBands="chromBands" :chromNames="chromNames" :chromSizes="chromSizes"
        :end="corenavStore.end" :isSelectorVisible="true" :labelWidth="0" :max="corenavStore.max" :min="corenavStore.min"
        :start="corenavStore.start" :type="props.config.style" @zoomTo="zoomTo">
      </chrom-view-h>
      <div ref="trackholderRef" class="track-holder" style="position: relative">
        <template v-for="(trackComponent, index) in trackComponents">
          <track-item :trackId="trackComponent.key" :sessionId="$props.sessionId">
            <template #trackTitle>
              <p v-show="isShowTrackLabel" class="text-lg absolute top-0 right-1">{{ trackComponent.trackConfig.name }}
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

        <canvas ref="verticalLine" class="z-50"></canvas>

      </div>
    </div>
  </div>
  <div ref="mouseCircle"
    class="hidden fixed w-12 h-12 bg-gray-400 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
  </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, watch, nextTick, computed, reactive } from "vue";
import NavBar from "../tracks/NavBar.vue";
import ChromViewH from "../tracks/ChromViewH.vue";

import DynamicComponent from './DynamicComponent.vue'

import TrackItem from '@/browser/elements/TrackItem.vue'
import { useHeightStyle } from "@/browser/hooks/useStyle";
import Sortable from 'sortablejs';
import { useMouseInElement } from '@vueuse/core'
import { useTrackStore } from '@/browser/store'
import { useSessionStore } from '@/browser/store'
import { v4 as uuid } from 'uuid'
import { useElementSize } from '@vueuse/core'
import * as d3 from "d3";



const props = defineProps({
  assembly: {
    type: Object,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  tracks: {
    type: Array,
    required: true
  },
  session: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    required: false,
    default: () => {
      return {
        style: 'full'
      }
    }
  }
})

const trackStore = useTrackStore();
const sessionStore = useSessionStore();
// const trackList = ref(null)
const isShowTrackLabel = ref(true)
const assemblyRef = computed(() => {
  return props.assembly
})
const corenavStore = ref({
  chrom: assemblyRef.value.initPos.chrom || 'chr1',
  start: assemblyRef.value.initPos.start || 1000000,
  end: assemblyRef.value.initPos.end || 1500000,
  max: 0,
  min: 0,
  size: 0
})
const trackListId = ref(props.sessionId)
let chromSizes = props.assembly.chromSizes
let chromBands = props.assembly.chromBands || null
let chromNames = []
let isLoaded = ref(false)
const trackList = ref(null)
const trackholderRef = ref(null)
const { isOutside } = useMouseInElement(trackholderRef.value)
const isShowVerticalLine = ref(false)
const verticalLine = ref(null)
const LineContainer = ref(null)
const mousePos = reactive(useMouseInElement(LineContainer))
const { width, height } = useElementSize(trackholderRef)
const canvasRef = ref(null)
const ctx: Ref<CanvasRenderingContext2D | undefined> = ref();
const mouseCircle = ref(null)


const setupChromSizesAndBands = async () => {
  for (let chromName in chromSizes) {
    chromNames.push(chromName);
  }
  // sort chromsome names
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

  // initialize the chrom, end and max value
  // corenavStore.value.chrom = chromNames[0]

  // corenavStore.value.end = chromSizes[corenavStore.value.chrom] / 10
  corenavStore.value.max = chromSizes[corenavStore.value.chrom]
  corenavStore.value.size = chromSizes[corenavStore.value.chrom]

  // console.log(chromSizes)
  // console.log(chromBands)
  isLoaded.value = true


}

setupChromSizesAndBands()

const minRegionSize = 50


/** 
* @desc 函数节流
* @param func 回调函数 
* @param limit 时间限制
*/
function throttle(func, limit) {
  //上次执行时间 
  let previous = 0;
  return function () {
    //当前时间 
    let now = Date.now();

    let context = this;
    let args = arguments;

    // 若当前时间-上次执行时间大于时间限制
    if (now - previous > limit) {
      func.apply(context, args);
      previous = now;
    }
  }
}

const zoomTo2 = (chrom, start, end) => {
  // console.log(chrom, start, end)

  if (chrom == null) {
    chrom = corenavStore.value.chrom
  } else {
    chrom = chrom
  }

  var size = corenavStore.value.size,
    s = Math.max(start, 1) || 1,
    e = Math.min(end, size) || size;
  // console.log(end, size, chrom, chromSizes)
  start = Math.round(s)
  end = Math.round(e)
  if (end - start < minRegionSize) {
    // console.log('Size less then 50bp')
  } else {
    // after zooming, we need to refresh the locations
    corenavStore.value.chrom = chrom
    corenavStore.value.start = start
    corenavStore.value.end = end
    // console.log(chrom, start, end)
  }

}


const zoomTo = throttle(zoomTo2, 1000)

const zoomIn = () => {
  // console.log('zoomIn')
  const s = corenavStore.value.start,
    e = corenavStore.value.end,
    m = (s + e) / 2,
    x = (e - s + 1) / 4;
  zoomTo(corenavStore.value.chrom, Math.round(m - x), Math.round(m + x) - 1);
  // console.log('zoomIn', this.start, this.end)
}

const zoomOut = () => {
  // console.log('zoomOut')
  const s = corenavStore.value.start,
    e = corenavStore.value.end,
    m = (s + e) / 2,
    x = Math.max(1, e - s);
  zoomTo(corenavStore.value.chrom, Math.round(m - x), Math.round(m + x) + 1);
  // console.log('zoomOut', this.start, this.end)
}

const handleShift = (ev, direction) => {
  var span = corenavStore.value.end - corenavStore.value.start + 1,
    // delta = ev.ctrlKey ? ev.shiftKey ? 0.95 : 0.475 : 0.1;
    delta = ev.ctrlKey ? (ev.shiftKey ? 0.95 : 0.475) : 0.1;
  delta *= direction * span;
  // console.log(ev, direction)

  // console.log('shift', corenavStore.value.start, corenavStore.value.end, span, delta)

  // $.publish(BASICEvent.NAV_ZOOM_TO, [loc.chrom, loc.start + delta, loc.end + delta]);
  zoomTo(corenavStore.value.chrom, corenavStore.value.start + delta, corenavStore.value.end + delta)
}


const sessionTracks = computed(() => {
  // console.log(trackComponents)
  // const tc = sessionStore.getSessionTracks(props.session)
  // return tc
  // const tracksOrder = sessionStore.getSessionList[0].trackIds

  // return tc.sort(function (a, b) {
  //   return tracksOrder.indexOf(a.trackConfig.key) - tracksOrder.indexOf(b.trackConfig.key);
  // });
  // return trackStore.getTrackList
  // console.log(sessionStore.getSessionTracks(props.session), props.session)
  return sessionStore.getSessionTracks(props.session)
})

const trackComponents = ref([])
watch(sessionTracks,(newTracks, oldTracks)=>{
  // console.log(newTracks,oldTracks)
    if (newTracks.length > oldTracks.length) {
        // Update only if the array length has increased
        trackComponents.value = newTracks;
      }
  },{immediate: false})

onMounted(() => {

  trackComponents.value = sessionTracks.value

  ctx.value = canvasRef.value?.getContext('2d') || undefined;


  var dragged = false
  var oldX = 0;
  let direction;
  trackholderRef.value.addEventListener('mousedown', function (e) {
    oldX = e.pageX;
    dragged = false
    document.body.classList.add('cursor-move');
    // trackholderRef.value.classList.add('bg-slate-300');
    trackholderRef.value.addEventListener('mousemove', function () {

      // mouseCircle.value.style.left = `${e.clientX}px`;
      // mouseCircle.value.style.top = `${e.clientY}px`;
      // mouseCircle.value.classList.remove('hidden');

      dragged = true

    })
  })

  trackholderRef.value.addEventListener('mouseup', function (e) {

    document.body.classList.remove('cursor-move');

    // mouseCircle.value.classList.add('hidden');

    // trackholderRef.value.classList.remove('bg-slate-300');
    if (dragged == true && e.pageX < oldX) {
      direction = 1
    } else if (dragged == true && e.pageX > oldX) {
      direction = -1
    }

    if (e.pageX != oldX && Math.abs(e.pageX - oldX) > 50) {
      handleShift(e, direction)
    }
  })

  
  document.addEventListener("keydown", function(ev) {
    if (ev.key === "ArrowLeft" || ev.key === "Left") { // Older browsers may use "Left"
        handleShift(ev, -1); // Pass -1 for left movement
    } else if (ev.key === "ArrowRight" || ev.key === "Right") { // Older browsers may use "Right"
        handleShift(ev, 1); // Pass 1 for right movement
    }
});




  watch(() => isLoaded.value, async (newValue) => {
    if (newValue) {
      await nextTick()

      //设置配置
      var ops = {
        // cancel: '',
        handle: '.track-item-drag-handler',
        draggable: ".track-item-sortable",
        group: { name: "trackItem" },
        invertSwap: true,
        // fallbackOnBody: true,
        swapThreshold: 0.5,
        animation: 150,
        ghostClass: "ghost",
        dragClass: "drag",
        // scroll: true,
        forceFallback: true,
        // scrollSensitivity: 50,
        // scrollSpeed: 10,
        // bubbleScroll: true,
        // dataIdAttr: 'data-id',
        onEnd: function (evt) {
          // console.log(evt);
          //获取拖动后的排序
          var arr = sortable.toArray();
          // console.log(JSON.stringify(arr));


          // sessionStore.getSessionList.filter(session => session.key === props.sessionId)[0].trackIds = arr

        },
      };

      //初始化
      var sortable = Sortable.create(trackholderRef.value, ops);
    }
  }, { immediate: true })



  watch(
    () => [corenavStore.value.chrom, corenavStore.value.start, corenavStore.value.end],
    ([chrom, start, end]) => {
      // console.log(corenavStore.value.chrom, corenavStore.value.start, corenavStore.value.end)
      // console.log('watch', chrom, start, end)
      // setLocationAndRefresh(chrom, start, end)
      zoomTo(chrom, start, end)
    }
  )




  watch([() => width.value, () => height.value, () => isShowVerticalLine.value], (newWidth, newHeight) => {
    if (width.value > 0 && isShowVerticalLine.value) {
      var crosshairColor = 'blue';
      var crosshairWidth = 2;
      let canvasOverlay = d3.select(verticalLine.value)
        // .append("canvas")
        .attr("width", width.value - 24 - 8)
        .attr("height", height.value)
        // .style("box-sizing", "border-box")
        .style("left", 0 + "px")
        .style("bottom", 0 + "px")
        .style("position", "absolute")
        .on("mousemove", event => mousemove(event))
        .on("mouseout", event => mouseout(event));
      const ctxOverlay = canvasOverlay.node().getContext("2d");

      // console.log(canvasOverlay)
      const mouseout = (event) => {
        // if (isShowVerticalLine.value) {
        ctxOverlay.clearRect(0, 0, canvasOverlay.node().width, canvasOverlay.node().height); // Clear the canvas
        // isShowVerticalLine.value = false;
        // }
      }

      // Function to draw the crosshair
      function drawCrosshair(ctx, canvas, x, y) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.beginPath();
        ctx.strokeStyle = crosshairColor;
        ctx.lineWidth = crosshairWidth;

        // Draw vertical line
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        // Draw horizontal line
        // ctx.moveTo(0, y);
        // ctx.lineTo(canvas.width, y);

        ctx.stroke();
      }

      // Function to update the crosshair position
      function updateCrosshairPosition(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        drawCrosshair(ctxOverlay, canvasOverlay.node(), x, y);
      }
      const mousemove = (event) => {
        // isShowVerticalLine.value = true;
        updateCrosshairPosition(canvasOverlay.node(), event);
      }
    } else {
      let canvasOverlay = d3.select(verticalLine.value)
        .on('mousemove', null)
        .on('mouseout', null)
      const ctxOverlay = canvasOverlay.node().getContext("2d");
      ctxOverlay.clearRect(0, 0, canvasOverlay.node().width, canvasOverlay.node().height); // Clear the canvas

    }
  })



})






</script>

<style scoped>

/* 拖动时的镜像（"ghost"类）样式 */
.ghost {
    opacity: 0.5;  /* 半透明效果 */
    border: 2px dashed #CCCCCC;  /* 虚线边框 */
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);  /* 阴影效果，增加立体感 */
    transition: transform 0.2s ease;  /* 平滑变化 */
}

/* 实际拖动的元素（"drag"类）样式 */
.drag {
    opacity: 0.7;  /* 半透明效果，稍微透明一些表示正在被拖动 */
    border-color: #666666;  /* 边框颜色变化 */
    background-color: #f4f4f4;  /* 背景颜色变化，提高区分度 */
    transform: scale(1.05);  /* 轻微放大 */
    z-index: 1000;  /* 确保拖动时在顶层 */
}
</style>