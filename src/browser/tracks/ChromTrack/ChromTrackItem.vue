<template>
    <div class="relative h-full w-full"  :style="props.style">

        <div ref="cvs_holder" class="relative track-content flex-auto" style="overflow: hidden">
            
            <div ref="canvasContainer">
                <div style="height: 60px" ref="overview"></div>
            </div>
        </div>
        <!-- <div style="visibility: hidden;" class="track-item-config-holder track-item-drag-handler cursor-pointer bg-gray-300 rounded-r-lg relative w-6 flex-none flex flex-col justify-between items-center pt-1 pb-1"> -->
        <!-- </div> -->
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref, watch, useAttrs, onUnmounted } from 'vue';
// import { BASIC_intComma } from '../utils/utils.js'
import { useElementSize } from '@vueuse/core'
import * as echarts from 'echarts'

const props = defineProps({
    location: {
      type: Object,
      required: true
    },
    chromSizes: {
        type: Object,
        required: true
    },
    chromBands: {
        type: String,
        required: false
    },
    trackViewIndex: {
        default: 0
    },

})

const emit = defineEmits(['zoomTo'])
const attrs = useAttrs()

const overview = ref(null)
let overviewChart = null

const type = ref(props.type)
const chromNames = ref(() => props.chromNames)

let cytoband = null
const chromBands = ref(null)

if (props.chromBands) {
    chromBands.value = props.chromBands
    cytoband = true
} else {
    cytoband = false
}

const chromSizes = ref(props.chromSizes)

const chrom = computed(() => props.location.chrom)
let oldChrom = chrom.value
const start = computed(() => props.location.start)
const end = computed(() => props.location.end)
const max = computed(() => props.location.max)
const min = computed(() => props.location.min)

const canvasContainer = ref(null)
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

function processCytobandData(chromBands) {
    const processedData = {};
    
    chromBands.split('\n').forEach(line => {
        if (!line.trim()) return;
        
        const [chrom, start, end, band, type] = line.split('\t');
        if (!processedData[chrom]) {
            processedData[chrom] = [];
        }
        
        processedData[chrom].push({
            start: parseInt(start),
            end: parseInt(end),
            band,
            type
        });
    });
    
    return processedData;
}

function formatGenomicRegion(bp) {
    if (bp < 1000) {
        return bp + " bp";
    } else if (bp < 1000000) {
        return (bp/1000).toFixed(1) + " Kb";
    } else {
        return (bp/1000000).toFixed(1) + " Mb";
    }
}

function drawChrom(chrom, min, max, chromSizes, chromBands, width, _colorCodes, cytoband = true) {
    let series = []

    if (cytoband === true && chromBands) {
        const processedBands = processCytobandData(chromBands);
        const currentChromBands = processedBands[chrom] || [];

        series = [{
            type: 'custom',
            renderItem: (params, api) => {
                const group = {
                    type: 'group',
                    children: []
                };

                currentChromBands.forEach(band => {
                    const start = Math.max(band.start, min);
                    const end = Math.min(band.end, max);
                    
                    if (start < max && end > min) {
                        const x = api.coord([start, 0])[0];
                        const width = api.coord([end, 0])[0] - x;
                        
                        group.children.push({
                            type: 'rect',
                            shape: {
                                x: x,
                                y: -0, // 调整矩形位置
                                width: Math.max(1, width),
                                height: 0
                            },
                            style: {
                                
                                fill: _colorCodes[band.type] || '#666',
                                stroke: '#333',
                                strokeWidth: 0.5
                            }
                        });

                     //   if (width > 40) {
                     //       group.children.push({
                      //          type: 'text',
                      //          style: {
                      //              text: band.band,
                      //              x: x + width / 2,
                      //             y: 55, // 调整标签位置
                      //             fontSize: 10,
                      //              fill: '#666',
                       //             align: 'center',
                       //             verticalAlign: 'middle'
                       //         }
                       //     });
                       // }
                    }
                });

                return group;
            },
            data: [[min, 0]],
            z: 10
        }];
    } else {
        series = [{
            type: 'custom',
            renderItem: (params, api) => {
                return {
                    type: 'rect',
                    shape: {
                        x: 0,
                        y: -10,
                        width: api.getWidth(),
                        height: 0
                    },
                    style: {
                        fill: 'none',
                        stroke: 'black'
                    }
                };
            },
            data: [[0, 0]],
            z: 10
        }];
    }

    const options = {
        animation: false,
        grid: {
            show: false,
            left: '30px',    // 移除左边距
            right: '0%',
            top: 30,    // 为滑块留出空间
            bottom: 40,  // 为x轴标签留出空间
            containLabel: false

        },
        xAxis: {
            type: 'value',
            min: min,
            max: max,
            axisLabel: {
                formatter: function(value) {
                    const formattedValue = formatGenomicRegion(value);
                    return formattedValue;  // Always return string value
                },
                color: '#333',
                margin: 14,  // 增加标签与轴线的距离
                hideOverlap: false,
                overflow: 'break',
                align: function(value) {
                    // Apply alignment without returning an object
                    if (Math.abs(value - min) < (max - min) / 100) {
                        return 'left';
                    } else if (Math.abs(value - max) < (max - min) / 100) {
                        return 'right';
                    }
                    return 'center';
                }
            },
            position: 'bottom', // x轴标签位置
            splitLine: {
                show: false
            },
            axisTick: {
                show: true,
                length: 8,
                alignWithLabel: true
            },
            splitNumber: Math.max(2, Math.floor(width / 120)), // Adjust number of ticks based on width
            z: 1
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 1,
            show: false,
            offset: 0,
            axisTick: { show: false, length: 4 },
            splitLine: { show: false }
        },
        series: series,
        dataZoom: [
            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'filter',
                height: 15,
                top: 0,
                left: '27px',  // 确保滑块与图表对齐
                right: 0, // 确保滑块与图表对齐
                borderColor: 'transparent',
                backgroundColor: '#e2e2e2',
                fillerColor: 'oklch(0.488 0.243 264.376)',
                handleIcon: '',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                moveHandleSize: 8, // 减小手柄大小
                moveHandleStyle: {
                    color: '#aaa'
                },
                emphasis: {
                    handleStyle: {
                        color: '#fff'
                    }
                },
                textStyle: {
                    color: '#333',
                    fontSize: 11
                },
                selectedDataBackground: {
                    lineStyle: {
                        color: '#7189b5'
                    },
                    areaStyle: {
                        color: '#7189b5'
                    }
                },
                realtime: false,
                showDetail: false, // 隐藏两端的文本框
                zoomLock: true,   // 锁定缩放比例
                //brushSelect: false // 禁用刷选功能
                throottle: 100
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none',
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: false,
                throttle: 100
            }
        ],
        tooltip: {
            show: false
        }
    }

    if (!overviewChart) {
        overviewChart = echarts.init(overview.value, null, { renderer: 'svg'})
    }
    overviewChart.setOption(options)

    overviewChart.off('datazoom')
    overviewChart.on('datazoom', function(params) {
        const option = overviewChart.getOption()
        const startValue = option.dataZoom[0].startValue
        const endValue = option.dataZoom[0].endValue
        if (startValue !== undefined && endValue !== undefined) {
            emit('zoomTo', chrom.value, startValue, endValue, props.trackViewIndex)
        }
    })

    return series
}

const content = ref(null);
const leftDragBound = ref(0)
const rightDragBound = computed(() => {
    if (content.value) {
        return content.value.offsetWidth;
    }
    return null
})

const pixelWidth = computed(() => {
    return rightDragBound.value - leftDragBound.value;
})

const { width } = useElementSize(canvasContainer)

onMounted(() => {
    let series = drawChrom(chrom.value, min.value, max.value, chromSizes.value, chromBands.value, pixelWidth.value, _colorCodes, cytoband)
    
    overviewChart.setOption({
        dataZoom: [{
            startValue: start.value,
            endValue: end.value
        }]
    })

    watch(() => chrom.value, (newValue) => {
        if (overviewChart) {
            series = drawChrom(chrom.value, min.value, max.value, chromSizes.value, chromBands.value, width.value, _colorCodes, cytoband)
            overviewChart.setOption({
                dataZoom: [{
                    startValue: start.value,
                    endValue: end.value
                }]
            })
        }
    })

    watch([() => props.location.start, () => props.location.end], (newValues, oldValues) => {
        const [newStart, newEnd] = newValues;

        if (oldChrom != chrom.value) {
            oldChrom = chrom.value
            return
        }
        if (overviewChart) {
            overviewChart.dispatchAction({
                type: 'dataZoom',
                zoomLock: true,
                startValue: newStart,
                endValue: newEnd
            });
        }
    })

    let resizeTimeout
    watch(() => width.value, () => {
        if (overviewChart) {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(() => {
                overviewChart.resize()
            }, 100)
        }
    })
})

onUnmounted(() => {
    if (overviewChart) {
        overviewChart.dispose()
    }
})
</script>

<style>
.track-item {
    position: relative;
}
</style>