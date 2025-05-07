<template>
  <div class="relative h-full w-full">

    <div v-if="isVisible">
      <div ref="canvasContainer" class="basic-canvas aspect-ratio" >
        <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
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

const chrom1 = computed(
  () => corenavStore.value.chrom
)
const start1 = computed(
  () => corenavStore.value.start
)
const end1 = computed(
  () => corenavStore.value.end
)

let chromSizes = {
  "chrY": 59373566,
  "chrX": 155270560,
  "chr13": 115169878,
  "chr12": 133851895,
  "chr11": 135006516,
  "chr10": 135534747,
  "chr17": 81195210,
  "chr16": 90354753,
  "chr15": 102531392,
  "chr14": 107349540,
  "chr19": 59128983,
  "chr18": 78077248,
  "chrM": 16571,
  "chr22": 51304566,
  "chr20": 63025520,
  "chr21": 48129895,
  "chr7": 159138663,
  "chr6": 171115067,
  "chr5": 180915260,
  "chr4": 191154276,
  "chr3": 198022430,
  "chr2": 243199373,
  "chr1": 249250621,
  "chr9": 141213431,
  "chr8": 146364022
}


// const type = ref('square')
const isVisible = ref(true)
const showSpin = ref(false)

const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)


const straw = new HicStraw({
  url: props.option.url
})



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

const type = ref('square')
const plotHic = (straw, chrom, start, end, chrom1, start1, end1, canvasWidth, canvasHeight, resolution) => {
  console.log(chrom, start, end)
  const newChrom = chrom.replace(/chr/g, '')
  const newChrom1 = chrom1.replace(/chr/g, '')
  // console.log(straw.hicFile)


  // console.log(resolution)
  straw.getContactRecords(
    "NONE",
    { chr: newChrom, start: start, end: end },
    { chr: newChrom1, start: start1, end: end1 },
    "BP",
    resolution
  ).then(function (dataset) {
    console.log(dataset)
    if (dataset.length === 0) {
      console.log("No data in this region")
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
      .domain([0, minCount, , maxCount])
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
    // .on("mousemove", mousemove)
    // .on("mouseout", mouseout);

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

    // if (type.value === 'triangle') {
    //   ctx.translate(width / 2, height / 2)
    //   ctx.rotate(Math.PI / 4)
    //   ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))
    //   // ctx.translate(-width / Math.sqrt(2), -width / Math.sqrt(2))
    //   // ctx.clip()
    // }

    dataset.forEach(function (d) {
      var x = xScale(d.bin1);
      var y = yScale(d.bin2);
      var fill = colorScale(d.counts);
      ctx.beginPath();
      ctx.rect(x, y, dw, dotHeight);
      ctx.fillStyle = fill;
      // ctx.strokeStyle = fill;
      // ctx.stroke();
      ctx.fill();
    })
    // }

    // Mouse movement:
    // function mousemove() {
    //   console.log(mousemove)
    //   var xy = d3.mouse(this);
    //   var x = Math.round(xScale.invert(xy[0]));
    //   var y = Math.round(yScale.invert(xy[1]));

    //   if (x > xScaleRef.domain()[1]) x = xScaleRef.domain()[1];
    //   if (x < xScaleRef.domain()[0]) x = xScaleRef.domain()[0];
    //   if (y > yScale.domain()[1]) y = yScale.domain()[1];
    //   if (y < yScale.domain()[0]) y = yScale.domain()[0];

    //   var index = --x * 74 + y - 1;  // minus ones for non zero indexed x,y values.
    //   var d = dataset[index];
    //   if (!d) return;
    //   $("#tooltip").html("X: " + d.bin1 + "<br/>Y:" + d.bin2 + "<br/>Value:" + Math.round(d.counts * 100) / 100);
    //   var xpos = d3.event.pageX + 10;
    //   var ypos = d3.event.pageY + 20;
    //   $("#tooltip").css("left", xpos + "px").css("top", ypos + "px").animate().css("opacity", 1);
    // }

    // function mouseout() {
    //   $("#tooltip").animate({ duration: 500 }).css("opacity", 0);
    // };



  }).catch(
    (err) => { console.log(err) }
  )




}
// import { useMiddlePanelWidth } from '../../hooks/useLayout'
const option = computed(() => {
  return props.option
})
// const { eleWidth } = useMiddlePanelWidth()
onMounted(async () => {
  // const bpResolutions =  straw.hicFile.bpResolutions
  const metaData = await straw.getMetaData()
  const bpResolutions = metaData['resolutions']
  console.log(bpResolutions)

  // if (type.value === 'triangle') {
  //   canvasContainer.value.style.height = 200 + 'px'
  // } else if (type.value === 'square') {
    canvasContainer.value.style.height = (width.value - 6) + 'px'
  // }


  watch([() => width.value, () => option.value.series, () => chrom.value, () => start.value, () => end.value,
  () => chrom1.value, () => start1.value, () => end1.value], (newStart, newEnd) => {
    // if (type.value === 'square') {
      // console.log(start.value, end.value)
      let targetResolution = Math.max((end.value - start.value) / width.value, (end.value - start.value) / width.value)
      let zoomIndex = findMatchingZoomIndex(targetResolution, bpResolutions)
      canvasContainer.value.innerHTML = ''
      // console.log(bpResolutions[zoomIndex])
      showSpin.value = true
      plotHic(straw, chrom.value, start.value, end.value, chrom.value, start.value, end.value, width.value, height.value, bpResolutions[zoomIndex])
      showSpin.value = false
    // } else if (type.value === 'triangle') {
    //   let targetResolution = Math.max((end.value - start.value) / width.value, (end.value - start.value) / width.value)
    //   let zoomIndex = findMatchingZoomIndex(targetResolution, bpResolutions)
    //   canvasContainer.value.innerHTML = ''
    //   // console.log(bpResolutions[zoomIndex])
    //   showSpin.value = true
    //   plotHic(straw, chrom.value, start.value, end.value, chrom.value, start.value, end.value, width.value, height.value, bpResolutions[zoomIndex])
    //   showSpin.value = false
    // }

  }, { immediate: true, deep: true });

})
</script>
<style scoped>
/* .custom-rotate {
  transform: rotate(90deg);
} */
</style>