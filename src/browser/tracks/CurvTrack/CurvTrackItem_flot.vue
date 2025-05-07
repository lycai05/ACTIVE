<template>
    <div>
        <div ref="canvasContainer" :style="props.style">
            <n-spin :v-show="showSpin" class="z-50 absolute left-1/2 top-1/2">
            </n-spin>
            <n-alert title="" type="default" :bordered="true">
                {{ selectedInfo }}
            </n-alert>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useElementSize } from '@vueuse/core'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
import { useMessage } from 'naive-ui'

// define props
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
    }
})
const message = useMessage()
const isVisible = ref(true)

const canvasContainer = ref(null)
const canvasReady = ref(false)
const emit = defineEmits(['canvasReady'])
const showSpin = ref(true)

const selectedInfo = ref('')

const chrom = computed(
    () => props.location.chrom
)

const start = computed(
    () => props.location.start
)

const end = computed(
    () => props.location.end
)

const url = props.option.url

const { width } = useElementSize(canvasContainer)

const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})

const option = computed(() => {
    return props.option
})

const plot = ref(null)
const _drawPlot = (canvas, xvalues, steps, displayStyle = 'basicCurve') => {
    var params = {
        grid: {
            show: true,
            borderWidth: 0,
            borderColor: '#a0aec0',
            // "minBorderMargin" controls the default minimum margin around the border - it's used to make sure that points aren't accidentally clipped by the canvas edge so by default the value is computed from the point radius.
            minBorderMargin: 0,
            // clickable: true,
            // hoverable: false,
            // mouseActiveRadius: 1000
            labelMargin: -70
        },
        xaxis: {
            show: false,
            ticks: 0,
            min: start.value,
            max: end.value
        },
        yaxis: {
            show: true,
            tickLength: 0,
            position: 'left',
            // min: 0,
            // max: 10,
            labelWidth: 70,
            labelHeight: 5,
            rotateTicks: 100,
            // reserveSpace: true,
            // font: 10,
            tickFormatter: function (val, axis) {
                if (val / 1000 != 0 && val % 1000 == 0) return (val / 1000) + "k";
                return val;
            }
        }//,
        // hooks: {
        //     processOffset: [processOffsetHook]
        // }
    };

    if (displayStyle === 'basicCurve') {
        params.basicCurve = true
    } else if (displayStyle === 'flatCurve') {
        params.flatCurve = true
    } else if (displayStyle === 'rectCurve') {
        params.rectCurve = true
    }

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
    const plotObj = $.plot(canvas, xvalues, params);

    return plotObj
}

const _makeInitialRequest = (canvasEle, xdata, width) => {
    var xvalues = [],
        l = start.value,
        r = end.value,
        w = width,

        step = Math.round((r - l) / w);
    // console.log(w)
    // var yaxis_log = _get(_get(opts._options, 'yaxis', {}), 'log'),
    //     show_outbound = _get(_get(opts._options, 'outbound', {}), 'show', false);
    let yaxis_log = false,
        show_outbound = false
    // console.log(xdata)
    // for (var k in xdata) {
    var values = []
    var data = xdata

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

    xvalues.push({
        fillColor: option.value.series[0].areaStyle.color || '#B84444',
        strokeColor: option.value.series[0].lineStyle.color || 'red',
        lineWidth: option.value.series[0].lineStyle.width || 1,
        opacity: option.value.series[0].areaStyle.opacity || 0,
        data: values.sort(function (p, q) { return q[2] - p[2]; })
    });
    // }


    canvasReady.value = false
    // loadingStart()
    showSpin.value = false

    plot.value = _drawPlot(canvasEle, xvalues, step, 'basicCurve');

    var tickLabels = document.querySelectorAll('.y1Axis .tickLabel');
    tickLabels.forEach(function (label) {
        label.style.whiteSpace = 'nowrap';
        label.style.transform = 'translate(-50px, 0) rotate(-0deg)';
        // label.style.textIndent = '-100%';
        label.style.transformOrigin = 'top right';
        label.style.textAlign = 'right';
        // label.style.height = '40px';
    });
    // loadingFinish()
    let previousPoint = null
    $(canvasEle).bind("plotclick", function (event, pos, item) {
        if (item) {

            // var x = item.datapoint[0].toFixed(2),
            //     y = item.datapoint[1].toFixed(2);

            // showTooltip(item.pageX, item.pageY,
            //     "Dia=" + x + ", Quota=" + y);
            selectedInfo.value = `${item.dataIndex}, ${item.series.label}`

        }

    });

    canvasReady.value = true;

}

const deduplicateArray = (data) => {
    const uniqueEntries = new Set();
    const result = [];

    data.forEach((item) => {
        // Extract the relevant parts for deduplication
        const { chrom, start, end, chrom2, start2, end2 } = item;

        // Create two versions: original and swapped
        const original = [chrom, start, end, chrom2, start2, end2];
        const swapped = [chrom2, start2, end2, chrom, start, end];

        // Normalize each version by sorting the individual triplets and then the whole set
        const sortTriplet = (triplet) => triplet.sort((a, b) => a - b);
        const originalTriplet1 = sortTriplet(original.slice(0, 3));
        const originalTriplet2 = sortTriplet(original.slice(3, 6));
        const swappedTriplet1 = sortTriplet(swapped.slice(0, 3));
        const swappedTriplet2 = sortTriplet(swapped.slice(3, 6));

        // Join the sorted parts to form a canonical key
        const canonicalOriginal = [...originalTriplet1, ...originalTriplet2].join(',');
        const canonicalSwapped = [...swappedTriplet1, ...swappedTriplet2].join(',');

        // Choose the lexicographically smallest one as the canonical key
        const canonical = [canonicalOriginal, canonicalSwapped].sort()[0];

        // Add to result if this canonical form has not been seen
        if (!uniqueEntries.has(canonical)) {
            uniqueEntries.add(canonical);
            result.push(item);
        }
    });

    return result;
};

let lines = []

onMounted(() => {
    // showSpin.value = true
    watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], async () => {
        showSpin.value = true
        await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
            // Initialize variables to hold split data and the main array
            let splitData, arr;

            // Check if the line contains ";"
            if (line.includes(";")) {
                // Split the line by ";", separate main data and additional data
                splitData = line.split(";");
                // The main data is in the first segment
                arr = splitData[0].split(/[\s,:-]+/);
            } else {
                // If no ";" is present, treat entire line as the main data
                arr = line.split(/[\s,:-]+/);
            }

            // Construct the primary data object from the array
            const addedData = {
                chrom: arr[0],
                start: Number(arr[1]),
                end: Number(arr[2]),
                chrom2: arr[3],
                start2: Number(arr[4]),
                end2: Number(arr[5]),
                score: Number(arr[6]) // Assuming the score is at position 6
            };

            // Optional: Handle additional data if the line contained ";"
            let additionalData = null;
            if (splitData && splitData.length > 1) {
                additionalData = splitData.slice(1);
            }

            // Push the main data object to the lines array
            lines.push(addedData);

            // Optionally, handle the additional data
            if (additionalData) {
                // console.log("Additional data:", additionalData);
            }

        })
        lines = deduplicateArray(lines)
        _makeInitialRequest(canvasContainer.value, lines, width.value)

    }, { immediate: true, deep: true });

    watch([() => width.value, () => props.style], () => {
        showSpin.value = true
        if (width.value > 0 && plot.value) {
            plot.value.resize();
            plot.value.setupGrid();
            plot.value.draw();
            var tickLabels = document.querySelectorAll('.y1Axis .tickLabel');
            tickLabels.forEach(function (label) {
                label.style.whiteSpace = 'nowrap';
                label.style.transform = 'translate(-50px, 0) rotate(-0deg)';
                // label.style.textIndent = '-100%';
                label.style.transformOrigin = 'top right';
                label.style.textAlign = 'right';
                // label.style.height = '40px';
            });
        }

        showSpin.value = false
    });
});

</script>
<style scoped>
.y1Axis .tickLabel {
    transform: translate(-9px, 0) rotate(-0deg);
}
</style>