<template>
    <div ref="canvasContainer" >
        <canvas ref="canvas"></canvas>
        <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
    </div>
    <div class="slider-container absolute right-16 bottom-20 h-20 flex flex-col">
        <label for="countSlider" class="block">PETCounts:</label>
        <div class="flex">
            <input ref="slider" class="inline-block w-24 -mr-8" type="range" style="transform:rotate(270deg);"
                id="countSlider" name="countSlider" min="10" max="40" value="10" list="countList">
            <datalist id="countList" class="inline-block">
                <option value="10">Low</option>
                <option value="20" class="mt-2">Medium</option>
                <option value="30" class="mt-2">High</option>
                <option value="40" class="mt-2">Very high</option>
            </datalist>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';

import { fetchCurvFileData } from '../../service/base'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'

import { useElementSize } from '@vueuse/core'


const props = defineProps({
    location: {
        type: Object,
        required: true
    },
    option: {
        type: Object,
        required: true
    }
})

const cvs_holder = ref(null)
const canvas = ref(null)
const slider = ref(null)
// const corenavStore = usecorenavStore()
// const { chrom, min, max, start, end, isLoaded, chromSizes, chromBands } = storeToRefs(corenavStore)

const chrom = computed(
    () => props.location.chrom
)

const start = computed(
    () => props.location.start
)

const end = computed(
    () => props.location.end
)
const min = computed(() => props.location.min)
const max = computed(() => props.location.max)

// const chromSizes = computed(() => props.option.chromSizes)
const trackListId = ref(props.sessionId)
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
// watch(() => props.option.chromSizes, (newVal, oldVal) => {
//     console.log('chromSizes changed')
//     console.log(newVal)
//     console.log(oldVal)
// }, { immediate: true })

const url = props.option.url
function processOffsetHook(plot, offset) {
    console.log(offset)

    offset.top = 0;
    offset.bottom = 0;
    offset.left = 0;
    offset.right = 0;
    console.log('plotting offset hooks: ', offset)
    // return offset;
}

const _drawPlot = (canvas, xvalues, steps) => {
    // var opts = this.options;
    // if (!xvalues) xvalues = opts._xvalues;

    // canvas.css({
    //     height: (100),
    //     width: (1152)
    // });
    // console.log(canvas)

    // canvas.style.width = '100%'
    // canvas.style.height = '100%'
    var params = {
        curvy: true,
        opacity: 0.1,
        grid: {
            show: true,
            borderWidth: 1,
            borderColor: '#a0aec0',
            // "minBorderMargin" controls the default minimum margin around the border - it's used to make sure that points aren't accidentally clipped by the canvas edge so by default the value is computed from the point radius.
            minBorderMargin: 0
        },
        xaxis: {
            show: false,
            ticks: 0,
            min: start.value,
            max: end.value
        },
        yaxis: {
            labelWidth: -5,
            font: 26,
            tickFormatter: function (val, axis) {
                if (val / 1000 != 0 && val % 1000 == 0) return (val / 1000) + "k";
                return val;
            }
        }//,
        // hooks: {
        //     processOffset: [processOffsetHook]
        // }
    };

    // extend xaxis/yaxis
    // params.xaxis = $.extend(params.xaxis, _get(opts._options, 'xaxis'));
    // params.yaxis = $.extend(params.yaxis, _get(opts._options, 'yaxis'));

    // var yaxis_log = _get(_get(opts._options, 'yaxis', {}), 'log');
    // if (yaxis_log) {
    //     params.yaxis.tickFormatter = function (val) {
    //         if (val === 0) return 0;
    //         var neg = val < 0 ? -1 : 1;
    //         val = Math.round(Math.pow(yaxis_log, Math.abs(val)));
    //         if (Math.round(val) != val) val = val.toFixed(val < 10 ? 1 : 0);
    //         if (val / 1000 != 0 && val % 1000 == 0) return (val / 1000) + "k";
    //         return val * neg;
    //     };
    // }
    console.log(start.value, end.value, xvalues)
    const plotObj = $.plot(canvas, xvalues, params);
    console.log(plotObj.width(), plotObj.height(), plotObj.offset(), plotObj.getPlotOffset())
}

const _makeInitialRequest = (canvasEle, xdata) => {
    var xvalues = [],
        l = start.value,
        r = end.value,
        w = canvasEle.offsetWidth,

        step = Math.round((r - l) / w);
    console.log(w)
    // var yaxis_log = _get(_get(opts._options, 'yaxis', {}), 'log'),
    //     show_outbound = _get(_get(opts._options, 'outbound', {}), 'show', false);
    let yaxis_log = false,
        show_outbound = false
    console.log(xdata)
    // for (var k in xdata) {
    var values = [], data = xdata;

    for (var i in data) {
        var d = data[i];
        if (d.chrom != d.chrom2) continue; // skip inter-chrom

        var m = (d.start + d.end) / 2,
            n = (d.start2 + d.end2) / 2;

        if (yaxis_log) {
            d.score = Math.log(d.score) / Math.log(yaxis_log);
        }

        // if show_outbound=false, only show those that strictly within the viewing range
        var modif = (Math.min(m, n) < l || Math.max(m, n) > r) ? -1 : 1;
        if (show_outbound) {
            values.push([Math.min(m, n), Math.max(m, n), d.score * modif]);
        } else {
            if (modif >= 0) values.push([Math.min(m, n), Math.max(m, n), d.score]);
        }
    }

    var fillColor = 'transparent',
        strokeColor = 'red'

    switch (strokeColor.toLowerCase()) {
        case 'auto':
            strokeColor = fillColor; break;
        case 'off':
        case 'false':
            strokeColor = null; break;
    }

    xvalues.push({
        color: fillColor,
        strokeColor: strokeColor,
        data: values.sort(function (p, q) { return q[2] - p[2]; })
    });
    // }


    console.log(xvalues)

    _drawPlot(canvasEle, xvalues, step);
}


function _get(dict, key, altval) {
    return (dict == null) ? altval : (dict[key] == null ? altval : dict[key]);
}

// import the gene annotation file from the server
// const tracksStore = usetracksStore()

// const data = ref([]);
const filteredData = ref([]);
const cacheKey = ref('');
// const url = '/data/BASIC_HBAD5RP_FKDL190764711-1a.e500.clusters.cis.chiasig.txt';
// const url = '/data/BASIC_HBAD5RP_FKDL190764711-1a.e500.clusters.cis.chiasig.sample.txt'
const filename = url.substring(url.lastIndexOf('/') + 1);

const filterData = (d) => {
    // console.log(data.value)
    filteredData.value = d.filter(item => {
        return item.chrom == chrom.value && item.start >= start.value && item.end2 <= end.value;
    });
};

const leftDragBound = ref(0)
const rightDragBound = computed(() => {
    if (canvas.value) {

        return canvas.value.offsetWidth;
    }
    return null
})

// Total chromView width in pixel
const pixelWidth = computed(() => {
    return rightDragBound.value - leftDragBound.value;
})

let bpWidth = computed(() => {
    return end.value - start.value;
})

const BpToPixelLocation = (bp, bpWidth) => {
    const ratio = pixelWidth.value / bpWidth
    return Math.round((bp - min.value) * ratio) + leftDragBound.value
}

// var data = [
//     { position1: 2132140, key: "chr1", position2: 124124200, counts: 10 },
//     { position1: 12424, key: "chr2", position2: 12412400, counts: 20 },
//     { position1: 114212400, key: "chr18", position2: 84422400, counts: 30 },
//     { position1: 144242200, key: "chr19", position2: 82424200, counts: 40 }
// ];


// const drawCanvas = (chomSizes, canvas) => {




var startingAngle = Math.PI;
var endingAngle = 0;
var counterclockwise = true;
var gapAngle = 0.02; // Adjust this value to change the size of the gap
// const { width, height } = useElementSize(canvasContainer)

// Create the slider element
// var slider = document.createElement("input");
// slider.value.type = "range";
// slider.value.min = 10;
// slider.value.max = 40;
// slider.value.value = 10;
// slider.value.style.width = "100%";
// slider.value.style.marginBottom = "20px";

// Append the slider element to the parent element of the canvas
// var parentElement =
// cvs_holder.value.appendChild(slider);

// Map the counts to a color value
function mapCountsToColor(counts) {
    let minCounts = 10;
    let maxCounts = 40;
    let minColor = [250, 250, 250]; // yellow
    let maxColor = [42, 72, 88]; // dark blue

    // Scale the counts to the range of 0-1
    let scaledCounts = (counts - minCounts) / (maxCounts - minCounts);

    // Interpolate between the minColor and maxColor based on the scaled counts
    let color = [
        Math.round(minColor[0] + (maxColor[0] - minColor[0]) * scaledCounts),
        Math.round(minColor[1] + (maxColor[1] - minColor[1]) * scaledCounts),
        Math.round(minColor[2] + (maxColor[2] - minColor[2]) * scaledCounts)
    ];

    return "rgb(" + color.join(",") + ")";
}

// }
const distanceToCurve = (x, y, x1, y1, cx1, cy1, cx2, cy2, x2, y2) => {
    // Calculate the distance from the point to each point on the curve
    let d1 = distance(x, y, x1, y1);
    let d2 = distance(x, y, x2, y2);
    let d3 = distanceToQuadraticBezier(x, y, x1, y1, cx1, cy1, x2, y2);
    let d4 = distanceToQuadraticBezier(x, y, x2, y2, cx2, cy2, x1, y1);

    // Find the minimum distance
    return Math.min(d1, d2, d3, d4);
}

const distance = (x1, y1, x2, y2) => {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceToQuadraticBezier(x, y, x1, y1, cx, cy, x2, y2) {
    // Adapted from: https://stackoverflow.com/a/6853926/4016261
    let qx = quadraticBezier(x, x1, cx, x2);
    let qy = quadraticBezier(y, y1, cy, y2);
    return distance(x, y, qx, qy);
}

function quadraticBezier(t, p0, p1, p2) {
    // Adapted from: https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves
    let u = 1 - t;
    return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

const bezier = (t, p0, p1, p2, p3) => {
    // Adapted from: https://pomax.github.io/bezierinfo/#explanation
    let c0 = (1 - t) * (1 - t) * (1 - t);
    let c1 = 3 * (1 - t) * (1 - t) * t;
    let c2 = 3 * (1 - t) * t * t;
    let c3 = t * t * t;
    return c0 * p0 + c1 * p1 + c2 * p2 + c3 * p3;
}

const displayLabels = (data, x1, y1, x2, y2) => {
    // Display the labels for position1 and position2
    let position1Label = document.createElement('div');
    position1Label.textContent = data.position1;
    position1Label.style.position = 'absolute';
    position1Label.style.left = x1 + 'px';
    position1Label.style.top = y1 - 20 + 'px';
    document.body.appendChild(position1Label);

    let position2Label = document.createElement('div');
    position2Label.textContent = data.position2;
    position2Label.style.position = 'absolute';
    position2Label.style.left = x2 + 'px';
    position2Label.style.top = y2 - 20 + 'px';
    document.body.appendChild(position2Label);
}



const transformedData = function (data) {
    return data.map(item => {
        const position1 = (item.start + item.end) / 2
        const position2 = (item.start2 + item.end2) / 2
        const counts = item.score
        return { position1, key: item.chrom2, position2, counts }
    })
}


const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})

const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)

onMounted(() => {

    ///console.log(totalValue)



    const scale = 2
    // canvas.value.width = parseInt(window.getComputedStyle(canvas.value).getPropertyValue("width"), 10) - 50
    // canvas.value.height = parseInt(window.getComputedStyle(canvas.value).getPropertyValue("width"), 10) / 2 + 3
    watch([()=>width.value,() => chrom.value, () => start.value, () => end.value], async () => {
    if (width.value > 0) {
        canvasContainer.value.style.height = (width.value/2 ) + 'px'
        canvas.value.width = width.value
        canvas.value.height = width.value / 2
        canvas.value.style.height = (width.value/2) + 'px'
        // var canvas = document.getElementById("my-canvas");
        var context = canvas.value.getContext("2d");
        console.log(canvas.value.width)
        console.log(canvas.value.height)
        console.log(canvas.value.style.height)
        var centerX = canvas.value.width / 2;
        var centerY = 0
        var radius = canvas.value.width / 2 - 6;

        const drawChrom = (context, data, chromSizes, colors) => {
            const colors2 = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080", "#4B0082", "#FFC0CB", "#FFD700", "#FFFACD", "#00FF7F", "#ADD8E6", "#87CEFA", "#FA8072", "#DDA0DD", "#708090"]
            let resultAngles = []
            let startingAngle = Math.PI;
            let endingAngle = 0
                ;
            var totalValue = 0;
            for (let chrom in chromSizes) {
                totalValue += chromSizes[chrom];
            }

            for (let i in chromSizes) {

                var value = chromSizes[i];
                // console.log(value)
                var angle = (value / totalValue) * (Math.PI - gapAngle * (data.length - 1));
                endingAngle = startingAngle - angle;

                // Draw the arc
                context.beginPath();
                context.arc(centerX, centerY, radius, startingAngle, endingAngle, counterclockwise);
                context.lineWidth = 6;
                const randomIndex = Math.floor(Math.random() * colors2.length);
                context.strokeStyle = colors2[randomIndex];
                colors2.splice(randomIndex, 1); // Remove the selected value from the array

                context.stroke();

                // draw labels
                const midAngle = startingAngle - angle / 2;
                const labelRadius = radius + 20;
                const x = centerX + labelRadius * Math.cos(midAngle);
                const y = centerY + labelRadius * Math.sin(midAngle);
                const labelAngle = midAngle - Math.PI / 2; // Calculate the angle of the label
                context.save(); // Save the current context state
                context.translate(x, y); // Translate the context to the label position
                context.rotate(labelAngle); // Rotate the context to the label angle
                context.font = "16px Arial";
                context.fillStyle = "#000";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(i, 0, 0); // Draw the label at (0, 0) in the rotated context
                context.restore(); // Restore the previous context state

                resultAngles.push({
                    key: i,
                    startingAngle: startingAngle,
                    endingAngle: endingAngle
                })

                startingAngle = endingAngle - gapAngle;
            }

            return resultAngles
        }

            let lines = []
            console.log(url)
            await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
                // console.log(line)
                // const splitData = line.split(/;/)
                const arr = line.split(/[\s,:-]+/)
                // const anchor = splitData[1].split(/,/)
                const addedData = {
                    chrom: arr[0],
                    start: Number(arr[1]),
                    end: Number(arr[2]),
                    chrom2: arr[3],
                    start2: Number(arr[4]),
                    end2: Number(arr[5]),
                    score: Number(arr[6]),
                    // anchor1: anchor[0],
                    // anchor2: anchor[1]
                }
                lines.push(addedData)

            })
            // filterData(d);
            console.log(lines)
            let data = lines.filter(item => {
                return item.chrom != item.chrom2;
            });
            console.log(data)
            data = transformedData(data)
            // { position1: 2132140, key: "chr1", position2: 124124200, counts: 10 },
            console.log(data)

            for (let i = 0; i < data.length; i++) {
                const chromosome = data[i].key;
                const chromosomeLength = chromSizes[chromosome]
                // data[i].position2_ratio = data[i].position2 / chromosomeLength;
                // data[i].position1_ratio = BpToPixelLocation(data[i].position1) / pixelWidth.value
                data[i].position2_ratio = BpToPixelLocation(data[i].position2, chromosomeLength);
                data[i].position1_ratio = BpToPixelLocation(data[i].position1, bpWidth.value)
            }
            console.log(data)

            const resultAngles = drawChrom(context, data, chromSizes)


            // Add an event listener to the slider element
            // slider.value.addEventListener("input", function () {
                // Clear the canvas
                // context.clearRect(0, 0, canvas.value.width, canvas.value.height);
                // drawChrom(context, data, chromSizes)
                // Filter and redraw the curves based on the slider value
                // let minCounts = parseInt(this.value);
                // console.log(minCounts)

                let minCoutns = 1
                for (let i = 0; i < data.length; i++) {
                    // let startingAngle = Math.PI;
                    // let endingAngle = 0;
                    let position2 = data[i].position2;
                    const chromSize = chromSizes[data[i].key]
                    const startingAngle = resultAngles.find(d => d.key === data[i].key).startingAngle
                    const endingAngle = resultAngles.find(d => d.key === data[i].key).endingAngle
                    // let angle = (position2 / totalValue) * (Math.PI - gapAngle * (data.length - 1));
                    let angle = (endingAngle - startingAngle) * (position2 / chromSize) + startingAngle
     
                    if (data[i].counts >= 0) {
                        // Calculate the start and end points of the curve
                        let x1 = data[i].position1_ratio;
                        let y1 = centerY;
                        let x2 = centerX + Math.cos(angle) * radius;
                        let y2 = centerY + Math.sin(angle) * radius;

                        // context.fillStyle = "red"
                        // context.beginPath();
                        // context.arc(x1, y1, 10, 0, 2 * Math.PI);
                        // context.fill()

                        // context.fillStyle = "green"
                        // context.beginPath();
                        // context.arc(x2, y2, 10, 0, 2 * Math.PI);
                        // context.fill()

                        // Calculate the control points of the curve
                        let cx1 = (x1 + x2) / 2 - (y2 - y1) * 0.1;
                        let cy1 = (y1 + y2) / 2 - (x2 - x1) * 0.1;
                        let cx2 = (x1 + x2) / 2 + (y2 - y1) * 0.1;
                        let cy2 = (y1 + y2) / 2 + (x2 - x1) * 0.1;

                        // Map the counts to the color of the curve
                        let color = mapCountsToColor(data[i].counts);

                        // Draw the curve with the mapped color
                        // context.beginPath();
                        // context.moveTo(x1, y1);
                        // context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
                        // context.lineWidth = 1;
                        // context.strokeStyle = color;
                        // context.stroke();



                        // canvas.value.addEventListener('mousemove', function (event) {
                        //     console.log('canvas mousemove')
                        //     let rect = canvas.value.getBoundingClientRect();
                        //     let mouseX = event.clientX - rect.left;
                        //     let mouseY = event.clientY - rect.top;
                        //     console.log(mouseX, mouseY)
                        //     let labelRadius = 20; // The radius within which to display the labels

                        //     // Calculate the distance between the mouse position and the curve
                        //     let distance = distanceToCurve(mouseX, mouseY, x1, y1, cx1, cy1, cx2, cy2, x2, y2);
                        //     console.log('distance: ', distance)
                        //     // If the distance is within the threshold, display the labels
                        //     if (distance < labelRadius) {
                        //         displayLabels(data[i], x1, y1, x2, y2);
                        //     }
                        // });



                    }
                    // startingAngle = endingAngle - gapAngle;

                }
            // });
            // drawChrom(context, data, chromSizes)
    }

}, { immediate: true });

})

</script>