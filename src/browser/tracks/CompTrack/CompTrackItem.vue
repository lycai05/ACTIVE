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
import { RemoteFile } from 'generic-filehandle'
import * as d3 from "d3";
import { BigWig } from '@gmod/bbi'

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

const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)
const showSpin = ref(true)
const chrom = computed(
    () => props.location.chrom
)
const start = computed(
    () => props.location.start
)
const end = computed(
    () => props.location.end
)
const option = computed(() => {
    return props.option
})
const url = props.option.url
const isVisible = ref(false)

function createGenomicVisualization(data, selector, canvasWidth, canvasHeight) {

    const margin = { left: 0, right: 0, top: 0, bottom: 0 }
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

    const minCount = d3.min(data, function (d) { return d.score; })
    const maxCount = d3.max(data, function (d) { return d.score; });
    const maxAbs = Math.max(Math.abs(minCount), Math.abs(maxCount))

    const yScale = d3.scaleLinear()
        .domain([-Math.abs(maxAbs), Math.abs(maxAbs)]) // for simplicity in displaying above/below zero
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

        showSpin.value = false;


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
            let y = d.score > 0 ? canvasHeight / 2 - yScale(d.score) : yScale(0);
            // console.log("y:", y); // Print y position
            return y;
        })
        .attr("height", d => { return yScale(d.score) })
        .attr("fill", d => d.score > 0 ? option.value.series[0].itemStyle.positiveE1Color : option.value.series[0].itemStyle.negativeE1Color)  // Positive scores in green, negative in red
        // .attr('stroke', 'red')
        .each(function (d, i) {
            // Print height for each rectangle
            // console.log("height:", 10); // Since height is fixed, it's always 20
        })
        .on("mouseenter", (evt, d) => {
            tooltip
                .style('opacity', 1)
                .style('top', `${evt.pageY + 10}px`) // Offset by 10px from cursor
                .style('left', `${evt.pageX + 10}px`)
                .html(`<strong>Details:</strong> start=${d.start}, end=${d.end}, E1=${d.score}`);
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
        .style("stroke-dasharray", ("3, 3"))
}

const filehandle = new RemoteFile(url)
const file = new BigWig({
    filehandle: filehandle
})

function calculateScale(start, end, viewportWidth) {
    // Calculate the size of the genomic region
    const regionSize = end - start;

    // Calculate the number of base pairs per pixel that would fit in the viewport
    const bpPerPixel = regionSize / viewportWidth;

    // Set a minimum scale factor of 1, to avoid dividing by 0 or a negative number
    const minScale = 1;

    // Calculate the scale factor based on the number of base pairs per pixel
    const scale = Math.max(minScale, 1 / bpPerPixel);

    return scale;
}
let featurePromise
let data
onMounted(() => {
    watch([ () => chrom.value, () => start.value, () => end.value], () => {
        showSpin.value = true
                    // canvasContainer.value.innerHTML = ''
        const svgs = canvasContainer.value.querySelectorAll('svg');
            svgs.forEach(svg => {
            svg.parentNode.removeChild(svg);
        });
        isVisible.value = true
        const scale = calculateScale(start.value, end.value, 1000)

        featurePromise = file.getFeatures(chrom.value, start.value, end.value, { scale: scale })
        featurePromise.then((res) => {
            data = res
            createGenomicVisualization(res, canvasContainer.value, width.value, height.value)
        })
    }, { immediate: true, deep: true });

    watch([() => width.value, () => option.value.series], ()=> {
        showSpin.value = true
        const svgs = canvasContainer.value.querySelectorAll('svg');
            svgs.forEach(svg => {
            svg.parentNode.removeChild(svg);
        });
        isVisible.value = true

            createGenomicVisualization(data, canvasContainer.value, width.value, height.value)
    }, {deep: true})


})

</script>
<style scoped></style>