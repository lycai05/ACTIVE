<template>
  <div class="relative h-full w-full">

    <div v-if="isVisible">
      <div ref="canvasContainer" class="basic-canvas aspect-ratio" :style="props.style">
        <n-spin :show="showSpin" class="absolute left-1/2 top-1/2">
          <div></div>
        </n-spin>
      </div>
    </div>
    <div v-else>
      <div ref="canvasContainer" class="basic-canvas">
        <n-alert title="" type="warning">
          No data in this region.
        </n-alert>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, defineProps } from 'vue';
import { useElementSize } from '@vueuse/core'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
import * as d3 from "d3";
const props = defineProps({
  location: {
    type: Object,
    required: true
  },
  option: {
    type: Object,
    required: true
  },
  style: {
    type: Object,
    required: true
  },
  dataLoaded: {
    type: Boolean,
    required: false
  }
})

const chrom = computed(
  () => props.location.chrom
)

const start = computed(
  () => props.location.start
)

const end = computed(
  () => props.location.end
)

const corenavStore = ref({
  asm: 'hg38',
  chrom: props.location.chrom,
  start: props.location.start,
  end: props.location.end,
  max: 0,
  min: 0,
  size: 0
})


// const type = ref('square')
const isVisible = ref(true)
const showSpin = ref(false)

const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)


// const type = computed(() => props.option.style)
const type = ref('triangle')
const url = props.option.url

const file = new TabixIndexedFile({
  filehandle: new RemoteFile(url),
  tbiFilehandle: new RemoteFile(url + '.tbi')
})

const plotHic = async (chrom, start, end, canvasWidth, canvasHeight) => {
  // console.log(chrom, start, end)

  let dataset = []
  await file.getLines(chrom, start, end, function (line, fileOffset) {
    const arr = line.split(/[\s]+/)
    const addedData = {
      chrom: arr[0],
      start: Number(arr[1]),
      end: Number(arr[2])
    }
    dataset.push(addedData)


  })

  // console.log(dataset)
  if (dataset.length === 0) {
    console.log("No data in this region")
    isVisible.value = false
    return
  }
  // const minCount = d3.min(dataset, function (d) { return d.counts; })
  // const maxCount = d3.max(dataset, function (d) { return d.counts; });

  // const maxBin1 = d3.max(dataset, function (d) { return d.start; })
  // const minBin1 = d3.min(dataset, function (d) { return d.start; })
  // const maxBin2 = d3.max(dataset, function (d) { return d.end; })
  // const minBin2 = d3.min(dataset, function (d) { return d.end; })
  // const bin1Ranges = maxBin1 - minBin1
  // const bin2Ranges = maxBin2 - minBin2
  // const minBin = Math.min(minBin1, minBin2);
  // const maxBin = Math.max(maxBin1, maxBin2)
  // const numBins = maxBin - minBin + 1;
  const numBins = end - start + 1
  var dotWidth = canvasWidth / numBins,
    dotHeight = canvasWidth / numBins,
    dotSpacing = 0.01;

  var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = canvasWidth,
    height = canvasWidth;

  var tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 1);

  var xScale = d3.scaleLinear()
    .domain([start, end])
    .range([0, width]);

  var xScaleRef = xScale.copy();

  var yScale = d3.scaleLinear()
    .domain([start, end])
    .range([width, 0]);

  function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }


  // const setOpacity = (hex, alpha) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2, 0)}`;

  // const zero_rgba = hexToRGB(props.option.series[0].itemStyle.zeroColor, props.option.series[0].itemStyle.opacity)
  // const min_rgba = hexToRGB(props.option.series[0].itemStyle.minCountColor, props.option.series[0].itemStyle.opacity)
  // const max_rgba = hexToRGB(props.option.series[0].itemStyle.maxCountColor, props.option.series[0].itemStyle.opacity)
  // // console.log([zero_rgba, min_rgba, max_rgba], [0, minCount, maxCount])
  // var colorScale = d3.scaleQuantize()
  //   .range([zero_rgba, min_rgba, max_rgba])
  //   .domain([0, minCount, maxCount])
  //   //   .clamp(true)
  //   .nice(100);




  var xAxis = d3.axisTop().scale(xScale);
  var yAxis = d3.axisLeft().scale(yScale);

  // var zoom = d3.zoom()
  //     .scaleExtent([dotWidth, dotHeight])
  //     .translateExtent([
  //         [0, 0],
  //         [width, height]
  //     ])
  //     .on("zoom", zoomed);

  var tooltip = d3.select("#canvasContainer").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);


  // SVG & Canvas:
  var canvas = d3.select(canvasContainer.value)
    .append("canvas")
    .attr("width", width)
    .attr("height", height)
    // .style("box-sizing", "border-box")
    .style("left", margin.left + "px")
    .style("bottom", margin.bottom + "px")
    .style("position", "absolute")
    .style("border-bottom", "1px solid #000")
  // .on("mousemove", event => mousemove(event))
  // .on("mouseout", mouseout);
  // console.log(canvasWidth,canvasHeight)
  // var svg = d3.select(canvasContainer.value)
  //   .append("svg")
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //   .attr("transform", "translate(" + [margin.left, margin.top] + ")");

  var ctx = canvas.node().getContext("2d");

  // canvas.call(zoom);

  // Initial Draw:
  // drawNodes(dataset);

  //Create Axes:
  // var renderXAxis = svg.append("g")
  //   .attr("class", "x axis")
  //   .attr("transform", "translate(0," + yScale(0) + ")")
  //   .call(xAxis)

  // var renderYAxis = svg.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //     .selectAll("text")
  //     .attr("transform", "rotate(-90)")

  // Handle Zoom:
  // function zoomed() {
  //     // rescale the x Axis:
  //     xScale = d3.event.transform.rescaleX(xScaleRef);  // Use Reference Scale.
  //     // Redraw the x Axis:
  //     renderXAxis.call(xAxis.scale(xScale));
  //     // Clear and redraw the nodes:

  //     drawNodes();
  // }
  // Draw nodes:		
  // function drawNodes(dataset, transform = true) {
  var k = d3.event ? d3.event.transform.k : 1;
  var dw = dotWidth * k;
  //  ctx.translate(0,height - height/Math.sqrt(2))
  // //ctx.scale(1,-1)

  //   ctx.rotate(Math.PI/4)
  // ctx.translate(Math.sqrt((width**2 + height**2)/8), -Math.sqrt((width**2 + height**2)/8))
  //  ctx.scale(1/Math.sqrt(2),1/Math.sqrt(2))
  //   ctx.scale( width /Math.sqrt(height**2 + width**2) ,1)

  if (type.value === 'triangle') {
    // ctx.translate(width / 2, width / 2)
    // ctx.rotate(Math.PI / 4)
    // ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))
  }
  // console.log(width, height)
  dataset.forEach(function (d) {

    // console.log(d)
    var x = xScale(d.start);
    var y = xScale(d.end);
    const side = (y - x) / Math.sqrt(2);

    // var fill = colorScale(d.counts);
    // console.log(x, y, dw, dotWidth, dotHeight)
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(y, height);
    ctx.lineTo((x + y) / 2, height - (y - x) / 2);
    ctx.closePath();

    // ctx.rect(x, y, y - x, y - x);
    ctx.fillStyle = hexToRGB(option.value.series[0].areaStyle.color, option.value.series[0].areaStyle.opacity); // 这里设置了 50% 的透明度
    ctx.fill();
    ctx.strokeStyle = option.value.series[0].lineStyle.color;// 这里设置了 50% 的透明度
    ctx.lineWidth = option.value.series[0].lineStyle.width;
    ctx.stroke();

  })


}
const option = computed(() => {
  return props.option
})
onMounted(() => {
  showSpin.value = true
  canvasContainer.value.style.height = (width.value - 6) + 'px'

  watch([() => width.value, () => option.value.series, () => chrom.value, () => start.value, () => end.value], (newStart, newEnd) => {

    // canvasContainer.value.innerHTML = ''
    showSpin.value = true
    const canvases = canvasContainer.value.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      canvas.parentNode.removeChild(canvas);
    });

    plotHic(chrom.value, start.value, end.value, width.value, height.value)
    showSpin.value = false

  }, { immediate: true, deep: true });

})
</script>
<style scoped>
.custom-rotate {
  transform: rotate(90deg);
}
</style>