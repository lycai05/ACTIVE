<template>
    <div v-if="isVisible">
    <div ref="canvasContainer" class="basic-canvas" :style="props.style">
        <canvas ref="canvas"></canvas>
        <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { RemoteFile } from 'generic-filehandle'
import { IndexedFasta } from '@gmod/indexedfasta'
import { useElementSize } from '@vueuse/core'

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

const canvasContainer = ref(null)

const { width} = useElementSize(canvasContainer)
const showSpin = ref(null)
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
const canvas = ref(null)
const isVisible = ref(false)
const height = 18

const _colors = {
    A: '#0c0',
    C: '#00a',
    G: '#da0',
    T: '#c00',
    N: '#777',
    '?': 'white'
}


const _drawPlot = (seq) => {
    // var opts = this.options,
    //     vars = this.options._vars,
    //     canvas = opts._canvas;

    canvas.value.width = width.value
    canvas.value.height = 24

    var w = canvas.value.width,
        h = canvas.value.height;

    // console.log(w, h)
    var len = end.value - start.value + 1,
        blocksize = w / len;

    var ctx = canvas.value.getContext('2d');
    ctx.save();

    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = '16px bold';

    var p = 0, q = blocksize;

    for (var i = 0; i < end.value - start.value; i++) {
        var chr = seq[i]
        const col = _colors[chr.toUpperCase()] || '?';
        console.log(col)

        ctx.clearRect(Math.round(p), 0, Math.round(q), h);
        ctx.fillStyle = col;
        ctx.fillText(chr, p + blocksize / 2, h  );

        p += blocksize;
        q += blocksize;
    }

    ctx.restore();
}

const url = props.option.url

const file = new IndexedFasta({
    fasta: new RemoteFile(url),
    fai: new RemoteFile(url + '.fai'),
})

onMounted(() => {
    watch([()=>width.value,() => option.value.series, () => chrom.value, () => start.value, () => end.value], () => {

        if (end.value - start.value < 100) {
            isVisible.value = true
            file.getSequence(chrom.value, start.value, end.value).then((seq) => {
                _drawPlot(seq)
            })
        } else {
            isVisible.value = false
        }

    }, { immediate: true, deep: true });


})


</script>