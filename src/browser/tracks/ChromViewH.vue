<template>
    <div class="track-item mb-4 flex" ref="content">
        <div ref="cvs_holder" class="relative track-content flex-auto mr-2" style="min-width: 500px;overflow: hidden">
            <!-- the canvas element -->
            <!-- https://stackoverflow.com/questions/38382734/flex-items-not-shrinking-when-window-gets-smaller -->
            <div ref="canvasContainer">
                <div style="height: 45px" ref="overview"></div>
                <template v-if="type === 'full'">
                    <div style="height: 45px" ref="zoomIn"></div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref, watch, useAttrs } from 'vue';
import { BASIC_intComma } from '../utils/utils.js'
import { useElementSize } from '@vueuse/core'

const props = defineProps({
    labelWidth: {
        type: Number,
        default: 0,
        required: true
    },
    isSelectorVisible: {
        type: Boolean,
        default: false,
        required: true
    },
    type: {
        type: String,
        default: 'full',
        required: true
    },
    chrom: {
        type: String,
        required: true
    },
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    },
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    chromSizes: {
        type: Object,
        required: true
    },
    chromNames: {
        type: Array,
        required: true
    },
    chromBands: {
        type: Object,
        required: false
    }
    //     style: {
    //     type: Object,
    //     required: true    
    // }
})
const emit = defineEmits(['update:chrom', 'updateStart', 'updateEnd', 'update:min', 'update:max', 'shift', 'zoomIn', 'zoomOut', 'zoomTo'])
const attrs = useAttrs()

// const corenavStore = usecorenavStore()

// const { chrom,  isLoaded, chromSizes, chromBands } = storeToRefs(corenavStore)
const overview = ref(null)
const zoomIn = ref(null)

const type = ref(props.type)
const chromNames = ref(
    () => props.chromNames
)

let cytoband = null
const chromBands= ref(null)

if (props.chromBands) {
    chromBands.value = props.chromBands
    cytoband = true
} else {
    cytoband = false
}
const chromSizes = ref(props.chromSizes)

const chrom = computed(
    () => props.chrom
)
let oldChrom = chrom.value
const start = computed(
    () => props.start
)

const end = computed(
    () => props.end
)
const max = computed(
    () => props.max
)

const min = computed(
    () => props.min
)


const canvasContainer = ref(null)

const labelWidth = computed(() => props.labelWidth)
const id = ref(attrs.id)

const _colorCodes = {
    gpos100: 'rgb(0,0,0)',
    gpos: 'rgb(0,0,0)',
    gpos75: 'rgb(130,130,130)',
    gpos66: 'rgb(160,160,160)',
    gpos50: 'rgb(200,200,200)',
    gpos33: 'rgb(210,210,210)',
    gpos25: 'rgb(200,200,200)',
    gvar: 'rgb(220,220,220)',
    gneg: 'rgb(255,255,255)',
    acen: 'rgb(217,47,39)',
    stalk: 'rgb(100,127,164)'
}

function _translate_chrome_bands(chromBands, width) {
    let _colors = []
    // Translate each chromosome band into a list of colors
    for (var i in chromBands) {
        var band = chromBands[i],
            ratio = width / band.size,
            colors = [];
        for (var j = 0; j < width; j++) colors.push(0); // fill with zeroes
        for (var k in band.p) { // P part of chrom
            var p = band.p[k];
            if (p.l < 0 || p.r > band.size) {
                console.log("error: chromosome band " + band.name + " out of bounds");
                return;
            }
            for (var x = Math.round(p.l * ratio); x <= Math.round(p.r * ratio); x++)
                colors[x] = p.c; // color code
        }
        for (var k in band.q) { // Q part of chrom
            var q = band.q[k];
            if (q.l < 0 || q.r > band.size) {
                console.log("error: chromosome band " + band.name + " out of bounds");
                return;
            }
            for (var x = Math.round(q.l * ratio); x <= Math.round(q.r * ratio); x++)
                colors[x] = q.c; // color code
        }
        _colors[band.name] = colors;
    }

    return _colors
}

function filterData(data, a, b) {
    return data.map(innerList => {
        const pairs = innerList.filter(pair => {
            const num = pair[0];
            return num >= a && num <= b;
        });
        return pairs
    });
}

let zoomInPlot = ref(null)
let overviewPlot = ref(null)

let options;
// let xvalues = []

// const initData = function(chromBands, width, chromSizes, chrom, max, min) {
//     const _colors = _translate_chrome_bands(chromBands, width)
//     console.log(_colors)
//     const w = _colors[chrom].length,
//         skip = (max - min) / w;

//     var ratio2 = (max - min) / chromSizes[chrom],
//         l2 = w * min / chromSizes[chrom];

//     var colcodes = []

//     for (const i in _colorCodes) {
//         const ccode = _colorCodes[i],
//             colors = _colors[chrom],
//             values = [];

//         colcodes.push(ccode);

//         for (var j = 0; j < w; j++) {
//             values.push([j * skip + min, colors[Math.round(l2 + j * ratio2)] == i ? 1 : 0]);
//         }
//         xvalues.push(values);
//     }

//     return {
//         xvalues, colcodes
//     }
// }

function drawChrom(chrom, min, max, chromSizes, chromBands, width, _colorCodes, cytoband = true) {
    // const chrom = corenavStore.position.chrom
    // const { min, max } = corenavStore.position
    // console.log('width: ', width)

    // console.log(xvalues)
    // const {xvalues, colcodes} = initData(chromBands, width, chromSizes, chrom, max, min)
    let colcodes = []
    let xvalues = []

    if (cytoband === true) {
        const _colors = _translate_chrome_bands(chromBands, width)
        const w = _colors[chrom].length,
            skip = (max - min) / w;

        var ratio2 = (max - min) / chromSizes[chrom],
            l2 = w * min / chromSizes[chrom];


        for (const i in _colorCodes) {
            const ccode = _colorCodes[i],
                colors = _colors[chrom],
                values = [];

            colcodes.push(ccode);

            for (var j = 0; j < w; j++) {
                values.push([j * skip + min, colors[Math.round(l2 + j * ratio2)] == i ? 1 : 0]);
            }
            xvalues.push(values);
        }
    } else {

        colcodes.push('rgb(0, 0, 0)')
        xvalues.push([[0, 0], [chromSizes[chrom], 0]])
    }

    options = {
        legend: {
            show: false
        },
        series: {
            lines: {
                lineWidth: 0,
                fill: 0.6,
                steps: true
            }
        },
        xaxis: {
            min: min,
            max: max,
            tickDecimals: 0,
            minTickSize: 1,
            tickFormatter: function (val, axis) {
                return BASIC_intComma(val);
            },
            // autoScale: "none"
        },
        yaxis: {
            labelWidth: -5,
            ticks: 0,
            max: 0.05,
            // autoScale: "none",
        },
        selection: {
            mode: "x",
            color: 'orange',
            shape: "round",
            minSize: 0
        },
        colors: colcodes
    }

    if (type.value === 'full') {
        zoomInPlot.value = $.plot(zoomIn.value, xvalues, options);
        $(zoomIn.value).bind("plotselected", function (event, ranges) {
console.log(ranges.xaxis)
            // clamp the zooming to prevent eternal zoom

            if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
                ranges.xaxis.to = ranges.xaxis.from + 0.00001;
            }

            if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
                ranges.yaxis.to = ranges.yaxis.from + 0.00001;
            }

            // do the zooming
            let filteredData = filterData(xvalues, ranges.xaxis.from, ranges.xaxis.to)
            // console.log(filteredData)
            // start.value =  ranges.xaxis.from
            // end.value =  ranges.xaxis.to
            emit('zoomTo', chrom, ranges.xaxis.from, ranges.xaxis.to)
            console.log(ranges)
            // zoomInPlot.value  = $.plot(zoomIn.value, filteredData,
            //     $.extend(true, {}, options, {
            //         xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
            //         yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
            //     })
            // );


            // don't fire event on the overview to prevent eternal loop
            // console.log(ranges)
        });
    }
    // console.log(colcodes)
    // console.log(xvalues)
    overviewPlot.value = $.plot(overview.value, xvalues, options);

    $(overview.value).bind("plotselected", function (event, ranges) {
        emit('zoomTo', chrom, ranges.xaxis.from, ranges.xaxis.to)
        console.log(chrom, ranges.xaxis.from, ranges.xaxis.to)
        // zoomInPlot.value.setSelection(ranges);
        
    });

    return xvalues
}

// const plotObj = ref(null)

const content = ref(null);
const leftDragBound = ref(0)
const rightDragBound = computed(() => {
    if (content.value) {

        return content.value.offsetWidth;
    }
    return null
})

// Total chromView width in pixel
const pixelWidth = computed(() => {
    return rightDragBound.value - leftDragBound.value;
})
// window.removeEventListener('mouseup', handleMouseUp)


const { width } = useElementSize(canvasContainer)
// const { width, height } = useWindowSize()
// const LayoutStore = useLayoutStore()


onMounted(() => {
    let xvalues = drawChrom(chrom.value, min.value, max.value, chromSizes.value, chromBands.value, pixelWidth.value, _colorCodes, cytoband);
    console.log(xvalues)
    overviewPlot.value.setSelection({
        xaxis: { min: start.value, max: end.value },
        yaxis: { min: 0, max: 0.05 }
    }, true);

    if (type.value === 'full') {
        zoomInPlot.value = $.plot(zoomIn.value, filterData(xvalues, start.value, end.value),
            $.extend(true, {}, options, {
                xaxis: { min: start.value, max: end.value },
                yaxis: { min: 0, max: 0.05 }
            })
        );
    }

    watch(() => chrom.value, (newValue) => {
        // emit('zoomTo', chrom.value, start.value, end.value)
        // console.log(pixelWidth.value)
        // console.log(width.value)
        // console.log(plotObj.value)

        // console.log(newValue)
        // zoomInPlot.value.shutdown()
        // overviewPlot.value.shutdown()

        overview.value.innerHTML = ''
        zoomIn.value.innerHTML = ''

        // console.log(overview.value, zoomIn.value, chrom.value, min.value, max.value, chromSizes.value, chromBands.value, width.value, _colorCodes)
        xvalues = drawChrom(chrom.value, min.value, max.value, chromSizes.value, chromBands.value, width.value, _colorCodes, cytoband);
        overviewPlot.value.setSelection({
            xaxis: { min: start.value, max: end.value },
            yaxis: { min: 0, max: 0.05 }
        }, true);

    }, { immediate: false })

    watch([() => props.start, () => props.end], () => {
        if (oldChrom != chrom.value) {
            oldChrom = chrom.value
            return
        }
        console.log(start.value, end.value)
        overviewPlot.value.setSelection({
            xaxis: {
                from: start.value,
                to: end.value
            },
            yaixs: {
                from: 0,
                to: 0.05
            }
        });

        if (type.value === 'full') {
            let filteredData = filterData(xvalues, start.value, end.value)
            // console.log(filteredData)
            //emit('zoomTo', chrom, ranges.xaxis.from, ranges.xaxis.to)
            zoomInPlot.value = $.plot(zoomIn.value, filteredData,
                $.extend(true, {}, options, {
                    xaxis: { min: start.value, max: end.value },
                    yaxis: { min: 0, max: 0.05 }
                })
            );
        }
    }, { immediate: false });

    watch(() => width.value, () => {
        // console.log(pixelWidth.value)
        // console.log(width.value)
        // console.log(plotObj.value)
        overviewPlot.value.resize();
        overviewPlot.value.setupGrid();
        overviewPlot.value.draw();
        overviewPlot.value.setSelection({
            xaxis: {
                from: start.value,
                to: end.value
            },
            yaixs: {
                from: 0,
                to: 0.05
            }
        });
        if (type.value === 'full') {
            zoomInPlot.value.resize();
            zoomInPlot.value.setupGrid();
            zoomInPlot.value.draw();
        }



    }, {});



})


</script>
<style></style>