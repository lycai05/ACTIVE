<template>
      <div class="relative h-full w-full">

    <n-scrollbar v-if="isVisible">
        <div ref="canvasContainer" class="basic-canvas" :style="props.style">
            <n-spin :show="showSpin" class="z-50 absolute left-1/2 top-1/2" >
                <div></div>
         </n-spin>    
        </div>
    </n-scrollbar>
    <div v-else>
        <div ref="canvasContainer" class="basic-canvas">
            <n-alert title="" type="warning">
                Too many items. Zoom in to see features
            </n-alert>
        </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
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
    dataLoaded: {
        type: Boolean,
        required: false
    },
    style: {
        type: Object,
        required: true
    },
})

const prepad = ref(0)
const postpad = ref(0)
const h = ref(8)
const canvasContainer = ref(null)
const canvas = ref(null)
const showLabel = ref(false)
const label = ref(null)

const { width, height } = useElementSize(canvasContainer)

const showSpin = ref(false)
const chrom = computed(
    () => props.location.chrom
)

const start = computed(
    () => props.location.start
)

const end = computed(
    () => props.location.end
)

const option = computed(()=> {
    return props.option
})

const url = props.option.url
const isVisible = ref(false)
let visibilityWidth = 200000000
const canvasReady = ref(false)


const filteredData = ref([]);

const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})

function createGenomicVisualization(data, selector, canvasWidth, canvasHeight) {

    const margin = {left: 0, right: 0, top: 0, bottom: 0}
    // Select the SVG element based on the selector provided and set dimensions
    let svg = d3.select(canvasContainer.value)
    .append("svg") 
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
        .style("left", margin.left + "px")
  .style("bottom", margin.bottom + "px")
  .style("position", "absolute");

    const innerWidth = canvasWidth - margin.left - margin.right;
    const innerHeight = canvasHeight - margin.top - margin.bottom;

    let g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([start.value, end.value])
        .range([0, canvasWidth]);

    const yScale = d3.scaleLinear()
        .domain([1, -1]) // for simplicity in displaying above/below zero
        .range([canvasHeight, 0]);
// console.log(data, canvasWidth, canvasHeight)
    // Draw rectangles
    // g.selectAll("rect")
    //     .data(data)
    //     .enter()
    //     .append("rect")
    //     .attr("x", d => Math.min(xScale(start.value),xScale(d.start)))
    //     .attr("width", d => xScale(d.end) - xScale(d.start))
    //     .attr("y", yScale(0.8))
    //     .attr("height", 20) // fixed height for rectangles
    //     .attr('fill', 'red')
    //     .attr('stroke', 'black')
        // .attr("fill", d => `rgba(0, 0, 255, ${Math.abs(d.copy) / 10})`); // color based on the copy number
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

        g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => {
        let x = xScale(d.start);
        // console.log("x:", x); // Print x position
        return x;
    })
    .attr("width", d => {
        let width = xScale(d.end) - xScale(d.start);
        // console.log("width:", width); // Print width
        return width;
    })
    .attr("y", d => {
        let y = d.copyNumber > 0 ? yScale(-1) : yScale(0);
        // console.log("y:", y); // Print y position
        return y;
    })
    .attr("height", yScale(0)) // fixed height for rectangles
    .attr('fill', d => {
        // Check copyNumber to determine fill color
        if (d.copyNumber > 0) {
            return option.value.series[0].itemStyle.positiveFill; // Color for positive copyNumber
        } else if (d.copyNumber < 0) {
            return option.value.series[0].itemStyle.negativeFill; // Color for negative copyNumber
        } else {
            return 'gray'; // Color for copyNumber equal to zero
        }
    })
    .attr('stroke', 'none')
    .each(function(d, i) {
        // Print height for each rectangle
        // console.log("height:", 10); // Since height is fixed, it's always 20
    })
    .on("mouseenter", (evt, d) => {
    tooltip
      .style('opacity', 1)
      .style('top', `${evt.pageY + 10}px`) // Offset by 10px from cursor
      .style('left', `${evt.pageX + 10}px`)
      .html(`<strong>Details:</strong> chrom=${d.chrom}, start=${d.start}, end=${d.end}, copyNumber=${d.copyNumber}`);
  })
  .on("mouseout", () => {
    tooltip.style('opacity', 0);
  });

        // Draw dashed line at y = 0
        g.append("line")
        .attr("x1", 0)
        .attr("x2", canvasWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .style("stroke", "gray")
        .style("stroke-width", 0.1)
        .style("stroke-dasharray", ("3, 3"));

    // Add Axes
    // const xAxis = d3.axisBottom(xScale);
    // const yAxis = d3.axisLeft(yScale).ticks(3); // limited ticks for clarity

    // g.append("g").attr("transform", `translate(0,${innerHeight / 2})`).call(xAxis);
    // g.append("g").call(yAxis);
}
// let lines = ref([])

onMounted( () => {
    showSpin.value = true
    // canvasContainer.value.style.height = 200 + 'px'
    // console.log(width.value)

    watch([() => width.value,()=>option.value.series, () => chrom.value,() => start.value, () => end.value], async ( ) => {
        // console.log(width.value)
            // console.log('cnvtracks2222')
            showSpin.value = true

            isVisible.value = true
            // canvasReady.value = false
            let lines = []
            // console.log(chrom.value, start.value, end.value)


            await file.getLines(chrom.value, start.value, end.value, function(line, fileOffset) {
                // console.log(line)
                const arr = line.split(/[\s]+/)
                const addedData = {
                chrom: arr[0],
                start:  Number(arr[1]),
                end:  Number(arr[2]),
                copyNumber: Number(arr[3])
            }
            lines.push(addedData)


            })

// console.log(lines)
            // console.log(lines.value, width.value, height.value)
            canvasContainer.value.innerHTML = ''

            // drawPlotX(canvas.value, lines, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)
            createGenomicVisualization(lines, canvasContainer.value, width.value, height.value)
            // canvasReady.value = true;
            showSpin.value = false;
    }, { immediate: true, deep: true });


    // watch(, () => {
    //     showSpin.value = true
    //     if(width.value>0) {
    //         createGenomicVisualization(lines.value, canvasContainer.value, width.value, height.value)

    //     // drawPlotX(canvas.value, filteredData.value, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)
    //     }
    //     showSpin.value = false;
    // })


})


</script>


<style scoped></style>