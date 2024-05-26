<template>
    <n-scrollbar  v-if="isVisible">
        <div ref="canvasContainer" class="basic-canvas"  :style="props.style">
            <canvas ref="matrix"></canvas>
            <canvas ref="canvas"  class="absolute top-0 left-0"></canvas>
            <!-- <n-alert title="" type="default" :bordered="true">
      {{ selectedInfo }}
    </n-alert> -->
            <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
        </div>
    </n-scrollbar>
    <div v-else>

        <div ref="canvasContainer" class="basic-canvas">
            <n-alert title="" type="warning">
            Too many items. Zoom in to see features
        </n-alert>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';

import { drawPlotX } from '../../utils/BaseRowTrack2'
import { useElementSize } from '@vueuse/core'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
import { useMessage } from 'naive-ui'
import {clusterMultiplexing} from '../../utils/clusterMultiplexing'
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
const message = useMessage()

// const corenavStore = usecorenavStore()
const prepad = ref(0)
const postpad = ref(0)
const h = ref(8)
const canvasContainer = ref(null)
const canvas = ref(null)
const showLabel = ref(false)
const label = ref(null)
const canvasReady = ref(false)
const url = props.option.url
const showSpin = ref(false)
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

const matrix = ref(null)
// const trackId = ref(props.trackId)
const isVisible = ref(true)

let visibilityWidth = 5000000


var INTER1 = 0,
    INTER2 = 1,
    INTRA = 2,
    MIN_ANCHOR_WIDTH = 3,
    MIN_CONNECTOR_LENGTH = 10,
    _DEFAULT_GLYPH_HEIGHT = 8,
    _DEFAULT_GLYPH_POSTPAD = 12

    // const canvasContainer = ref(null)
    const { width, height } = useElementSize(canvasContainer.value)



const option = computed(()=> {
    return props.option
})
let colors = option.value.series[0].itemStyle.color || "black",
    // height = _DEFAULT_GLYPH_HEIGHT,
    clickable = true,
    orderBy = ref('score')

const _sortItems = (items, start, end, loc) => {
    // default sort: try to sort by score descending
    // console.log(items)
    var ordby = orderBy.value;
    return items.sort(function (p, q) {
        if (p[ordby] < q[ordby]) {
            return 1; // descending
        } else if (p[ordby] > q[ordby]) {
            return -1;
        }

        // if failed, use similar strategy as paired-tag sorting
        var pHead = (p.chrom === loc.chrom && loc.start <= p.start && p.start < loc.end) ? p.start : null,
            pTail = (p.chrom2 === loc.chrom && loc.start <= p.start2 && p.start2 < loc.end) ? p.start2 : null;
        var qHead = (q.chrom === loc.chrom && loc.start <= q.start && q.start < loc.end) ? q.start : null,
            qTail = (q.chrom2 === loc.chrom && loc.start <= q.start2 && q.start2 < loc.end) ? q.start2 : null;
        var pScore = (pHead != null ? 1 : 0) + (pTail != null ? 1 : 0),
            qScore = (qHead != null ? 1 : 0) + (qTail != null ? 1 : 0),
            score = pScore - qScore;

        if (score != 0) return -score;
        return Math.min(pHead, pTail) - Math.min(qHead, qTail);
    });
}

const _preprocess = (items, chrom) => {
    // var chrom = chrom.value; // from [abs-track]
    // for (var i in items) {
    //     var it = items[i];
    //     if (it.chrom === chrom) {
    //         it.type = (it.chrom2 === chrom) ? INTRA : INTER1;
    //     } else {
    //         it.type = INTER2;
    //     }
    //     console.log(it)

    // }
    items.forEach((it) => {
        if (it.chrom === chrom) {
            it.type = (it.chrom2 === chrom) ? INTRA : INTER1;
        } else {
            it.type = INTER2;
        }

        const { link, start, end } = _determineStartEnd(it);
        it._link = link;
        it._start = start;
        it._end = end;
    })


    return (items)

    // this.options.glyph.postpad = this.options.showLabel ? _DEFAULT_GLYPH_POSTPAD : 2;
}

// const _makeLabel = (item, templ) => {
//     var opts = this.options, label = opts.label;
//     if ((label == null || label === '') && templ == null) return '';
//     if (templ != null) label = templ;

//     if (_.isString(label)) {
//         return $.tmpl(label, item).text(); // use template (TODO: use compiled template)
//     } else if (_.isFunction(label)) {
//         return label(item); // normal function
//     }
//     return ''; // catch-all
// }

const _determineStartEnd = (pcls) => {
    var start, end, link;

    if (pcls.type == INTER1) {
        // head anchor visible
        start = pcls.start;
        end = pcls.end;
        link = [pcls.chrom2, pcls.start2, pcls.end2];
    } else if (pcls.type == INTER2) {
        // tail anchor visible
        start = pcls.start2;
        end = pcls.end2;
        link = [pcls.chrom, pcls.start, pcls.end];
    } else {
        if (pcls.start < pcls.start2) {
            start = pcls.start;
            end = pcls.end2;
        } else {
            start = pcls.start2;
            end = pcls.end;
        }
        link = [pcls.chrom, start, end];
    }

    // pcls._link = link;
    // pcls._start = start;
    // pcls._end = end;
    // pcls._text = this._makeLabel(pcls);
    // pcls._tooltip = this._makeLabel(pcls, this.options.tooltip);
    //console.log('_determineStartEnd')
    return ({ link, start, end })
}

let lineColor = option.value.series[0].lineStyle.color || "black"

const _drawHLine = (ctx, x0, x1, y, pattern) => {
    if (x0 > x1) { var tmp = x0; x0 = x1; x1 = tmp; }
    if (!pattern) pattern = [3, 2]; // 3px stroke, 2px gap
    // console.log('_drawHLine', x0, x1, y)
    var p_idx = 0,
        p_len = pattern.length,
        x = x0,
        draw = true;

    ctx.save();
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    if (x1 - x0 < 8) {
        // special case for short distance
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
    } else {
        while (x < x1) {
            ctx.moveTo(x, y);
            x = Math.min(x + pattern[p_idx], x1);
            if (draw) ctx.lineTo(x, y);
            draw = !draw;
            p_idx += 1;
            if (p_idx >= p_len) p_idx = 0;
        }
    }
    ctx.closePath();
    ctx.strokeStyle =lineColor 
    ctx.stroke();
    ctx.restore();
    // console.log('_drawHLine')

}

const _drawAnchor = (ctx, x, y, w, h, l_, r_) => {
    var h_ = h / 2, w_ = h / 3,
        // whether the sides should protrude or not; possible values: (-1,0,1)
        l = l_ || 0, r = r_ || 0;
    ctx.save();
    ctx.clearRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + w_ * r, y + h_);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w_ * l, y + h_);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // console.log('_drawAnchor')

}

const _getColor = (colors, comp, item) => { // comp <- (line|outline|fill)
    // console.log(colors)
    if (colors == null) return 'black'; // paranoid check
    var defaultValue = colors || 'black', // if specific type is not found, use wildcard "_"
        c = colors[comp] || defaultValue;

    if (typeof c !== 'function') return c; // if it's not a function, return it directly (e.g. string

    var args = $.extend({
        comp: comp, // component type
        element: item,

        cluster: item, // for backward compatibility
        tag: item // for backward compatibility
    });
    console.log('_getColor')
    console.log(c(args) || defaultValue)
    return c(args) || defaultValue; // in case the function doesn't return valid value
}

const _measureWidth = (canvas, w, pcls, c) => {
    // determine which part of canvas will be used to draw given pcls
    var ctx = canvas.getContext("2d");
    // console.log('_measureWidth')
    var cstart = Math.max(1, c(pcls._start)),
        cend = Math.min(w, c(pcls._end + 1)),
        actualWidth = Math.max(cend - cstart, showLabel.value ? ctx.measureText(pcls._text).width : 0);

    if (pcls.type == INTER1) {
        if (pcls.strand == "+") {
            return { start: cstart, end: cstart + actualWidth };
        } else {
            var s = Math.max(1, Math.min(cstart, cend - actualWidth));
            return { start: s, end: s + actualWidth };
        }
    } else if (pcls.type == INTER2) {
        if (pcls.strand2 == "+") {
            return { start: cstart, end: cstart + actualWidth };
        } else {
            var s = Math.max(1, Math.min(cstart, cend - actualWidth));
            return { start: s, end: s + actualWidth };
        }
    } else {
        var s = Math.max(1, Math.min(cstart, cstart + (cend - cstart - actualWidth) / 2));
        return { start: s, end: s + actualWidth };
    }
}

const _drawItemBedpe = (canvas, x, y, w, h, pcls, colors, c) => {
    var ctx = canvas.getContext("2d"),
        cstart = Math.max(1, c(pcls._start)),
        cend = Math.min(c(pcls._end + 1), w),
        hRatio = h / 8;
    // console.log(colors)
    ctx.save();
    ctx.translate(0, y + h / 2);
    ctx.lineWidth = 1;

    ctx.strokeStyle = _getColor(colors, "line", pcls);

    // console.log(pcls)
    if (pcls.type == INTER1) { // 5'
        if (pcls.strand == '+') _drawHLine(ctx, cend, cend + MIN_CONNECTOR_LENGTH, 0);
        else _drawHLine(ctx, cstart - MIN_CONNECTOR_LENGTH, cstart, 0);
    } else if (pcls.type == INTER2) { // 3'
        if (pcls.strand2 == '+') _drawHLine(ctx, cstart - MIN_CONNECTOR_LENGTH, cstart, 0);
        else _drawHLine(ctx, cend, cend + MIN_CONNECTOR_LENGTH, 0);
    } else {
        // console.log('---')
        // console.log(Math.max(1, cstart), Math.min(cend, w))

        _drawHLine(ctx, Math.max(1, cstart), Math.min(cend, w), 0, false);
    }
    // console.log(pcls)
    // 1a. draw anchors - left
    if (pcls.type != INTER2) {
        // console.log('left anchor')
        ctx.strokeStyle = _getColor(colors, "head", pcls);
        ctx.fillStyle = _getColor(colors, "hfill", pcls);
        var cx0 = c(pcls.start),
            cx1 = c(pcls.end + 1);
        if (cx1 - cx0 <= 5) cx1 = cx0 + MIN_ANCHOR_WIDTH; // minimal drawn width
        var prot = 0;
        if (pcls.strand == "+") prot = 1; else if (pcls.strand == "-") prot = -1;
        _drawAnchor(ctx, cx0, -3 * hRatio, cx1 - cx0, 6 * hRatio, prot, prot);
    }

    // 1b. draw anchors - right
    if (pcls.type != INTER1) {
        // con``sole.log('right anchor')
        ctx.strokeStyle = _getColor(colors, "tail", pcls);
        ctx.fillStyle = _getColor(colors, "tfill", pcls);
        var cx0 = c(pcls.start2),
            cx1 = c(pcls.end2 + 1);
        if (cx1 - cx0 <= 5) cx1 = cx0 + MIN_ANCHOR_WIDTH; // minimal drawn width
        var prot = 0;
        if (pcls.strand2 == "+") prot = 1; else if (pcls.strand2 == "-") prot = -1;
        _drawAnchor(ctx, cx0, -3 * hRatio, cx1 - cx0, 6 * hRatio, prot, prot);
    }

    if (showLabel.value) {
        pcls._text = `${pcls.chrom}:${pcls.start}-${pcls.end} --- ${pcls.chrom2}:${pcls.start2}-${pcls.end2}`
        // 5. write symbol/accession
        ctx.fillStyle = _getColor(colors, "text", pcls);
        ctx.font = "normal 9px sans-serif";

        if (pcls.type == INTER1) {
            if (pcls.strand == "+") {
                ctx.textAlign = "left";
                ctx.fillText(pcls._text, cstart, 6 * hRatio + 6);
            } else {
                ctx.textAlign = "right";
                ctx.fillText(pcls._text, cend, 6 * hRatio + 6);
            }
        } else if (pcls.type == INTER2) {
            if (pcls.strand2 == "+") {
                ctx.textAlign = "left";
                ctx.fillText(pcls._text, cstart, 6 * hRatio + 6);
            } else {
                ctx.textAlign = "right";
                ctx.fillText(pcls._text, cend, 6 * hRatio + 6);
            }
        } else {
            ctx.textAlign = "center";
            ctx.fillText(pcls._text, cstart + Math.round((cend - cstart) / 2), 6 * hRatio + 6);
        }
    }
    // console.log('_drawItem')
    ctx.restore();
}

const _drawItemBed = (canvas, x, y, w, h, scls, colors, c) => {
    // console.log(scls)
    var ctx = canvas.getContext("2d"),
        hRatio = h / 8,
        cstart = Math.max(1, c(scls.start)),
        cend = Math.min(w, c(scls.end + 1));

    ctx.save();
    ctx.translate(0, y + h / 2);
    ctx.lineWidth = 1;

    ctx.strokeStyle = _getColor(colors, "outline", scls);
    ctx.fillStyle = _getColor(colors, "fill", scls);

    var prot = 1;
    if (scls.strand == "+") prot = 1; else if (scls.strand == "-") prot = -1;
    _drawAnchor(ctx, cstart, -3 * hRatio, cend - cstart, 6 * hRatio); // _drawClusterAnchor: function(ctx, x, y, w, h, l_, r_)

    // if (showLabel.value) {
    //     // console.log('showLabel')
    //     // 5. write symbol/accession
    //     ctx.fillStyle = _getColor(colors, "text", scls);
    //     ctx.font = "normal 9px sans-serif";
    //     ctx.textAlign = "left";
    //     ctx.fillText(scls._text, cstart, 6 * hRatio + 6);
    // }

    ctx.restore();
}


const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})

const span = computed(
    () => end.value - start.value
)

function processFile(items) {
  // Initialize the rows object and a map to track cluster indices
  const rows = {0: 0};
  const clusterMap = {[items[0]['clusterId']]: 0};

  // Loop through the items starting from the second one
  for (let i = 1; i < items.length; i++) {
    const clusterId = items[i]['clusterId']; // Access the cluster ID

    // If the cluster ID has been seen before, use its index in rows
    // Otherwise, create a new index
    if (clusterId in clusterMap) {
      rows[i] = clusterMap[clusterId];
    } else {
      const newIndex = Object.keys(clusterMap).length; // The new index is the count of unique cluster IDs
      clusterMap[clusterId] = newIndex;
      rows[i] = newIndex;
    }
  }

  // Return the resulting rows object
  return rows;
}




function drawHeatmap(canvasRef, ParentEle, data) {
  // Get the canvas element and its context
//   const canvas = document.getElementById(canvasId);
console.log(arguments)
//   canvas.width = width;
//   canvas.height = height;
canvasRef.setAttribute('width', ParentEle.offsetWidth);
canvasRef.setAttribute('height', ParentEle.offsetHeight);

  const ctx = canvasRef.getContext('2d');
  ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

  // Assuming data is a 2D array of numbers and is not empty
  const numRows = data.length;
  const numCols = data[0].length;

  // Calculate the size of each cell
  const cellWidth = canvasRef.width / numCols;
  const cellHeight = canvasRef.height / numRows;

  // Function to map a data value to a color
  const getColorForValue = (value, max) => {
    // Ensure value is in the range [0, 1]
    const normalizedValue = Math.min(Math.max(value / max, 0), 1);
    const red = 255;
    const green = Math.round(255 * (1 - normalizedValue));
    const blue = Math.round(255 * (1 - normalizedValue));
    return `rgb(${red}, ${green}, ${blue})`;
};
const max = Math.max(...data.flat());


  // Loop over the data and draw the heatmap
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const value = data[i][j];
      ctx.fillStyle = getColorForValue(value, max);
      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  }
}



onMounted(() => {
    watch([()=>option.value.series,()=>chrom.value,() => start.value, () => end.value], async (newStart, newEnd) => {
        if (end.value - start.value < visibilityWidth) {
            showSpin.value = true
            colors = option.value.series[0].itemStyle.color || "black"
            lineColor = option.value.series[0].lineStyle.color || "black"
            isVisible.value = true
            canvasReady.value = false
            console.log("start or end value changes, drawPlotX")
            let lines = []
            await file.getLines(chrom.value, start.value, end.value, function(line, fileOffset) {
                const arr = line.split(/[\s]+/)
                const addedData = {
                chrom: arr[0],
                start:  Number(arr[1]),
                end:  Number(arr[2]),
                clusterId:  arr[3]
            }
            lines.push(addedData)

        })
         console.log(lines)
        // lines = _preprocess(lines, chrom.value)
        // lines = _sortItems(lines, start.value, end.value, { chrom: chrom.value, start: start.value, end: end.value });
        // drawPlotX(canvas.value, lines, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value,colors)
        //         canvasReady.value = true;
        //         showSpin.value = false;
        // console.log(processFile(lines))
        const binMatrix = drawPlotX(canvas.value, lines, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItemBed, _drawItemBedpe, _measureWidth, start.value, end.value)
        console.log(binMatrix[0])
        drawHeatmap(matrix.value, canvasContainer.value,binMatrix)
        showSpin.value = false
        } else {
            isVisible.value = false
            canvasReady.value = true
        }


    }, { immediate: true,deep:true });

    watch(() => width.value, () => {
        showSpin.value = true
        if(width.value>0) {
        // drawPlotX(canvas.value, lines, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value,colors)
        }
        showSpin.value = false;
    })


})

</script>