<template>
    <div :id="`${props.trackId}` + '-canvascontainer'" ref="canvasContainer" :style="props.style">
        <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
        <!-- <canvas ref="canvasRef" style="width:100%;height:100%;"></canvas> -->
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, defineEmits, defineProps, nextTick } from 'vue';
import { BigWig } from '@gmod/bbi'
import { RemoteFile } from 'generic-filehandle'
import { useElementSize } from '@vueuse/core'
import * as d3 from "d3"
import { spawn, Thread, Transfer } from "threads"
import workerQueue from './WorkerQueue.js'

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
    trackId: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['zoomTo'])

const canvasContainer = ref(null)
const canvasRef = ref(null)
// const canvas = ref(null)
const canvasReady = ref(false)
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

const min = computed(
    () => props.location.min
)

const max = computed(
    () => props.location.max
)

const urls = [props.option.url]
console.log(urls)

const { width, height } = useElementSize(canvasContainer)



// const files = urls.map(url => {
//     const filehandle = new RemoteFile(url)
//     return new BigWig({
//         filehandle: filehandle
//     })
// })

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




// const getbw = (files, chromValue, startValue, endValue, scaleValue) => {

//     const featurePromises = files.map(file => {
//         return file.getFeatures(chromValue, startValue, endValue, { scale: scaleValue });
//     });

//     return Promise.all(featurePromises);
// }

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

import Worker from './drawPlot.js?worker'



// console.log(new URL('./drawPlot.js', import.meta.url))
// const pool = workerpool.pool(new URL('./drawPlot.js', import.meta.url))


const uniqueGroups = urls.length
console.log(uniqueGroups)




async function main(offscreen, url, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin) {


    const getbw = async (offscreen,url, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin ) => {
    console.log('start getbw')
    console.log(widthValue, heightValue)
    const filehandle = new RemoteFile(url)
    const file =  new BigWig({
        filehandle: filehandle
    })
    // const offscreen = new OffscreenCanvas(widthValue, heightValue);
    const context = offscreen.getContext("2d");
    const results = await file.getFeatures(chromValue, startValue, endValue, { scale: scaleValue })//.then((results) => {
    const imageBitmap = drawCustomChart( results, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin,context,offscreen)
    // console.img(imageBitmap)
    return  imageBitmap

    // })
    // console.log(results)

    // return results
}


function drawCustomChart(results, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin,context,offscreen) {
    // console.log('start drawCustomChart')
    
    // console.log(widthValue, heightValue)
    // Use Promise.all() to wait for all the Promises to resolve

    // const mergedData = results.reduce((acc, cur, i) => {
    //     const dataWithGroup = cur.map(d => ({ ...d, group: i }));
    //     return acc.concat(dataWithGroup);
    // }, []);

    // const mergedData = results.flatMap((innerArr, groupIndex) => {
    //     return innerArr.map((item) => {
    //         return { ...item, group: groupIndex + 1 }
    //     })
    // })

    // console.log(mergedData)
    let data = _makeInitialRequest(widthValue, results).drawData[0].data


    if (data.length > 1000) {
        // console.log('>10000')
        data = largestTriangleThreeBucket(data, 1000, 'pos', 'score')
    }
    // console.log(data[0])

    const maxCount = d3.max(data, function (d) { return d.score; });
    const minCount = d3.min(data, function (d) { return d.score; })

    let dotWidth = widthValue / (endValue - startValue)
    let dotHeight = heightValue / 4

    var margin = { top: 0, right: 0, bottom: 0, left: 0 }

    // var tooltip = d3.select("body").append("div")
    //     .attr("id", "tooltip")
    //     .style("opacity", 1)

    // console.log([startValue, endValue], [0, widthValue], [heightValue, 0])

    var xScale = d3.scaleLinear()
        .domain([startValue, endValue])
        .range([0, widthValue])

    // var xScaleRef = xScale.copy();
    // console.log(data)
    // const groups = new Set(data.map(item => item.group));
    // const uniqueGroups = Array.from(groups)

    // console.log(d3.extent(data.map(d => d.group)), [heightValue, 0])



   
    // console.log([zero_rgba, min_rgba, max_rgba], [0, minCount, maxCount])
    var colorScale = d3.scaleQuantize()
        .range([color.zero_rgba, color.min_rgba, color.max_rgba])
        .domain([0, minCount, maxCount])
        .nice(200);

    // var tooltip = d3.select("#canvasContainer").append("div")
    //     .attr("id", "tooltip")
    //     .style("opacity", 0);



    // var context = canvas.node().getContext("2d");
    // context.clearRect(0, 0, widthValue, heightValue);

    // console.log(uniqueGroups)
    // console.log(data)
    data.forEach(function (d) {

        var x = xScale(d.pos);
        // var y = yScale(d.group);
        var fill = colorScale(d.score);
        //  console.log(d.pos,x, y, dotWidth,dotHeight)
        // context.beginPath();
        // console.log(fill)
        context.fillStyle = 'red';
        // console.log(x, y, 1, dotHeight)
        context.fillRect(x, 50, 5, 200);
        // context.fill();
    })
    context.fillStyle = 'red'
    context.fillRect(694.643589617448, 40, 1, 40);
    context.fillRect(30, 40, 1, 40)
    // console.log(offscreen.transferToImageBitmap())
    // console.img(offscreen)
    const imageBitmap=offscreen.transferToImageBitmap()
    return imageBitmap
    // postMessage({imageBitmap:imageBitmap},[imageBitmap]);
 

}
// workerpool.worker({
//     getbw: getbw  });

function largestTriangleThreeBucket(data, threshold, xProperty, yProperty) {
    /**
     * This method is adapted from the 
     * "Largest Triangle Three Bucket" algorithm by Sveinn Steinarsson
     * In his 2013 Masters Thesis - "Downsampling Time Series for Visual Representation"
     * http://skemman.is/handle/1946/15343
     *
     * The MIT License
     *  
     * Copyright (c) 2013 by Sveinn Steinarsson
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     * --------------------------------------------------------------------------------------------------------
     */
    yProperty = yProperty || 0;
    xProperty = xProperty || 1;

    var m = Math.floor,
        y = Math.abs,
        f = data.length;

    if (threshold >= f || 0 === threshold) {
        return data;
    }

    var n = [],
        t = 0,
        p = (f - 2) / (threshold - 2),
        c = 0,
        v,
        u,
        w;

    n[t++] = data[c];

    for (var e = 0; e < threshold - 2; e++) {
        for (var g = 0,
            h = 0,
            a = m((e + 1) * p) + 1,
            d = m((e + 2) * p) + 1,
            d = d < f ? d : f,
            k = d - a; a < d; a++) {
            g += +data[a][xProperty], h += +data[a][yProperty];
        }

        for (var g = g / k,
            h = h / k,
            a = m((e + 0) * p) + 1,
            d = m((e + 1) * p) + 1,
            k = +data[c][xProperty],
            x = +data[c][yProperty],
            c = -1; a < d; a++) {
            "undefined" != typeof data[a] &&
                (u = .5 * y((k - g) * (data[a][yProperty] - x) - (k - data[a][xProperty]) * (h - x)),
                    u > c && (c = u, v = data[a], w = a));
        }

        n[t++] = v;
        c = w;
    }

    n[t++] = data[f - 1];

    return n;
}

const _makeInitialRequest = (widthValue, xdata) => {

    var xvalues = []//,
        // l = start.value,
        // r = end.value,
        // w = widthValue,
        // step = (r - l) / w;

    const xvalues2 = xdata.map(obj => {
        const average = (obj.start + obj.end) / 2;
        const score = obj.score;
        // const group = obj.group
        return { pos: average, score: score };
        // return [average,score]
    });

    const xvalues3 = [{
        // color: props.option.series[0].areaStyle.color,
        data: xvalues2
    }]
    // console.log(xvalues3)
    //_drawPlot(canvasEle, xvalues3);
    // canvasReady.value = true;

    // const offscreen = canvasEle.transferControlToOffscreen()
    return {
        // canvasEle: canvasEle,
        drawData: xvalues3
    }

}
    // const getbw = await spawn(new Worker())
    const imageBitmap = await getbw(offscreen, url, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin)

    // console.log(`2 + 3 = ${sum}`)
    // console.log(imageBitmap)
    // console.log(ctxBitmap)
    // console.img(result.imageBitmap, 1);
    // console.log(await ctxBitmap.transferFromImageBitmap(result.imageBitmap))
    // console.log(result.end)
    // await ctxBitmap.transferFromImageBitmap(result.imageBitmap)
    // await ctxBitmap.drawImage(result.imageBitmap, 100, 100);
    // ctxBitmap.fillStyle = 'red'
    // ctxBitmap.fillRect(694.643589617448, 40, 1, 40);
    // ctxBitmap.fillRect(30, 40, 1, 40)
    // console.img(iageBitmap);

    // console.log('testsssssss')
    await Thread.terminate(getbw)
    // console.log('endddd')
    showSpin = false
    // console.log('endddsssssd')

}
let queue = new workerQueue()

onMounted(() => {
    console.log(canvasContainer.value.offsetHeight)

    for (let i = 0; i < urls.length; i++) {
        console.log(i)
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%'; // set the width of the canvas to the width of the parent
        canvas.style.height = canvasContainer.value.offsetHeight / urls.length + 'px';
        canvas.width = canvasContainer.value.offsetWidth// set the height of the canvas to the calculated height
        canvas.height = canvasContainer.value.offsetHeight / urls.length;
        canvasContainer.value.appendChild(canvas);
    }
    const singleHeight = canvasContainer.value.offsetHeight / urls.length
    // console.log(height.value, urls.length, singleHeight)
    showSpin.value = true;
    const scale = calculateScale(start.value, end.value, 1000);

    watch(
        [() => width.value, () => chrom.value, () => start.value, () => end.value],
        () => {

            if (height.value > 0) {
                showSpin.value = true;
                const scale = calculateScale(start.value, end.value, 1000);
                // console.log(scale);

                // getMultiBw(files, chrom.value, start.value, end.value, scale)
                //     .then(results => {
                //         // console.log('start plotting')
                //         drawCustomChart(results, chrom.value, start.value, end.value, scale, canvasRef.value, width.value, height.value, props, showSpin);
                //         // console.log('end plotting')
                //     })
                //     .catch(error => {
                //         console.log(error);
                //     })


                // const yScale = d3.scaleBand()
                //     // .domain(d3.extent(data.map(d => d.group)))
                //     .domain(Array.from({ length: urls.length }, (_, i) => i + 1))
                //     .range([height.value, 0])

                // var canvas = d3.select(canvasRef.value)
                // // .append("canvas")
                // // .attr("width", widthValue)
                // // .attr("height", heightValue)
                // .style("left", 0 + "px")
                // .style("bottom", 0 + "px")
                // .style("position", "absolute")
                // .style("border", "1px solid #000")
                // const offscreen = canvas.node().transferControlToOffscreen()

                const zero_rgba = hexToRGB(props.option.series[0].itemStyle.zeroColor, props.option.series[0].itemStyle.opacity)
                const min_rgba = hexToRGB(props.option.series[0].itemStyle.minCountColor, props.option.series[0].itemStyle.opacity)
                const max_rgba = hexToRGB(props.option.series[0].itemStyle.maxCountColor, props.option.series[0].itemStyle.opacity)
                const color = {
                    zero_rgba,
                    min_rgba,
                    max_rgba
                }
                for (let i = 0; i < urls.length; i++) {

                    // const canvas = document.createElement('canvas');
                    // canvas.width = width.value; // set the width of the canvas to the width of the parent
                    // canvas.height = height.value / urls.length; // set the height of the canvas to the calculated height
                    // canvasContainer.value.appendChild(canvas); // add the canvas to the parent element
                    // const canvasBitmap = canvasRef.value
                    const canvas = canvasContainer.value.querySelectorAll('canvas')[i];
                    // const ctxBitmap = canvas.getContext('2d');
                    // ctxBitmap.fillStyle = 'red'
                    const offscreen = canvas.transferControlToOffscreen();

                    console.log(offscreen)
                    let url = urls[i]
                    const y = 40
                    // const group = i + 1
                    // console.log(url, y)
                    // pool.proxy()
                    // .then((worker)=>{
                    //     return worker.getbw(offscreen, file, y, chrom.value, start.value, end.value, scale,canvasRef.value, props, showSpin)
                    // })
                    // delete file.renameRefSeqs
                    // console.log(url, y, chrom.value, start.value, end.value, scale, width.value, height.value, color, showSpin.value)
                    // pool.exec('getbw', [url, y, chrom.value, start.value, end.value, scale, color, showSpin.value])
                    // pool.proxy()
                    // .then((worker)=>{
                    //     console.log('start worker')
                    //     return worker.getbw(url, y, chrom.value, start.value, end.value, scale, color, showSpin.value)
                    // })
                    // .then((result)=> {
                    //     ctxBitmap.transferFromImageBitmap(result.data.imageBitmap);

                    // })




                    queue.add(main, { offscreen, url, y, chrom: chrom.value, start: start.value, end: end.value, scale, width: width.value, singleHeight: height.value / urls.length, color, showSpin: showSpin.value },
                        function (res: any) {
                            console.log(res);
                        });
                    // })
                    // pool.exec(getbw, [files,y, chrom.value, start.value, end.value, scale,canvasRef.value, props, showSpin]);
                    // console.log(result);            // do something with the result
                }
            }

        },
        { immediate: true }
    );
});



</script>

