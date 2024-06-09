<template>
  <div class="relative h-full w-full">

    <div v-if="isVisible">
      <n-spin :show="showSpin" >
        <!-- <div>ddd</div> -->
      

      <div ref="canvasContainer" class="basic-canvas aspect-ratio" :style="props.style">
      </div>
    </n-spin>
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
import HicStraw from 'hic-straw/dist/hic-straw.min.js'
import { useElementSize } from '@vueuse/core'
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
const currentBpResolution = ref(5000)
const isVisible = ref(true)
const showSpin = ref(false)
const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)
const straw = new HicStraw({
  url: props.option.url
})
const type = ref('triangle')

const findMatchingZoomIndex = (targetResolution, resolutionArray) => {
  // const isObject = resolutionArray.length > 0 && resolutionArray[0].index !== undefined
  const isObject = false
  for (let z = resolutionArray.length - 1; z > 0; z--) {
    const binSize = isObject ? resolutionArray[z].binSize : resolutionArray[z]
    const index = isObject ? resolutionArray[z].index : z
    if (binSize >= targetResolution) {
      return index
    }
  }
  return 0
};

function createTooltip(element, text) {
  // Create the tooltip div
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;

  // Append the tooltip to the body
  document.body.appendChild(tooltip);

  // Function to show the tooltip
  function showTooltip(e) {
    tooltip.style.opacity = '1';
    tooltip.style.top = `${e.pageY + 10}px`;
    tooltip.style.left = `${e.pageX + 10}px`;
  }
  // Function to hide the tooltip
  function hideTooltip() {
    tooltip.style.opacity = '0';
  }

  // Attach the event listeners
  element.addEventListener('mouseover', showTooltip);
  element.addEventListener('mousemove', showTooltip);
  element.addEventListener('mouseout', hideTooltip);
}

// 用于清除和重置 Canvas
function resetCanvas() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const plotHic = (straw, chrom, start, end, chrom1, start1, end1, canvasWidth, canvasHeight, resolution) => {
  const newChrom = chrom.replace(/chr/g, '')
  const newChrom1 = chrom1.replace(/chr/g, '')

  straw.getContactRecords(
    "NONE",
    { chr: newChrom, start: start, end: end },
    { chr: newChrom1, start: start1, end: end1 },
    "BP",
    resolution
  ).then(function (dataset) {
    if (dataset.length === 0) {
      isVisible.value = false
      return
    }
    const minCount = d3.min(dataset, function (d) { return d.counts; })
    const maxCount = d3.max(dataset, function (d) { return d.counts; });

    const maxBin1 = d3.max(dataset, function (d) { return d.bin1; })
    const minBin1 = d3.min(dataset, function (d) { return d.bin1; })
    const maxBin2 = d3.max(dataset, function (d) { return d.bin2; })
    const minBin2 = d3.min(dataset, function (d) { return d.bin2; })
    const bin1Ranges = maxBin1 - minBin1
    const bin2Ranges = maxBin2 - minBin2
    const minBin = Math.min(minBin1, minBin2);
    const maxBin = Math.max(maxBin1, maxBin2)
    const numBins = maxBin - minBin + 1;

    var dotWidth = canvasWidth / numBins,
      dotHeight = canvasWidth / numBins,
      dotSpacing = 0.01;

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
      // width = (dotWidth * 2 + dotSpacing) * days,
      // height = (dotHeight * 2 + dotSpacing) * hours;
      width = canvasWidth,
      height = canvasWidth;

    var tooltip = d3.select("body").append("div")
      .attr("id", "tooltip")
      .style("opacity", 1);

    // var colors = ['#2C7BB6', '#00A6CA', '#00CCBC', '#90EB9D', '#FFFF8C', '#F9D057', '#F29E2E', '#E76818', '#D7191C'];

    var xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, function (d) { return d.bin1 }))
      .range([0, width]);

    var xScaleRef = xScale.copy();

    var yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, function (d) { return d.bin2 }))
      .range([height, 0]);

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

    const zero_rgba = hexToRGB(props.option.series[0].itemStyle.zeroColor, props.option.series[0].itemStyle.opacity)
    const min_rgba = hexToRGB(props.option.series[0].itemStyle.minCountColor, props.option.series[0].itemStyle.opacity)
    const max_rgba = hexToRGB(props.option.series[0].itemStyle.maxCountColor, props.option.series[0].itemStyle.opacity)
    var colorScale = d3.scaleQuantize()
      .range([zero_rgba, min_rgba, max_rgba])
      .domain([0, minCount, maxCount])
      //   .clamp(true)
      .nice(100);

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
    // .style("border", "1px solid #000")

    var crosshairColor = 'rgba(170, 0, 0, 0.80)';
    var crosshairWidth = 3;
    const crosshairVisible = ref(false)
    let canvasOverlay = d3.select(canvasContainer.value)
      .append("canvas")
      .attr("width", width)
      .attr("height", height)
      // .style("box-sizing", "border-box")
      .style("left", margin.left + "px")
      .style("bottom", margin.bottom + "px")
      .style("position", "absolute")
      .on("mousemove", event => mousemove(event))
      .on("mouseout", event => mouseout(event));
    const ctxOverlay = canvasOverlay.node().getContext("2d");
    // ctxOverlay.translate(width / 2, height / 2)
    // ctxOverlay.rotate(Math.PI / 4)
    // ctxOverlay.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))
    ctxOverlay.translate(width / 2, height / 2)
    ctxOverlay.rotate(Math.PI / 4)
    ctxOverlay.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))


    // Function to transform mouse coordinates to transformed canvas coordinates
    function getTransformedCoordinates(mouseX, mouseY) {
      // Invert the transformations: scale, rotate, and translate
      var x = mouseX - width / 2;
      var y = mouseY - height / 2;
      var angle = -Math.PI / 4;
      var scale = Math.sqrt(2);

      var transformedX = x * scale * Math.cos(angle) - y * scale * Math.sin(angle);
      var transformedY = x * scale * Math.sin(angle) + y * scale * Math.cos(angle);

      return { x: transformedX, y: transformedY };
    }

    // Function to draw the crosshair
    function drawCrosshair(ctx, canvas, x, y) {

      var transformedCoords = getTransformedCoordinates(x, y);
      // Save the current transformation matrix
      ctx.save();

      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var endX = width / 2;
      var endY = height / 2;
      // Restore the transformation matrix
      ctx.restore();
      // ctxOverlay.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = crosshairWidth;
      // Horizontal line
      ctx.moveTo(transformedCoords.x, transformedCoords.y);
      ctx.lineTo(width, transformedCoords.y);
      ctx.stroke();
      ctx.beginPath();

      // Vertical line
      ctx.strokeStyle = 'blue'
      ctx.moveTo(transformedCoords.x, transformedCoords.y);
      ctx.lineTo(transformedCoords.x, height);
      ctx.stroke();

      return { x: transformedCoords.x, y: transformedCoords.y }
    }

    // Function to update the crosshair position
    function updateCrosshairPosition(canvas, event) {
      var rect = canvas.getBoundingClientRect();
      var x0 = event.clientX - rect.left;
      var y0 = event.clientY - rect.top;
      const { x, y } = drawCrosshair(ctxOverlay, canvasOverlay.node(), x0, y0);

      // var xy = d3.pointer(event);
      var x1 = Math.round(xScale.invert(x));
      var y1 = Math.round(yScale.invert(y));
      if (x1 > xScaleRef.domain()[1]) x1 = xScaleRef.domain()[1];
      if (x1 < xScaleRef.domain()[0]) x1 = xScaleRef.domain()[0];
      if (y1 > yScale.domain()[1]) y1 = yScale.domain()[1];
      if (y1 < yScale.domain()[0]) y1 = yScale.domain()[0];
      // console.log(x1, y1)
      const d = dataset.filter((item) => { return item.bin1 === x1 && item.bin2 === y1 })
      if (!d[0]) {
        createTooltip(canvas, `${x1 * currentBpResolution.value} - ${y1 * currentBpResolution.value}: 0 `)
      } else {
        // console.log(d[0])
        createTooltip(canvas, `${d[0].bin1 * currentBpResolution.value} - ${d[0].bin2 * currentBpResolution.value}: ${d[0].counts} `)

      }
    }

    const mousemove = (event) => {
      crosshairVisible.value = true;
      updateCrosshairPosition(canvasOverlay.node(), event);
    }

    const mouseout = (event) => {
      if (crosshairVisible.value) {
        canvasOverlay.on("mousemove", null)
        canvasOverlay.on("mouseout", null)
        ctxOverlay.clearRect(0, 0, canvasOverlay.node().width, canvasOverlay.node().height); // Clear the canvas
        crosshairVisible.value = false;
      }
    }

    var svg = d3.select(canvasContainer.value)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + [margin.left, margin.top] + ")");

    var ctx = canvas.node().getContext("2d");

    var k = d3.event ? d3.event.transform.k : 1;
    var dw = dotWidth * k;

    if (type.value === 'triangle') {
      ctx.translate(width / 2, height / 2)
      ctx.rotate(Math.PI / 4)
      ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))

    }

    dataset.forEach(function (d) {
      var x = xScale(d.bin1);
      var y = yScale(d.bin2);
      var fill = colorScale(d.counts);
      ctx.beginPath();
      //  console.log(x, y, dw, dotHeight)

      ctx.rect(x, y, dw, dotHeight);
      ctx.fillStyle = fill;
      // ctx.strokeStyle = fill;
      // ctx.stroke();
      ctx.fill();
    })
  }).catch(
    (err) => { console.log(err) }
  )
}

const option = computed(() => {
  return props.option
})

onMounted(async () => {
  showSpin.value = true
  // const bpResolutions =  straw.hicFile.bpResolutions
  const metaData = await straw.getMetaData()
  let bpResolutions = metaData['resolutions']

  canvasContainer.value.style.height = 200 + 'px'
  watch([() => width.value, () => option.value.series, () => chrom.value, () => start.value, () => end.value], (newStart, newEnd) => {

    let targetResolution = Math.max((end.value - start.value) / width.value, (end.value - start.value) / width.value)
    let zoomIndex = findMatchingZoomIndex(targetResolution, bpResolutions)
    currentBpResolution.value = bpResolutions[zoomIndex]

    canvasContainer.value.innerHTML = ''
    // console.log(bpResolutions[zoomIndex])
    showSpin.value = true
    plotHic(straw, chrom.value, start.value, end.value, chrom.value, start.value, end.value, width.value, height.value, currentBpResolution.value)
    showSpin.value = false


  }, { immediate: true, deep: true });

})
</script>
<style scoped>
.custom-rotate {
  transform: rotate(90deg);
}
</style>