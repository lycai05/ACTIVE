<template>
  <div v-if="isLoaded" :id="props.sessionId" class="track-list flex flex-col pl-2 pr-2 w-full">
    <nav-bar v-model:chrom="corenavStore.chrom" :asm="corenavStore.asm" :chromNames="chromNames" :chromSizes="chromSizes"
      :end="corenavStore.end" :max="corenavStore.max" :min="corenavStore.min" :start="corenavStore.start" @shift="shift"
      @zoomIn="zoomIn" @zoomOut="zoomOut" @zoomTo="zoomTo"
      v-model:showTrackLabel="isShowTrackLabel">
    </nav-bar>
    <div id="screenshot-holder">
      <div class="flex">
        <div style="width: 99px">
        </div>
        <div class="grow">
          <chrom-view-h :chrom="corenavStore.chrom"  :chromNames="chromNames" :chromBands="chromBands"
            :chromSizes="chromSizes" :end="corenavStore.end" :isSelectorVisible="true" :labelWidth="0"
            :max="corenavStore.max" :min="corenavStore.min" :start="corenavStore.start" type="overview" @zoomTo="zoomTo">
          </chrom-view-h>
        </div>
      </div>
      <div ref="trackholderRef" class="track-holder" style="position: relative">
        <template v-for="(trackComponent, index) in trackComponents">
          <track-item-square-heatmap :trackId="trackComponent.key" :sessionId="$props.sessionId">
            <template #leftSpace>
              <div style="width: 99px; min-height: 60px">
                <template v-if="trackComponent.option.style ==='square'">
                  <chrom-view-v :chrom="corenavStore.chrom" :chromBands="chromBands" :chromNames="chromNames"
              :chromSizes="chromSizes" :end="corenavStore.end" :isSelectorVisible="true" :labelWidth="0"
              :max="corenavStore.max" :min="corenavStore.min" :start="corenavStore.start" type="overview"
              @zoomTo="zoomTo">
            </chrom-view-v>
                </template>
              </div>
            </template>
            <template #trackTitle>
              <h5 v-show="!isOutside && isShowTrackLabel" class="text absolute top-1 right-1" size="small" >{{ trackComponent.trackConfig.name }}</h5>

            </template>
            <template #canvas>
              <component :is="trackComponent.trackConfig.chartKey" :key="index" :config="trackComponent"
                :dataLoaded="isLoaded" :location="corenavStore" :sessionId="sessionId" :style="{
                  ...useHeightStyle(trackComponent.attr)
                }" :trackId="trackComponent.key" @zoomTo="zoomTo"></component>
            </template>
            <template #controller>
              <component :is="trackComponent.trackConfig.controllerKey" v-if="trackComponent.trackConfig.controllerKey"
                :key="index" :controllerConfig="trackComponent.controllerConfig" :location="corenavStore">
              </component>
            </template>
          </track-item-square-heatmap>
        </template>
      </div>
    </div>
  </div>
  <n-modal v-model:show="showAddExternalTrackModal" preset="card" :z-index="1000000">
<ExTrackForm></ExTrackForm>
</n-modal>
</template>

<script lang="ts" setup>
console.log('========================TrackList start==================================')

import { ref, onMounted, watch, nextTick, computed, reactive } from "vue";
import NavBar from "../tracks/NavBar.vue";
import ChromViewH from "../tracks/ChromViewH.vue";
import ChromViewV from "../tracks/ChromViewV.vue";

import TrackItemSquareHeatmap from '@/browser/elements/TrackItemSquareHeatmap.vue'

import TrackItem from '@/browser/elements/TrackItem.vue'
import { useHeightStyle } from "@/browser/hooks/useStyle";
import Sortable from 'sortablejs';
import { useMouseInElement } from '@vueuse/core'
import { useTrackStore } from '@/browser/store'
import { useSessionStore } from '@/browser/store'
import { v4 as uuid } from 'uuid'
import { useElementSize } from '@vueuse/core'
import ExTrackForm from '@/components/Browser/ExTrackForm.vue'

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
  }
})

const trackStore = useTrackStore();
const sessionStore = useSessionStore();

const corenavStore = ref({
  chrom: props.assembly.initPos.chrom || 'chr1',
  start: props.assembly.initPos.start || 1000000,
  end: props.assembly.initPos.end || 1500000,
  max: 0,
  min: 0,
  size: 0
})
const showAddExternalTrackModal = ref(false)
const isShowTrackLabel = ref(false)

const trackListId = ref(props.sessionId)
let chromSizes = props.assembly.chromSizes
let chromBands = props.assembly.chromBands || null
let chromNames = []
let isLoaded = ref(false)

const trackList = ref(null)
const trackholderRef = ref(null)

const { isOutside } = useMouseInElement(trackholderRef.value)


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
  corenavStore.value.chrom = chromNames[0]

  // corenavStore.value.end = chromSizes[corenavStore.value.chrom] / 10
  corenavStore.value.max = chromSizes[corenavStore.value.chrom]
  corenavStore.value.size = chromSizes[corenavStore.value.chrom]

  // console.log(chromSizes)
  // console.log(chromBands)
  isLoaded.value = true


}

setupChromSizesAndBands()


const zoomTo = (chrom, start, end) => {
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

  // console.log('zoomTo', chrom, start, end)

  // after zooming, we need to refresh the locations
  corenavStore.value.chrom = chrom
  corenavStore.value.start = start
  corenavStore.value.end = end
}

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

const shift = (ev, direction) => {
  // console.log('shift')
  var span = corenavStore.value.end - corenavStore.value.start + 1,
    delta = ev.ctrlKey ? ev.shiftKey ? 0.95 : 0.475 : 0.1;
  delta *= direction * span;
  console.log('shift', corenavStore.value.start, corenavStore.value.end, span, delta)

  // $.publish(BASICEvent.NAV_ZOOM_TO, [loc.chrom, loc.start + delta, loc.end + delta]);
  zoomTo(corenavStore.value.chrom, corenavStore.value.start + delta, corenavStore.value.end + delta)
}


const trackComponents = computed(() => {
  // console.log(trackComponents)
  // const tc = sessionStore.getSessionTracks(props.session)
  // return tc
  // const tracksOrder = sessionStore.getSessionList[0].trackIds

  // return tc.sort(function (a, b) {
  //   return tracksOrder.indexOf(a.trackConfig.key) - tracksOrder.indexOf(b.trackConfig.key);
  // });
  // return trackStore.getTrackList
  return sessionStore.getSessionTracks(props.session)
})

// const addTrackContainer = ref(null)
// const { width, height }= useElementSize(addTrackContainer)
const LineContainer = ref(null)

const mousePos = reactive(useMouseInElement(LineContainer))
const { width, height } = useElementSize(trackholderRef)
const canvasRef = ref(null)
const ctx: Ref<CanvasRenderingContext2D | undefined> = ref();

// const ctx =  computed(()=>{canvasRef.value.getContext('2d')}) 

// const ctx = canvasRef.value.getContext('2d')


const selection = ref({
  first: { x: -1, y: -1 }, second: { x: -1, y: -1 },
  show: false,
  active: false,
});



const onMouseDown = (e) => {
  setSelectionPos(selection.value.first)
  selection.value.active = true;
  // const ctx = canvasRef.value.getContext('2d')
  ctx.value.clearRect(0, 0, mousePos.elementWidth, mousePos.elementHeight)
};

const onMouseMove = (e) => {
  if (selection.value.active) {
    updateSelection(e)
  }
};

const onMouseUp = (e) => {
  if (selection.value.active) {
    selection.value.active = false;
    // setSelectionPos(selection.value.second)
    updateSelection(e);
    // handleSelection();
  }
};

const setSelectionPos = (pos, e) => {
  pos.x = mousePos.elementX
  pos.y = pos == selection.value.first ? 0 : mousePos.elementHeight;
}

const updateSelection = (pos) => {
  setSelectionPos(selection.value.second, pos);
  if (selectionIsSane()) {
    selection.value.show = true
    triggerRedrawOverlay();
  } else {
    clearSelection(true);
  }
}

function selectionIsSane() {
  var minSize = 1
  return Math.abs(selection.value.second.x - selection.value.first.x) >= minSize &&
    Math.abs(selection.value.second.y - selection.value.first.y) >= minSize;
}

// const handleSelection = () => {
//   console.log(`Selection from ${selection.value.first.x}px and ${selection.value.first.y}px to ${selection.value.second.x}px and ${selection.value.second.y}px`);
// };

function clearSelection(preventEvent) {
  if (selection.value.show) {
    selection.value.show = false;
    triggerRedrawOverlay();
    // if (!preventEvent)
    //     plot.getPlaceholder().trigger("plotunselected", [ ]);
  }
}

const triggerRedrawOverlay = () => {
  ctx.value.save();
  ctx.value.clearRect(0, 0, mousePos.elementWidth, mousePos.elementHeight)
  // ctx.value.lineWidth = 1;

  var x = Math.min(selection.value.first.x, selection.value.second.x) + 0.5,
    y = Math.min(selection.value.first.y, selection.value.second.y) + 0.5,
    w = Math.abs(selection.value.second.x - selection.value.first.x) - 1,
    h = Math.abs(selection.value.second.y - selection.value.first.y) - 1;
  // ctx.value.lineJoin = 'round'
  ctx.value.fillStyle = "rgba(255, 165, 0, 0.1)"
  // console.log(ctx.value)
  // ctx.strokeStyle = 'blue'
  // console.log(x, y, w, h)
  ctx.value.fillRect(x, y, w, h);
  //  ctx.value.strokeRect(x, y, w, h);

  ctx.value.restore();
}

onMounted(() => {
  ctx.value = canvasRef.value?.getContext('2d') || undefined;

  // LineContainer.value.style.width = computed(()=>{
  //   console.log('LineContainer.value.style.width')
  //    trackholderSize.value.width + 'px'
  // })
  // LineContainer.value.style.height = computed(()=>{
  //    trackholderSize.value.height + 'px'
  // })
  // LineContainer.value.style.position="absolute"
  // LineContainer.value.style.top = "0px"
  // LineContainer.value.style.left = "0px"
  // console.log(mousePos.elementWidth, mousePos.elementHeight)
  // canvasRef.value.width = mousePos.elementWidth
  // canvasRef.value.height = mousePos.elementHeight 
  // LineContainer.value.append(canvasRef.value)

  //获取对象
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
        fallbackOnBody: true,
        swapThreshold: 0.5,
        animation: 150,
        ghostClass: "ghost",
        dragClass: "drag",
        scroll: true,
        forceFallback: true,
        scrollSensitivity: 50,
        scrollSpeed: 10,
        bubbleScroll: true,
        dataIdAttr: 'data-id',
        onEnd: function (evt) {
          console.log(evt);
          //获取拖动后的排序
          var arr = sortable.toArray();
          console.log(JSON.stringify(arr));


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
      // console.log('watch', chrom, start, end)
      // setLocationAndRefresh(chrom, start, end)
      zoomTo(chrom, start, end)
    }
  )





})
console.log('========================TrackList end==================================')






</script>

<style scoped>
/*.ghost {*/
/*  opacity: 0.5;*/
/*  background: #c2d8df;*/
/*  border: 1px dashed #ccc;*/
/*  border-top-right-radius: 0.5rem;*/
/*  border-bottom-right-radius: 0.5rem;*/
/*}*/

/*.drag {*/
/*  background: #f5f5f5;*/
/*}*/

/*.text {*/
/*  position: absolute;*/
/*  top: 10px;*/
/*  left: 10px;*/
/*}*/
</style>../tracks/ChromViewH_old.vue@/browser2/hooks/useStyle@/browser2/store@/browser2/store