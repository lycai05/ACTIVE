<template>
    <n-scrollbar v-if="isVisible">
        <div ref="canvasContainer" class="basic-canvas" :style="props.style">
            <canvas ref="canvas"></canvas>
            <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
        </div>
    </n-scrollbar>
    <div v-else>
        <div ref="canvasContainer" class="basic-canvas">
            <n-alert title="" type="warning">
                Too many items. Zoom in (< 500Kb) to see features
            </n-alert>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { drawPlotX } from '../../utils/BaseRowTrack'
import { useElementSize } from '@vueuse/core'
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

const { width } = useElementSize(canvasContainer.value)

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
let visibilityWidth = 10000000
const canvasReady = ref(false)

// 添加颜色映射对象，使用更多样化的颜色方案
const tissueColors = {
    'Adipose': '#FF9999',        // 淡红色
    'Adrenal gland': '#FF99CC',  // 粉红色
    'Bladder': '#CC99FF',        // 淡紫色
    'Blood vessel': '#FF0000',   // 红色
    'Brain': '#9999FF',          // 蓝紫色
    'Breast': '#FF99FF',         // 粉紫色
    'Colon': '#996633',          // 棕色
    'Esophagus': '#CC6666',      // 深红色
    'Heart': '#FF3333',          // 鲜红色
    'Kidney': '#993366',         // 深紫红色
    'Liver': '#CC6600',          // 褐色
    'Lung': '#FF9966',           // 橙色
    'Lymph node': '#99CC00',     // 黄绿色
    'Muscle': '#CC3333',         // 暗红色
    'Nerve': '#9966CC',          // 紫色
    'Ovary': '#FF66CC',          // 粉色
    'Pancreas': '#FFCC66',       // 浅橙色
    'Placenta': '#FF6666',       // 珊瑚色
    'Prostate gland': '#6666CC', // 深蓝色
    'Skin': '#FFB399',           // 肤色
    'Soft tissue': '#CC9999',    // 褐灰色
    'Spinal cord': '#666699',    // 灰蓝色
    'Spleen': '#CC3366',         // 红紫色
    'Stomach': '#CC9966',        // 棕褐色
    'Testis': '#6699CC',         // 钴蓝色
    'Thymus': '#9999CC',         // 淡蓝色
    'Thyroid gland': '#CC99CC',  // 淡紫色
    'Uterus': '#FF6699',         // 玫瑰红
    'Vagina': '#FF99CC',         // 粉红色
    'default': '#666666'         // 默认灰色
}

// 获取tissue对应的颜色
const getTissueColor = (tissue: string) => {
    return tissueColors[tissue] || tissueColors.default
}

const _measureWidth = (canvas, w, scls, c, showLable) => {
    // determine which part of canvas will be used to draw given scls
    var ctx = canvas.getContext("2d"),
        cstart = Math.max(1, c(scls.start)),
        cend = Math.min(w, c(scls.end + 1)),
        actualWidth = Math.max(cend - cstart, showLable ? ctx.measureText(scls._text).width : 0);
    return { start: cstart, end: cstart + actualWidth };
}

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
}

const _drawItem = (canvas, x, y, w, h, scls, colors, c) => {
    var ctx = canvas.getContext("2d"),
        hRatio = h / 8,
        cstart = Math.max(1, c(scls.start)),
        cend = Math.min(w, c(scls.end + 1));

    ctx.save();
    ctx.translate(0, y + h / 2);
    ctx.lineWidth = 1;

    // 根据tissue设置颜色
    const fillColor = getTissueColor(scls.tissue)
    ctx.strokeStyle = fillColor
    ctx.fillStyle = fillColor

    var prot = 1;
    if (scls.strand == "+") prot = 1; else if (scls.strand == "-") prot = -1;
    _drawAnchor(ctx, cstart, -3 * hRatio, cend - cstart, 6 * hRatio, 0, 0)
    
    if (showLabel.value) {
        ctx.fillStyle = '#000000'; // 文字使用黑色以确保可读性
        ctx.font = "normal 9px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(scls._text, cstart, 6 * hRatio + 6);
    }

    ctx.restore();
}

const _adjustTitle = (modifier, onfinish) => {
    var track = this.element,
        opts = this.options;

    opts._title.css({
        width: track.height() - 12 // magic number
    });
    if (onfinish) onfinish();
}

const filteredData = ref([]);

const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})

const _addLinks = function(parent, canvas, y, w, h, postpad, scls, c) {
      // determine which part of canvas will be used to draw given scls
      var ctx  = canvas.getContext("2d");

      var cstart = Math.max(1, c(scls.start)),
          cend   = Math.min(w, c(scls.end+1)),
          actualWidth = Math.max(cend-cstart, 0),
          left = cstart;

      var elem = $("<div>").css({
        position: "absolute",
        top: y,
        left: left,
        //"background-color": "rgba(255, 0, 0, 0.3)",
        width: actualWidth,
        height: h + postpad,
        cursor: "pointer"
      }).attr({
        title: scls._tooltip
      }).appendTo(parent);
      return elem;
    }


onMounted(() => {
    watch([()=>option.value.series, () => chrom.value,() => start.value, () => end.value], async (newStart, newEnd) => {
        showSpin.value = true
        if (end.value - start.value < visibilityWidth) {
            isVisible.value = true
            canvasReady.value = false
            let lines = []
            await file.getLines(chrom.value, start.value, end.value, function(line, fileOffset) {
                const arr = line.split(/[\s]+/)
                const addedData = {
                chrom: arr[0],
                start:  Number(arr[1]),
                end:  Number(arr[2]),
                pvalue: arr[3],
                experiment: arr[5],
                tissue: arr[7]
            }
            lines.push(addedData)


            })
            // console.log(lines)
                drawPlotX(canvas.value, lines, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)
                canvasReady.value = true;
                showSpin.value = false;
        } else {
            isVisible.value = false
            canvasReady.value = true
        }
    }, { immediate: true, deep: true });


    watch(() => width.value, () => {
        showSpin.value = true
        if(width.value>0) {
        drawPlotX(canvas.value, filteredData.value, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)
        }
        showSpin.value = false;
    })


})


</script>


<style scoped></style>