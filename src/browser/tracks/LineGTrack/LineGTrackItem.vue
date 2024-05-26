<template>
    <n-scrollbar  v-if="isVisible">
    
    <div ref="canvasContainer" :style="props.style">
        <!-- <n-scrollbar> -->

        <n-spin :show="showSpin" class="z-500 absolute left-1/2 top-1/2" >
            <div></div>
        </n-spin>    
        <canvas ref="canvasRef"></canvas>
        <canvas ref="canvasOverlay" class="absolute top-0 left-0 z-50"></canvas>
        <canvas ref="yAxisRef" class="absolute top-0 left-0"></canvas>
        <!-- </n-scrollbar> -->

    </div>
</n-scrollbar>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, defineEmits, defineProps } from 'vue';
import { BigWig } from '@gmod/bbi'
import { RemoteFile } from 'generic-filehandle'
import { useElementSize, useMouseInElement } from '@vueuse/core'
import * as d3 from "d3"
import { WebglPlot, ColorRGBA, WebglLine } from "webgl-plot";

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

const option = computed(() => {
    return props.option
})
const emit = defineEmits(['zoomTo'])
const isVisible = ref(true)
const canvasContainer = ref(null)
const canvasRef = ref(null)
const canvasReady = ref(false)
const canvasOverlay = ref(null)
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

const min = computed(
    () => props.location.min
)

const max = computed(
    () => props.location.max
)

const urls = option.value.url.split(/\s*,\s*/)


const { width, height } = useElementSize(canvasContainer)


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

const _makeInitialRequest = (canvasEle, xdata) => {

    var xvalues = [],
        l = start.value,
        r = end.value,
        w = canvasEle.offsetWidth,
        step = (r - l) / w;

    // var ylog = _get(_get(opts._options, "yaxis", {}), "log");
    // const ylog = false
    // for (var k in xdata) {
    //     var values = [],
    //         data = xdata[k];

    //     // modifier
    //     // var negate = _get(opts._sries, k, {}).negate;
    //     const negate = false

    //     for (var i = 0; i < w; i++) {
    //         var v = data[i];
    //         if (ylog && v > 0) v = Math.log(v) / Math.log(ylog);
    //         if (negate) v = -v;
    //         values.push([i * step + l, v]);
    //     }

    //     xvalues.push($.extend(_get(opts._series, k, {}), { data: values }));
    // }
    const xvalues2 = xdata.map(obj => {
        const average = (obj.start + obj.end) / 2;
        const score = obj.score;
        return { pos: average, score: score };
        // return [average,score]
    });

    const xvalues3 = [{
        // color: option.value.series[0].lineStyle.color,
        data: xvalues2
    }]
    // console.log(xvalues3)
    //_drawPlot(canvasEle, xvalues3);
    canvasReady.value = true;

    // const offscreen = canvasEle.transferControlToOffscreen()
    return {
        // canvasEle: canvasEle,
        drawData: xvalues3
    }

}

const files = urls.map(url => {
    const filehandle = new RemoteFile(url)
    return new BigWig({
        filehandle: filehandle
    })
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

// const hexToRGB = hex => {
//     let alpha = false,
//         h = hex.slice(hex.startsWith('#') ? 1 : 0);
//     if (h.length === 3) h = [...h].map(x => x + x).join('');
//     else if (h.length === 8) alpha = true;
//     h = parseInt(h, 16);
//     return (
//         'rgb' +
//         (alpha ? 'a' : '') +
//         '(' +
//         (h >>> (alpha ? 24 : 16)) +
//         ', ' +
//         ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
//         ', ' +
//         ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
//         (alpha ? `, ${h & 0x000000ff}` : '') +
//         ')'
//     );
// };


function generateBusinessStyleRGBA() {
    // Define the range for Red, Green, and Blue to avoid very bright colors
    const maxBrightness = 200;

    // Generate each color component within the business style range
    const red = Math.floor(Math.random() * maxBrightness);
    const green = Math.floor(Math.random() * maxBrightness);
    const blue = Math.floor(Math.random() * maxBrightness);

    // Set a fixed alpha for full opacity or you can set it to be slightly transparent
    const alpha = 1;

    // Return the color in rgba format
    return [red, green, blue]
}

const colorArray = [[109, 30, 188, 1], [83, 2, 133, 1], [145, 102, 182, 1], [22, 135, 171, 1], [179, 119, 70, 1], [157, 97, 7, 1], [185, 119, 15, 1], [21, 95, 167, 1], [125, 129, 22, 1], [98, 21, 183, 1], [151, 47, 124, 1], [24, 27, 154, 1], [61, 89, 16, 1], [27, 100, 79, 1], [74, 131, 59, 1], [6, 148, 16, 1], [159, 76, 130, 1], [163, 143, 44, 1], [140, 181, 120, 1], [64, 38, 8, 1], [72, 49, 188, 1], [87, 27, 64, 1], [84, 84, 64, 1], [103, 130, 150, 1], [186, 127, 196, 1], [136, 153, 87, 1], [144, 169, 95, 1], [86, 176, 22, 1], [193, 181, 177, 1], [164, 118, 170, 1]]
let realColor = []
for (let i = 0; i < files.length; i++) {
    const randomIndex = Math.floor(Math.random() * colorArray.length);
    realColor[i] = colorArray[randomIndex]
}
let color;

const yAxisRef = ref(null)


const formatYAxisLabel = (number) => {
    let absNumber = Math.abs(number);

    // Case 1: If the absolute value of the number is less than 1
    if (absNumber < 1 && absNumber > 0) {
        let stringNumber = absNumber.toString();
        let indexOfFirstNonZero = stringNumber.search(/[^0\.]/);
        // Display up to the first non-zero digit plus one more digit
        return (number < 0 ? '-' : '') + absNumber.toFixed(indexOfFirstNonZero);
    }
    // Case 2: If the absolute value of the number is between 1 and 10
    else if (absNumber >= 1 && absNumber < 10) {
        return (number < 0 ? '-' : '') + absNumber.toFixed(1);
    }
    // Case 3: If the absolute value of the number is greater than or equal to 10
    else {
        // Round the absolute value and apply the sign of the original number
        return (number < 0 ? '-' : '') + Math.round(absNumber).toString();
    }
}

const updateY = (
    ctx2d: CanvasRenderingContext2D,
    width: number,
    height: number,
    yDomain: Array<number>
) => {

    ctx2d.clearRect(0, 0, width, height);
    ctx2d.font = '13px Arial'; // Set the font size to 12 pixels and the font family to Arial

    for (let i = 0; i < 2; i++) {
        const label = i === 0 ? yDomain[1] : yDomain[0];
        // const y = (i / divs) * height;
        const y = i === 0 ? height * 0.22 : height * 0.92;

        ctx2d.fillText(`${formatYAxisLabel(label)}`, 5, y);
        //ctx.fillRect(10, 10, 100, 100);
        // ctx2d.moveTo(width - 10, y);
        // ctx2d.lineTo(width, y);
        // ctx2d.stroke();
    }
};


const { elementX, elementWidth } = useMouseInElement(canvasRef.value)


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

// Function to clear the tooltip by redrawing the canvas
function clearCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function getClosestScore(array, randomPos) {
    let closest = null;
    let minDiff = Infinity;

    array.forEach(obj => {
        let diff = Math.abs(obj.pos - randomPos);
        if (diff < minDiff) {
            minDiff = diff;
            closest = obj;
        }
    });

    return closest ? formatYAxisLabel(closest.score) : null; // Return the score if a closest object is found, otherwise return null
}


function hexToRGB(hex) {
      var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

        return [r,g,b]
    }

let featurePromises;
let yDomain;
onMounted(() => {
    watch([() => option.value.series, () => width.value, () => chrom.value, () => start.value, () => end.value], () => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvasOverlay.value.width = width.value
        canvasOverlay.value.height = height.value
        canvasRef.value.width = width.value
        canvasRef.value.height = height.value
        yAxisRef.value.width = width.value * devicePixelRatio
        yAxisRef.value.height = height.value * devicePixelRatio
        const wglp = new WebglPlot(canvasRef.value);
        wglp.removeAllLines();
        showSpin.value = true

        const scale = calculateScale(start.value, end.value, 1000);

        // An array of Promises that each call file.getFeatures() and return the result
        featurePromises = files.map(file => {
            return file.getFeatures(chrom.value, start.value, end.value, { scale: scale });
        });
       

// console.log(showSpin.value)

        for (let i = 0; i < featurePromises.length; i++) {
            featurePromises[i].then(res => {

                let dat = _makeInitialRequest(canvasContainer.value, res).drawData[0].data

                if (dat.length > 100000) {
                    dat = largestTriangleThreeBucket(dat, 100000, 'pos', 'score')
                }

                let colorA;
                // console.log(realColor)
                if (option.value.series[0].lineStyle.color) {
                    colorA = hexToRGB(option.value.series[0].lineStyle.color)
                } else {
                    colorA = realColor[i]
                }
         
                color = new ColorRGBA(colorA[0] / 255, colorA[1] / 255, colorA[2] / 255, 1)
                const line = new WebglLine(color, dat.length);
                const Y = d3.map(dat, d => d.score);
                yDomain = [d3.min(Y), d3.max(Y)];
                const yScale = d3.scaleLinear(yDomain, [-1, 1]);
                const xDomain = [start.value, end.value];
                const xScale = d3.scaleLinear(xDomain, [-1, 1]);

                // console.log(dat)
                for (let j = 0; j < dat.length; j++) {
                    line.setX(j, xScale(dat[j].pos))
                    line.setY(j, yScale(dat[j].score))
                }
                // console.log(line)
                // add hover event
                // Mouse move event listener
                // console.log(canvasOverlay.value)
                const xScale2 = d3.scaleLinear([0, elementWidth.value], [-1, 1]);

                canvasOverlay.value.addEventListener('mousemove', (event) => {

                    clearCanvas(canvasOverlay.value);
                    // console.log(elementX.value, elementWidth.value)
                    var x1 = Math.round(xScale.invert(xScale2(elementX.value)));
                    const score = getClosestScore(dat, x1)
                    createTooltip(canvasOverlay.value, `pos: ${x1} \n score: ${score}`);
                });
                showSpin.value = false

                wglp.addLine(line)
                function newFrame() {
                    wglp.update();
                    updateY(yAxisRef.value.getContext("2d"), width.value, height.value, yDomain = yDomain);
                    requestAnimationFrame(newFrame);
                }
                requestAnimationFrame(newFrame);


            })

        }

        console.log(showSpin.value)

    }, { immediate: true, deep: true });

    watch([() => option.value.series, () => width.value], ()=> {
        for (let i = 0; i < featurePromises.length; i++) {
            featurePromises[i].then(res => {

                let dat = _makeInitialRequest(canvasContainer.value, res).drawData[0].data

                if (dat.length > 100000) {
                    dat = largestTriangleThreeBucket(dat, 100000, 'pos', 'score')
                }

                let colorA;
                // console.log(realColor)
                if (option.value.series[0].lineStyle.color) {
                    colorA = hexToRGB(option.value.series[0].lineStyle.color)
                } else {
                    colorA = realColor[i]
                }
         
                color = new ColorRGBA(colorA[0] / 255, colorA[1] / 255, colorA[2] / 255, 1)
                const line = new WebglLine(color, dat.length);
                const Y = d3.map(dat, d => d.score);
                yDomain = [d3.min(Y), d3.max(Y)];
                const yScale = d3.scaleLinear(yDomain, [-1, 1]);
                const xDomain = [start.value, end.value];
                const xScale = d3.scaleLinear(xDomain, [-1, 1]);

                // console.log(dat)
                for (let j = 0; j < dat.length; j++) {
                    line.setX(j, xScale(dat[j].pos))
                    line.setY(j, yScale(dat[j].score))
                }
                // console.log(line)
                // add hover event
                // Mouse move event listener
                // console.log(canvasOverlay.value)
                const xScale2 = d3.scaleLinear([0, elementWidth.value], [-1, 1]);

                canvasOverlay.value.addEventListener('mousemove', (event) => {

                    clearCanvas(canvasOverlay.value);
                    // console.log(elementX.value, elementWidth.value)
                    var x1 = Math.round(xScale.invert(xScale2(elementX.value)));
                    const score = getClosestScore(dat, x1)
                    createTooltip(canvasOverlay.value, `pos: ${x1} \n score: ${score}`);
                });
                showSpin.value = false

                wglp.addLine(line)
                function newFrame() {
                    wglp.update();
                    updateY(yAxisRef.value.getContext("2d"), width.value, height.value, yDomain = yDomain);
                    requestAnimationFrame(newFrame);
                }
                requestAnimationFrame(newFrame);


            })

        }

    }
    )
})

</script>