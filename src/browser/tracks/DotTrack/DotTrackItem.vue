<template>
  <div class="relative h-full w-full">

    <div v-if="isVisible">
      <div ref="canvasContainer" class="basic-canvas aspect-ratio" :style="props.style">
        <n-spin :show="showSpin" class="absolute left-1/2 top-1/2"><div></div></n-spin>
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
import * as d3 from "d3";
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
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
const url = props.option.url

// const type = ref('square')
const isVisible = ref(true)
const showSpin = ref(false)

const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)
const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})


const type = ref('triangle')
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


const plotHic = (dataset, canvasWidth, canvasHeight) => {

  const minCount = d3.min(dataset, function (d) { return d.score; })
    const maxCount = d3.max(dataset, function (d) { return d.score; });

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
      width = canvasWidth,
      height = canvasWidth;
  // console.log(width, height)
  // console.log(end.value, start.value)
    var tooltip = d3.select("body").append("div")
      .attr("id", "tooltip")
      .style("opacity", 1);

    // var colors = ['#2C7BB6', '#00A6CA', '#00CCBC', '#90EB9D', '#FFFF8C', '#F9D057', '#F29E2E', '#E76818', '#D7191C'];

    var xScale = d3.scaleLinear()
      .domain([start.value,end.value ])
      .range([0, width]);

    var xScaleRef = xScale.copy();

    var yScale = d3.scaleLinear()
      .domain([ start.value, end.value])
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
    // console.log([zero_rgba, min_rgba, max_rgba], [0, minCount, maxCount])
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
    // console.log(canvasOverlay)
    ctxOverlay.translate(width / 2, height / 2)
    ctxOverlay.rotate(Math.PI / 4)
    ctxOverlay.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))
    const mouseout = (event) => {
      if (crosshairVisible.value) {
        ctxOverlay.clearRect(0, 0, canvasOverlay.node().width, canvasOverlay.node().height); // Clear the canvas
        crosshairVisible.value = false;
      }
    }

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
      // console.log(x, y, transformedCoords.x, transformedCoords.y)
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
      // console.log(x, y)

      // var xy = d3.pointer(event);
      var x1 = Math.round(xScale.invert(x));
      var y1 = Math.round(yScale.invert(y));
      // console.log(x,y)
      if (x1 > xScaleRef.domain()[1]) x1 = xScaleRef.domain()[1];
      if (x1 < xScaleRef.domain()[0]) x1 = xScaleRef.domain()[0];
      if (y1 > yScale.domain()[1]) y1 = yScale.domain()[1];
      if (y1 < yScale.domain()[0]) y1 = yScale.domain()[0];
      // console.log(x1, y1)
      const d = dataset.filter((item) => { return (Math.abs((item.start1 +item.end1)/2 - x1) < width/10) && Math.abs(((item.start2 +item.end2)/2 - y1) <width/10) })
      d.map((item) => { console.log(((item.start1 +item.end1)/2 - x1 ) ,((item.start2 +item.end2)/2 - y1 )) })
      if (!d[0]) {
        createTooltip(canvas, `${x1 } - ${y1 }: 0 `)
      } else {
        // console.log(d[0])
        createTooltip(canvas, `${d[0].start1 } - ${d[0].start2 }: ${d[0].score} `)

      }
      // console.log(d)


    }

    const mousemove = (event) => {
      crosshairVisible.value = true;
      updateCrosshairPosition(canvasOverlay.node(), event);
    }

    var svg = d3.select(canvasContainer.value)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + [margin.left, margin.top] + ")");



    var ctx = canvas.node().getContext("2d");

    // canvas.call(zoom);

    // Initial Draw:
    // drawNodes(dataset);

    //Create Axes:
    var renderXAxis = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + yScale(0) + ")")
      .call(xAxis)


    var k = d3.event ? d3.event.transform.k : 1;
    var dw = 1 * k;

    // console.log(width, height)
    // if (type.value === 'triangle') {
      ctx.translate(width / 2, height / 2)
      ctx.rotate(Math.PI / 4)
      ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))

    // }
// console.log(dataset)
    dataset.forEach(function (d) {
      var x = xScale((d.start1 + d.end1)/2);
      var y = yScale((d.start2 + d.end2)/2);
      // var fill = colorScale(d.score);
      const fill = 'red'
      // console.log(x, y, fill)
      ctx.beginPath();
      // console.log(x, y, dw, dotHeight)
      ctx.rect(x, y, 10, 10);
      ctx.fillStyle = fill;
      // ctx.strokeStyle = fill;
      // ctx.stroke();
      ctx.stroke();
    })


    showSpin.value = false

}

// import { useMiddlePanelWidth } from '../../hooks/useLayout'
const option = computed(() => {
  return props.option
})

let lines;
onMounted(async () => {
  watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], async () => {
        const canvases = canvasContainer.value.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            canvas.parentNode.removeChild(canvas);
        });
        showSpin.value = true

        lines = []
        await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
            const splitData = line.split(/;/)
            const arr = splitData[0].split(/[\s,:-]+/)
            const anchor = splitData[1].split(/,/)
            const addedData = {
                chrom: arr[0],
                start1: Number(arr[1]),
                end1: Number(arr[2]),
                chrom2: arr[3],
                start2: Number(arr[4]),
                end2: Number(arr[5]),
                score: Number(arr[6]),
                anchor1: anchor[0],
                anchor2: anchor[1]
            }
            lines.push(addedData)

        })
        // console.log(lines)
        // _makeInitialRequest(canvasContainer.value, lines, width.value)
        //  showSpin.value = true
        // canvasContainer.value.innerHTML = ''

        plotHic(lines, width.value, height.value)
        

    }, { immediate: true, deep: true });

    watch([() => width.value, () => props.style], () => {
      const canvases = canvasContainer.value.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            canvas.parentNode.removeChild(canvas);
        });
        showSpin.value = true
      plotHic(lines, width.value, height.value)
    });

})
</script>
<style scoped>
.custom-rotate {
  transform: rotate(90deg);
}
</style>