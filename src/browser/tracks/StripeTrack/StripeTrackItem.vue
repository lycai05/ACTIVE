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
    // var tooltip = d3.select("body").append("div")
    //   .attr("id", "tooltip")
    //   .style("opacity", 1);

    // var colors = ['#2C7BB6', '#00A6CA', '#00CCBC', '#90EB9D', '#FFFF8C', '#F9D057', '#F29E2E', '#E76818', '#D7191C'];

    var xScale = d3.scaleLinear()
      .domain([start.value,end.value ])
      .range([0, width]);


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

    // SVG & Canvas:
    // var canvas = d3.select(canvasContainer.value)
    //   .append("canvas")
    //   .attr("width", width)
    //   .attr("height", height)
    //   // .style("box-sizing", "border-box")
    //   .style("left", margin.left + "px")
    //   .style("bottom", margin.bottom + "px")
    //   .style("position", "absolute")
    // // .style("border", "1px solid #000")

    // var ctx = canvas.node().getContext("2d");


    //   ctx.translate(width / 2, height / 2)
    //   ctx.rotate(Math.PI / 4)
    //   ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2))

    // dataset.forEach(function (d) {
    //   var x1 = xScale(d.x1);
    //   var y1 = yScale(d.y1);
    //   var x2 = xScale(d.x2);
    //   var y2 = yScale(d.y2);
    //   const height = y2 - y1
    //   const width = x2 - x1
    //   // var fill = colorScale(d.score);
    //   const fill = 'red'
    //   console.log(x1, y1, width, d.y2-d.y1, d.x2-d.x1, height, fill)
    //   ctx.beginPath();
    //   // console.log(x, y, dw, dotHeight)
    //   ctx.rect(x1, y1, width, height);
    //   ctx.fillStyle = fill;
    //   // ctx.strokeStyle = fill;
    //   // ctx.stroke();
    //   ctx.stroke();
    // })

// Assuming d3 and the data are properly imported and set up
var svg = d3.select(canvasContainer.value)
  .append("svg") // Append an SVG element
  .attr("width", width) // Set the width
  .attr("height", height) // Set the height
  .style("left", margin.left + "px")
  .style("bottom", margin.bottom + "px")
  .style("position", "absolute");


  // const container = html`<div>
  // <style>.tooltip {
  //   font: sans-serif 12pt;
  //   background: #eeeeeeee;
  //   pointer-events: none;
  //   border-radius: 2px;
  //   padding: 5px;
  //   position: absolute;
  //   top: 0px;
  //   left: 0px;
  //   z-index: 1;

  // }</style>

  // <div class="tooltip"></div>
  // ${svg.node()}

  // </div>`


  // var tooltip = d3.select(canvasContainer.value)
  //   .append("div")
  //   .style("opacity", 0)
  //   .attr("class", "tooltip")
  //   .style("background-color", "white")
  //   .style("border", "solid")
  //   .style("border-width", "2px")
  //   .style("border-radius", "5px")
  //   .style("padding", "5px")
  //   .style("position", "absolute")
  //   .style("z-index", "10")
  //   .style("font-size", "12px")
  //   .style("font-family", "sans-serif")
  //   .style("pointer-events", "none")
  //   .style("top", "0px")
  //   .style("left", "0px");


  // Three function that change the tooltip when user hover / move / leave a cell
  // var mouseover = function(d) {
  //   tooltip
  //     .style("opacity", 1)
  //   d3.select(this)
  //     .style("stroke", "black")
  //     .style("opacity", 1)
  // }
  // var mousemove = function(d) {
  //   tooltip
  //     .html("The exact value of<br>this cell is: " + d.x1)
  //     .style("left", (d3.pointer(this)[0]+70) + "px")
  //     .style("top", (d3.pointer(this)[1]) + "px")
  // }
  // var mouseleave = function(d) {
  //   tooltip
  //     .style("opacity", 0)
  //   d3.select(this)
  //     .style("stroke", "none")
  //     .style("opacity", 0.8)
  // }


  // // We wrap the SVG with a container that has the html element above it
  // var tooltip = d3.select("g").append("div")	
  //   .attr("class", "tooltip")				
  //   .style("opacity", 0);


// // Create a group element to apply transformations
var g = svg.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(45) scale(" + 1 / Math.sqrt(2) + ")");


  // A selection for the tooltip
  // const tooltip = d3.select(container).select(".tooltip");

// Add tooltip div to the body or another suitable container
var tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('position', 'absolute')
  .style('pointer-events', 'none')
  .style('font', '12pt sans-serif')
  .style('background', 'black')
  .style('border-radius', '2px')
  .style('padding', '5px')
  .style('z-index', '10');

// Draw rectangles for each data point
g.selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", d => Math.min(xScale(d.x1), xScale(d.x2)))
  .attr("y", d => Math.min(yScale(d.y1), yScale(d.y2)))
  .attr("width", d => Math.abs(xScale(d.x2) - xScale(d.x1)))
  .attr("height", d => Math.abs(yScale(d.y2) - yScale(d.y1)))
  .attr("fill", option.value.series[0].itemStyle.stripeFill)
  .attr("opacity", option.value.series[0].itemStyle.stripeOpacity)
  .on("mouseenter", (evt, d) => {
    tooltip
      .style('opacity', 1)
      .style('top', `${evt.pageY + 10}px`) // Offset by 10px from cursor
      .style('left', `${evt.pageX + 10}px`)
      .html(`<strong>Details:</strong> x1=${d.x1}, x2=${d.x2}, y1=${d.y1}, y2=${d.y2}`);
  })
  .on("mouseout", () => {
    tooltip.style('opacity', 0);
  });

}
// import { useMiddlePanelWidth } from '../../hooks/useLayout'
const option = computed(() => {
  return props.option
})
// const { eleWidth } = useMiddlePanelWidth()
onMounted(async () => {
  watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], async () => {
        showSpin.value = true
        let lines = []
        await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
            const splitData = line.split(/,/)
            const arr = splitData[0].split(/[\s,:-]+/)
            const anchor = splitData[1].split(/,/)
            const addedData = {
                chrom: arr[0],
                x1: Number(arr[1]),
                x2: Number(arr[2]),
                y1: Number(arr[4]),
                y2: Number(arr[5]),
                score: Number(arr[6])
            }
            lines.push(addedData)

        })
        // _makeInitialRequest(canvasContainer.value, lines, width.value)
        showSpin.value = true
        // canvasContainer.value.innerHTML = ''
        const svgs = canvasContainer.value.querySelectorAll('svg');
            svgs.forEach(svg => {
            svg.parentNode.removeChild(svg);
        });
        plotHic(lines, width.value, height.value)
        showSpin.value = false

    }, { immediate: true, deep: true });

    watch([() => width.value, () => props.style], () => {
 
    });

})
</script>

<style scoped>
.custom-rotate {
  transform: rotate(90deg);
}

</style>