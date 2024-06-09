<template>
    <n-scrollbar v-if="isVisible">
        <div ref="canvasContainer" :style="props.style">
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


const canvasContainer = ref(null)
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
const option = computed(() => {
    return props.option
})
const url = props.option.url
const isVisible = ref(false)
let visibilityWidth = 10000000
const canvasReady = ref(false)
const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})


onMounted(() => {
    watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], async (newStart, newEnd) => {
        showSpin.value = true
        if (end.value - start.value < visibilityWidth) {
            isVisible.value = true
            canvasReady.value = false
            let lines = []
            await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
                const arr = line.split(/[\s]+/)
                const addedData = {
                    chrom: arr[0],
                    start: Number(arr[1]),
                    end: Number(arr[2]),
                    snp: arr[3],
                    A1: arr[4],
                    A2: arr[5],
                    Pvalue: arr[6],
                    mlogP: arr[7],
                    EAF: arr[8],
                    Gene: arr[11],
                    Trait: arr[12],
                    N_case: arr[14],
                    N_control: arr[15]
                }
                lines.push(addedData)


            })

            // Transform to [[start_value, mlogP_value]]
            const transformedArray = lines.map(item => ({
                data: [[item.start, parseFloat(item.mlogP)]],// Convert mlogP string to float
                snp: item.snp,
                Trait: item.Trait,
                chrom: item.chrom,
                start: item.start,
                A1: item.A1,
                A2: item.A2,
                Pvalue: item.Pvalue,
                Gene: item.Gene,
                // Trait: item.Trait
                // fill: props.option.series[0].itemStyle.color
                color: 'white'

            }
            ))

            var plot = $.plot(canvasContainer.value, transformedArray, {
                series: {
                    lines: {
                        show: false
                    },
                    points: {
                        show: true,
                        lineWidth: 1,
                        radius: 5,
                        fill: true,
                        fillColor: props.option.series[0].itemStyle.color,
                        opacity: props.option.series[0].itemStyle.opacity
                        // color: props.option.series[0].itemStyle.color
                    },
                    shadowSize: 0
                },
                grid: {
                    show: true,
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true,
                    labelMargin: -50,
                    // minBorderMargin: 0,
                },
                yaxis: {
                    show: true,
                    tickLength: 0,
                    position: 'left',
                    // labelWidth: 20,
                    // labelHeight: 10,
                    tickFormatter: function (val, axis) {
                        // console.log(val,axis)
                        if (val / 1000 != 0 && val % 1000 == 0) return (val / 1000) + "k";
                        return val;
                    }
                },
                xaxis: {
                    show: false,
                    min: start.value,
                    max: end.value
                }//,
                // zoom: {
                //     interactive: true
                // },
                // pan: {
                //     interactive: true,
                //     enableTouch: true
                // }
            });

            // window.setInterval(function () {
            //     plot.setData([
            //         { data: sin, label: "sin(x)"},
            //         { data: cos, label: "cos(x)"}
            //     ]);
            // }, 2000);

            $("<div id='tooltip'></div>").css({
                position: "absolute",
                display: "none",
                border: "1px solid #fdd",
                padding: "2px",
                "background-color": "#fee",
                opacity: 0.80
            }).appendTo("body");

            $(canvasContainer.value).bind("plothover", function (event, pos, item) {

                if (!pos.x || !pos.y) {
                    return;
                }

                // if ($("#enablePosition:checked").length > 0) {
                //     var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
                //     $("#hoverdata").text(str);
                // }

                // if ($("#enableTooltip:checked").length > 0) {
                if (item) {
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);


                    // console.log(item)
                    // Prepare the tooltip HTML content with each piece of data on a new line
                    var tooltipHtml = "SNP id: " + item.series.snp + "<br>" +
                        "Trait: " + item.series.Trait + "<br>" +
                        "chrom: " + item.series.chrom + "<br>" +
                        "start: " + item.series.start + "<br>" +
                        "Minor allele: " + item.series.A1 + "<br>" +
                        "Major allele: " + item.series.A2 + "<br>" +
                        "Pvalue: " + item.series.Pvalue + "<br>" +  // Assuming Pvalue is a number that might need toFixed
                        "Gene: " + item.series.Gene

                    $("#tooltip").html(tooltipHtml)
                        .css({ top: item.pageY + 5, left: item.pageX + 5 })
                        .fadeIn(200);
                } else {
                    $("#tooltip").hide();
                }
                // }
            });

            $(canvasContainer.value).bind("plothovercleanup", function (event, pos, item) {
                $("#tooltip").hide();
            });

            $(canvasContainer.value).bind("plotclick", function (event, pos, item) {
                // if (item) {
                //     console.log(item.series.snp)
                //     $("#clickdata").text(item.series.snp);
                //     plot.highlight(item.series, item.datapoint);
                // }
                //     if (item) {
                //             var x = item.datapoint[0].toFixed(2),
                //                 y = item.datapoint[1].toFixed(2);
                // console.log(item)
                //             $("#tooltip").html(item.series.snp + " of " + x + " = " + y)
                //                 .css({top: item.pageY+5, left: item.pageX+5})
                //                 .fadeIn(200);
                //         } else {
                //             $("#tooltip").hide();
                //         }
            });

            // Add the Flot version string to the footer

            // $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");




            // console.log(lines)
            // drawPlotX(canvas.value, lines, false, canvasContainer.value, h.value, prepad.value, postpad.value, showLabel.value, _drawItem, _measureWidth, start.value, end.value, null, _addLinks)
            canvasReady.value = true;
            showSpin.value = false;
        } else {
            isVisible.value = false
            canvasReady.value = true
        }
    }, { immediate: true, deep: true });


    watch([() => width.value, () => props.style], () => {
        showSpin.value = true
        if (width.value > 0 && plot.value) {
            plot.value.resize();
            plot.value.setupGrid();
            plot.value.draw();
            // var tickLabels = document.querySelectorAll('.y1Axis .tickLabel');
            // tickLabels.forEach(function (label) {
            //     label.style.whiteSpace = 'nowrap';
            //     label.style.transform = 'translate(-50px, 0) rotate(-0deg)';
            //     // label.style.textIndent = '-100%';
            //     label.style.transformOrigin = 'top right';
            //     label.style.textAlign = 'right';
            //     // label.style.height = '40px';
            // });
        }
        showSpin.value = false;
    })


})


</script>


<style scoped></style>