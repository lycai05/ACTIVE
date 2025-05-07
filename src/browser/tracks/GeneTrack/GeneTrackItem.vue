<template>
      <!-- <div class="relative h-full w-full flex"> -->
<!--  -->



    <div class="relative h-full flex align-center" :style="props.style">
        <div class="w-[30px] flex-shrink-0 border-r border-black pt-2 before:content-[''] before:absolute before:right-0 before:top-0 before:w-[6px] before:h-[1px] before:bg-black after:content-[''] after:absolute after:right-0 after:bottom-0 after:w-[8px] after:h-[1px] after:bg-black relative">      
        
        <n-space vertical :size="12" align="center" class="pr-2">
       
      </n-space>
    </div>
    <div class="flex-1 ml-[10px]">
      <div ref="canvasContainer" class="basic-canvas aspect-ratio" >
        <div v-if="isVisible">
            <n-scrollbar  class="z-50">
            <canvas ref="canvas"></canvas>
        </n-scrollbar>
          <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
        </div>
        <div v-else>
          <!-- <div ref="canvasContainer" class="basic-canvas"> -->
            <n-alert title="" type="warning">
              No data in this region.
            </n-alert>
          <!-- </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, onMounted, computed, ref, watch } from 'vue';

import { fetchGeneAnnoFileData } from '../../service/base'
import { drawPlotX } from '../../utils/BaseRowTrack'
import { useElementSize } from '@vueuse/core'
import { useMiddlePanelWidth } from '../../hooks/useLayout'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
import { useScreenshotStore } from '@/browser/store'

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
    trackViewIndex: {
        type: Number,
        required: true
    }
})



const prepad = ref(0)
const postpad = ref(15)
const h = ref(12)
const canvasContainer = ref(null)
const canvas = ref(null)
const canvasReady = ref(false)

const clickable = ref(false)
const hpad = ref(10) // distance between glyphs (used in intersection)
const showLabel = ref(true)
let visibilityWidth = 10000000
const isVisible = ref(true)
const showSpin = ref(false)
const { width, height } = useElementSize(canvasContainer.value)

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

// const { eleWidth } = useMiddlePanelWidth()
const option = computed(() => {
    return props.option
})

// console.log(url)
const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})

const _getColor = (colors, comp, item) => { // comp <- (line|outline|fill)
    if (colors == null) return 'black'; // paranoid check
    var defaultValue = colors._ || 'black', // if specific type is not found, use wildcard "_"
        c = colors[comp] || defaultValue;

    // if (!_.isFunction(c)) return c;
    if (typeof c !== "function") return c;

    var args = $.extend({
        comp: comp, // component type
        element: item,

        cluster: item, // for backward compatibility
        tag: item // for backward compatibility
    });
    return c(args) || defaultValue; // in case the function doesn't return valid value
}

function _drawArrowHLine(ctx, x1, x2, y, dir, hRatio, quick) {
    ctx.save();
    ctx.beginPath();

    // main line
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);

    // arrows -- draw only when we're not in quickdraw mode
    if (!quick) {
        var delta = -dir * hRatio * 2;
        for (var i = x1 + hRatio * 6; i < x2 - hRatio * 6; i += hRatio * 6) {
            ctx.moveTo(i, y);
            ctx.lineTo(i + delta, y - delta);
            ctx.moveTo(i, y);
            ctx.lineTo(i + delta, y + delta);
        }
    }

    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}



function parseArray(input) {
    try {
        // Remove any whitespace and commas from the string
        const str = input.replace(/\s/g, '').replace(/, /g, '');
        // Use JSON.parse() to convert the string to an array
        return JSON.parse("[" + str + "]");
    } catch (error) {
        console.log(input)
        console.error("Error parsing array: ", error);
    }
}

// 
function processGeneList(gene_list) {
    const result = [];
    for (let i = 0; i < gene_list.length; i++) {
        const gene = gene_list[i];
        if (Object.values(gene)[0].charAt(0) === '#') continue; // skip comment lines
        // console.log(gene['exons'])
        if (typeof gene['exons'] === 'undefined') { console.log(gene) }
        gene['exons'] = parseArray(gene['exons']);
        // console.log(gene['exons'])

        const exons = gene['exons'];
        if (exons) {
            const introns = [[0, exons[0][0]]];
            for (let j = 1; j < exons.length; j++) {
                introns.push([exons[j - 1][1], exons[j][0]]);
            }
            introns.push([exons[exons.length - 1][1], gene['end'] - gene['start']]);
            gene['introns'] = introns.filter(([x, y]) => x < y);
        } else {
            gene['introns'] = [];
        }
        result.push(gene);
    }
    return result;
}

const _drawItem = (canvas, x, y, w, h, gene, colors, c, quick) => {
    // console.log(x, y, w, h, gene, colors, c)

    var ctx = canvas.getContext("2d"),
        hRatio = h / 8,
        color = gene.strand == "+" ? props.option.series[0].itemStyle.positiveStrandColor : props.option.series[0].itemStyle.negativeStrandColor,
        dir = gene.strand == "+" ? 1 : -1,
        cstart = Math.max(1, c(gene.start)),
        cend = Math.min(w, c(gene.end));

    ctx.save();

    ctx.clearRect(cstart, y, cend - cstart, h);
    ctx.translate(0, y + h / 2);
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(cstart, 0);
    ctx.lineTo(cend, 0);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();

    // 1. draw exons (grey)
    ctx.fillStyle = "rgb(208,208,208)";
    gene.exons.forEach(function (ex) {
        var cx0 = c(gene.start + ex[0]),
            cx1 = c(gene.start + ex[1]);
        if (cx1 <= 0 || cx0 > w) return;
        ctx.fillRect(cx0, -2 * hRatio, cx1 - cx0, 4 * hRatio);
        ctx.strokeRect(cx0, -2 * hRatio, cx1 - cx0, 4 * hRatio);
        // console.log(gene.start, ex[0])
        // console.log(c(gene.start + ex[0]))
    });

    // 2. draw CDS (solid blue/green)
    ctx.fillStyle = color;
    var cx0 = Math.max(1, c(gene.cds_start)),
        cx1 = Math.min(c(gene.cds_end), w);
    ctx.fillRect(cx0, -4 * hRatio, cx1 - cx0, 8 * hRatio);

    if (gene.domains != null) {
        ctx.fillStyle = 'orange';
        ctx.strokeStyle = color;
        gene.domains.forEach(function (dom) {
            var dname = dom[0],
                cx0 = c(dom[1]),
                cx1 = c(dom[2]);

            if (cx1 - cx0 >= 5) {
                ctx.fillRect(cx0, -4 * hRatio, cx1 - cx0, 8 * hRatio);
                ctx.strokeRect(cx0, -4 * hRatio, cx1 - cx0, 8 * hRatio);
            }
        });
    }

    // 3. draw introns (arrowed lines) 
    gene.introns.forEach(function (intr) {
        var cx0 = c(gene.start + intr[0]),
            cx1 = c(gene.start + intr[1]);

        if (cx1 <= 0 || cx0 > w) return; // don't draw if they're outside drawing area
        if (cx1 - cx0 <= 2) return; // don't draw intron if it's less than 2px wide
        ctx.clearRect(cx0, -5 * hRatio, cx1 - cx0, 10 * hRatio);
        _drawArrowHLine(ctx, cx0, cx1, 0, dir, hRatio, quick);
    });

    // 4. draw arrow head (not part of genes)
    var delta = 3 * hRatio * dir,
        cx = 0;
    ctx.beginPath();
    if (gene.strand == "+") {
        ctx.moveTo(cend, 0);
        cx = cend + delta;
    } else {
        ctx.moveTo(cstart, 0);
        cx = cstart + delta;
    }
    ctx.lineTo(cx + delta, 0);
    ctx.lineTo(cx, delta);
    ctx.moveTo(cx + delta, 0);
    ctx.lineTo(cx, -delta);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();

    // 5. write symbol/accession
    if (props.option.series[0].label.show) {
        ctx.fillStyle = props.option.series[0].label.color || _getColor(colors, "text", gene);
        ctx.font = "normal 9px sans-serif";
        ctx.fillText(gene.sym, Math.max(0, c(gene.start)), 6 * hRatio + 6);

    }

    // 6. write annotations
    ctx.font = "bold 8px sans-serif";
    if (gene.icons) {
        for (var i in gene.icons) {
            var icon = gene.icons[i];
            if (icon[1] == "+") {
                ctx.fillStyle = "black";
                ctx.fillText(icon[0], cstart + 6 * i, -6 * hRatio + 1);
            } else if (icon[1] == "-") {
                ctx.fillStyle = "#ccc";
                ctx.fillText(icon[0], cstart + 6 * i, -6 * hRatio + 1);
            }
        }
    }

    ctx.restore();
}

const _measureWidth = (canvas, w, gene, c) => {
    // determine which part of canvas will be used to draw given gene
    var ctx = canvas.getContext("2d"),
        cstart = Math.max(1, c(gene.start)),
        cend = Math.min(w, c(gene.end));

    var txt = gene.sym;
    var actualWidth = Math.max(cend - cstart, ctx.measureText(txt).width);
    return {
        start: cstart,
        end: cstart + actualWidth
    };
}


// import the gene annotation file from the server
// const tracksStore = usetracksStore()

const data = ref([]);
const filteredData = ref([]);
const cacheKey = ref('');

const filename = url.substring(url.lastIndexOf('/') + 1);


const filterData = (d) => {
    return d.filter(item => {
        // console.log( item.chrom, item.start,item.end2 )
        return item.chrom == chrom.value && item.start >= start.value && item.end <= end.value;
    });
};



function filterLargestRange(objects) {
    let result = [];

    for (let i = 0; i < objects.length; i++) {
        // Calculate the range of the current object
        let currentRange = objects[i].end - objects[i].start;
        let nextRange = 0;

        // If there is a next object and it has the same 'sym', calculate its range
        if (i + 1 < objects.length && objects[i].sym === objects[i + 1].sym) {
            nextRange = objects[i + 1].end - objects[i + 1].start;
        }

        // If the currentRange is greater than or equal to the nextRange, or there is no next object with the same 'sym',
        // add the current object to the result
        if (currentRange >= nextRange || (i + 1 < objects.length && objects[i].sym !== objects[i + 1].sym)) {
            result.push(objects[i]);
        }

        // If the next object has the same 'sym' and a larger range, skip the current object
        if (i + 1 < objects.length && objects[i].sym === objects[i + 1].sym && currentRange < nextRange) {
            i++; // Skip the next object as it will be checked in the next iteration
        }
    }

    return result;
}

const _addLinks = (parent, canvas, y, w, h, postpad, gene, c) => {
    var ctx = canvas.getContext("2d"),
        cstart = Math.max(1, c(gene.start)),
        cend = Math.min(w, c(gene.end)),
        actualWidth = Math.max(cend - cstart, ctx.measureText(gene.sym).width);
    // console.log(parent, canvas, y, w, h, postpad, gene, c)
    var elem = $("<div>").css({
        position: "absolute",
        top: y,
        left: cstart,
        //"background-color": "rgba(255, 0, 0, 0.4)",
        width: actualWidth,
        height: h + postpad,
        cursor: "pointer"
    }).attr({
        title: gene._tooltip
    }).appendTo(parent);
    return elem;
}

// Add after other refs
const screenshotStore = useScreenshotStore()

// Add this function before onMounted
function createCanvasChart() {
    if (!canvasContainer.value || !canvas.value) return;

    // Get actual dimensions from the canvas element
    const currentWidth = canvas.value.width;
    const currentHeight = canvas.value.height;

    const screenshotDiv = document.getElementById('screenshot-container');
    if (!screenshotDiv) return;
    
    const screenshotCanvas = document.createElement('canvas');
    screenshotCanvas.width = currentWidth;
    screenshotCanvas.height = currentHeight;
    screenshotDiv.appendChild(screenshotCanvas);

    // Draw the content from original canvas to screenshot canvas
    const ctx = screenshotCanvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, currentWidth, currentHeight);

    // Draw the original canvas content
    ctx.drawImage(canvas.value, 0, 0);

    const dataURL = screenshotCanvas.toDataURL('image/png');
    
    // Clean up
   // screenshotDiv.removeChild(screenshotCanvas);
    
    return dataURL;
}

// Add this watch before onMounted
watch(
    () => screenshotStore.timestamp,
    async () => {
        // if (screenshotStore.screenshotType === 'canvas') {
            createCanvasChart();
        // }
    }
);

onMounted(() => {

    watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], async () => {
        showSpin.value = true
        if (end.value - start.value < visibilityWidth) {
            isVisible.value = true
            canvasReady.value = false

            let lines = []
            await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
                // console.log(line)
                const splitData = line.split('\t')
                // console.group(splitData)
                const region = splitData.slice(0, 3);
                const meta = splitData[3].split('|')
                const addedData = {
                    ucsc_name: meta[0],
                    chrom: region[0],
                    strand: meta[1],
                    start: parseInt(region[1]),
                    end: parseInt(region[2]),
                    cds_start: meta[2],
                    cds_end: meta[3],
                    name: meta[4],
                    sym: meta[5],
                    exons: meta[6]
                }
                lines.push(addedData)
                // console.log(addedData)

            })

            const d = processGeneList(lines)
            filteredData.value = filterData(d);
            if (props.option.series[0].itemStyle.display === 'slim') {
                filteredData.value = filterLargestRange(filteredData.value);
            }
            drawPlotX(canvas.value, filteredData.value, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)
            showSpin.value = false;


        } else {
            isVisible.value = false
            canvasReady.value = true
        }
    }, { immediate: true, deep: true });

    watch(() => width.value, () => {
        showSpin.value = true
        if (width.value > 0) {
            drawPlotX(canvas.value, filteredData.value, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)

        }

        showSpin.value = false
    });

})

</script>

<style scoped>
.basic-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>