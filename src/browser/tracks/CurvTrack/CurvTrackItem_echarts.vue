<template>
    <div ref="canvasContainer" :style="props.style">
        <spin :loading="showSpin" message=""  class="h-full w-full z-100" />
        <div ref="chartRef" style="width: 100%; height: 100%"></div>
        <n-alert title="" type="default" :bordered="true">
            {{ selectedInfo }}
        </n-alert>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, onUnmounted, nextTick } from 'vue';
import { useElementSize } from '@vueuse/core';
import { TabixIndexedFile } from '@gmod/tabix';
import { RemoteFile } from 'generic-filehandle';
import { useMessage } from 'naive-ui';
import { useScreenshotStore } from '@/browser/store';
import Spin from '../CompTrack/Spin.vue'
import * as echarts from 'echarts'

// echarts import
// import { use } from 'echarts/core'
// import { CustomChart } from 'echarts/charts'
// import {
//   TooltipComponent,
//   GridComponent,
//   DataZoomComponent
// } from 'echarts/components'
// import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'

// use([
//   TooltipComponent,
//   GridComponent,
//   DataZoomComponent,
//   CustomChart,
//   CanvasRenderer,
//   SVGRenderer
// ])

// Types
type Line = {
    chrom: string;
    start: number;
    end: number;
    chrom2: string;
    start2: number;
    end2: number;
    score: number;
};

// Store
const screenshotStore = useScreenshotStore();

// Props
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
    processedData: {
    type: Array,
    required: true
  },
});

// Refs
const message = useMessage();
const canvasContainer = ref(null);
const chartRef = ref(null);
const chart = ref(null);
const showSpin = ref(false);
const selectedInfo = ref('');
const emit = defineEmits(['zoomTo'])

// Computed
const chrom = computed(() => props.location.chrom);
const start = computed(() => props.location.start);
const end = computed(() => props.location.end);
const yAxisConfig = computed(() => props.option.yAxis)
const seriesConfig = computed(() => props.option.series[0])
let chartInstance: echarts.ECharts | null = null;

// Chart Instance
let screenshotChart: echarts.ECharts | null = null;
const { width, height } = useElementSize(canvasContainer);

// BigWig Setup
const file = new TabixIndexedFile({
    filehandle: new RemoteFile(props.option.url),
    tbiFilehandle: new RemoteFile(props.option.url + '.tbi')
});

// 计算缓冲区大小
function calculateBufferSize(start: number, end: number): number {
    const viewportSize = end - start;
    return Math.round(viewportSize * 1); // 设置缓冲区为可视区域的50%
}


// 计算带缓冲区的范围
let bufferSize 
let bufferedStart
let bufferedEnd

// Chart Functions
function updateChart(lines: Line[]) {

            
    // Calculate score ranges
    const scores = lines.map(f => props.option.yAxis?.log ? Math.log10(f.score) : f.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    
    const maxYAxis = props.option.yAxis?.scale === 'fixed' ? 
        (props.option.yAxis?.max || maxScore) : maxScore;
    const minYAxis = props.option.yAxis?.scale === 'fixed' ? 
        (props.option.yAxis?.min || 0) : 0;
        const centerY = maxYAxis / 2;

    //     const series = lines.map(line => {
    //     if (line.chrom !== line.chrom2) return null;
        
    //     const x1 = (line.start + line.end) / 2;
    //     const x2 = (line.start2 + line.end2) / 2;
    //     const height = props.option.yAxis?.log ? Math.log10(line.score) : line.score;
        
    //     return {
    //         type: 'custom',
    //         name: 'CurvTrackItem',
    //         animation: false,
    //         clip: true,
    //         renderItem: (params, api) => {
    //             const xStart = api.coord([x1, 0])[0];
    //             const xEnd = api.coord([x2, 0])[0];
    //             const yBase = api.coord([0, 0])[1]; // 中心线的屏幕坐标
    //             const yHeight = api.coord([0, height])[1];
    //             const yBottom = api.coord([0, 0])[1];
                
    //             const xDiff = xEnd - xStart;
    //             const cp1x = xStart + (xDiff * 0.15);
    //             const cp2x = xEnd - (xDiff * 0.15);
                
    //             const isFlipped = props.option.yAxis?.flip;

    //             // 计算原始曲线和镜像曲线的控制点
    //             let pathData;
    //             if (isFlipped) {
    //             // 在flip模式下，确保最低点达到height值
    //             // 控制点要比目标高度更低一些，以确保曲线能达到目标高度
    //             const heightOffset = Math.abs(yHeight - yBase);
    //             const adjustedOffset = heightOffset * 1.3; // 增加控制点偏移量

    //             pathData = [
    //                 ['M', xStart, yBase],
    //                 ['C', cp1x, yBase + adjustedOffset, cp2x, yBase + adjustedOffset, xEnd, yBase],
    //             ].join(' ');
    //         } else {
    //             // 在正常模式下，确保最高点达到height值
    //             // 控制点要比目标高度更高一些，以确保曲线能达到目标高度
    //             const heightOffset = Math.abs(yBottom - yHeight);
    //             const adjustedOffset = yHeight - (heightOffset * 0.3); // 调整控制点高度

    //             pathData = [
    //                 ['M', xStart, yBottom],
    //                 ['C', cp1x, adjustedOffset, cp2x, adjustedOffset, xEnd, yBottom],
    //             ].join(' ');
    //         }

    //             return {
    //                 type: 'path',
    //                 shape: { pathData },
    //                 style: {
    //                     fill: props.option.series[0].areaStyle?.color || 'rgba(255,0,0,0.05)',
    //                     stroke: props.option.series[0].lineStyle?.color || 'red',
    //                     lineWidth: props.option.series[0].lineStyle?.width || 2,
    //                     strokeOpacity: props.option.series[0].lineStyle.opacity || 1,
    //                     opacity: props.option.series[0].areaStyle?.opacity || 0.05
    //                 }
    //             };
    //         },
    //         data: [[x1, 0, x2, height]]
    //     };
    // }).filter(Boolean);

    // Set chart options
    const option = {
        animation: false,
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            formatter: (params) => {
                const item = props.processedData[params.dataIndex]
                return `${item.rawChrom1}:${item.rawStart1}-${item.rawEnd1}<br/>
                  ${item.rawChrom2}:${item.rawStart2}-${item.rawEnd2}<br/>
                 Score: ${item.score}<br/> `
            },
            position: 'top',
            extraCssText: 'z-index: 9999',
            appendToBody: true,
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: 'rgba(80, 80, 80, 0.9)',
            textStyle: { color: '#fff' }
        },
        grid: {
            show: false,
        left: '30px',
        right: '0px',
        bottom: '1px',
        top: '0px',
        containLabel: false,
        },
        xAxis: {
            type: 'value',
            min: props.location.start,
            max: props.location.end,
            show: false,
            animation: true,
        },
        yAxis: {
            type: 'value',
            show: props.option.yAxis?.show ?? true,
            offset: 0,            
            inverse: props.option.yAxis?.flip ?? false,
            axisLabel: {
                formatter: (value) => {
                    if (value == maxYAxis || value === minYAxis) {
                        return value.toFixed(0);
                    }
                    return '';
                },
                margin: 6,
                color: 'black',
                verticalAlignMinLabel: props.option.yAxis?.flip ? 'top' : 'bottom',
                verticalAlignMaxLabel: props.option.yAxis?.flip ? 'bottom' : 'top'
            },
            interval: maxYAxis - minYAxis,
            min: minYAxis,
            max: maxYAxis,
            axisTick: { show: true, length: 4 },
            splitLine: { show: false }

        },
        // dataZoom: [{
        //     filterMode: 'filter',
        //     type: 'inside',
        //     startValue: start.value,
        //     endValue: end.value,
        //     zoomOnMouseWheel: false,  // 禁用鼠标滚轮缩放
        //     moveOnMouseMove: true,   // 禁用鼠标移动平移
        //     preventDefaultMouseMove: true,
        //     moveOnMouseWheel: false,
        //     zoomLock: true,
        //     throttle: 0

        // }],
        series: [{
            type: 'custom',
            name: 'CurvTrackItem',
            animation: false,
            // clip: true,
            renderItem: (params, api) => {
    const x1 = api.value(0);
    const x2 = api.value(1);
    const height = api.value(2);
    const xStart = api.coord([x1, 0])[0];
    const xEnd = api.coord([x2, 0])[0];
    const yBase = api.coord([0, 0])[1];
    const yHeight = api.coord([0, height])[1];
    const coordSys = params.coordSys;
    const yBottom = coordSys.height;
    
    const xDiff = xEnd - xStart;
    const cp1x = xStart + (xDiff * 0.15);
    const cp2x = xEnd - (xDiff * 0.15);
    
    const isFlipped = props.option.yAxis?.flip;

    let linePath;
    let areaPath;
    
    if (isFlipped) {
        const heightOffset = Math.abs(yHeight - yBase);
        const adjustedOffset = heightOffset * 1.5;
        
        // 线条路径
        linePath = [
            ['M', xStart, yBase],
            ['C', cp1x, yBase + adjustedOffset, cp2x, yBase + adjustedOffset, xEnd, yBase],
        ].join(' ');
        
        // 区域路径
        areaPath = [
            ['M', xStart, yBase],
            ['C', cp1x, yBase + adjustedOffset, cp2x, yBase + adjustedOffset, xEnd, yBase],
            ['L', xEnd, yBase],
            ['L', xStart, yBase],
            ['Z']
        ].join(' ');
    } else {
        const heightOffset = Math.abs(yBottom - yHeight);
        const adjustedOffset = yHeight - (heightOffset * 0.3);
        
        // 线条路径
        linePath = [
            ['M', xStart, yBottom],
            ['C', cp1x, adjustedOffset, cp2x, adjustedOffset, xEnd, yBottom],
        ].join(' ');
        
        // 区域路径
        areaPath = [
            ['M', xStart, yBottom],
            ['C', cp1x, adjustedOffset, cp2x, adjustedOffset, xEnd, yBottom],
            ['L', xEnd, yBottom],
            ['L', xStart, yBottom],
            // ['Z']
        ].join(' ');
    }

    return {
        type: 'group',
        children: [
            {
                // 区域
                type: 'path',
                shape: { pathData: areaPath },
                style: {
                    fill: props.option.series[0].areaStyle?.color || 'rgba(255,0,0,0.0)',
                    opacity: props.option.series[0].areaStyle?.opacity || 0
                }
            },
            {
                // 线条
                type: 'path',
                shape: { pathData: linePath },
                style: {
                    fill: 'none',
                    stroke: props.option.series[0].lineStyle?.color || 'rgba(255,0,0,0.0)',
                    lineWidth: props.option.series[0].lineStyle?.width || 1,
                    opacity: props.option.series[0].lineStyle?.opacity || 1
                }
            }
        ]
    };
},
            encode: {
                x: [0, 1],
                y: 2
            },
            data: lines
    .filter(line => {
        // 首先过滤相同染色体的数据
        if (line.chrom !== line.chrom2) return false;
        
        // 获取区间范围
        const viewStart = start.value;
        const viewEnd = end.value;
        
        // 检查两个端点的位置
        const point1InRange = line.start >= viewStart && 
                             line.end <= viewEnd;
        const point2InRange = line.start2  >= viewStart && 
                             line.end2<= viewEnd;
        
        // 根据 show 选项进行过滤
        if (props.option.data?.show === 'one') {
            // 一端在内部即可
            return point1InRange || point2InRange;
        } else if (props.option.data?.show === 'both') {
            // 默认或 'both'：两端都必须在内部
            return point1InRange && point2InRange;
        }
    })
    .map(line => {
        const x1 = (line.start + line.end) / 2;
        const x2 = (line.start2 + line.end2) / 2;
        const height = props.option.yAxis?.log ? Math.log10(line.score) : line.score;
        return {value: [x1, x2, height]};
    })
        }],
    };

    chartInstance.setOption(option);
    chartInstance.on('dataZoom', (evt) => {
        var option = chartInstance.getOption();
        // console.log(option.dataZoom);
        emit('zoomTo', chrom.value, option.dataZoom[0].startValue,option.dataZoom[0].endValue)
    })
}

function createSvgChart() {
    if (!canvasContainer.value || !chartInstance) return;

    const screenshotDiv = document.getElementById('screenshot-container');
    if (!screenshotDiv) return;
    
    const svgContainer = document.createElement('div');
    svgContainer.style.width = `${width.value}px`;
    svgContainer.style.height = `${height.value}px`;
    screenshotDiv.appendChild(svgContainer);

    screenshotChart = echarts.init(svgContainer, undefined, {
        renderer: 'svg',
        width: width.value,
        height: height.value
    });

    const currentOption = chartInstance.getOption();
    screenshotChart.setOption(currentOption);

    if (screenshotChart) {
        return screenshotChart.getDataURL({
            type: 'svg',
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
    }
}

// Data Functions
// const deduplicateArray = (data: Line[]) => {
//     const uniqueEntries = new Set();
//     const result: Line[] = [];

//     data.forEach((item) => {
//         const { chrom, start, end, chrom2, start2, end2 } = item;
//         const original = [chrom, start, end, chrom2, start2, end2];
//         const swapped = [chrom2, start2, end2, chrom, start, end];

//         const sortTriplet = (triplet: any[]) => triplet.sort((a, b) => a - b);
//         const originalTriplet1 = sortTriplet(original.slice(0, 3));
//         const originalTriplet2 = sortTriplet(original.slice(3, 6));
//         const swappedTriplet1 = sortTriplet(swapped.slice(0, 3));
//         const swappedTriplet2 = sortTriplet(swapped.slice(3, 6));

//         const canonicalOriginal = [...originalTriplet1, ...originalTriplet2].join(',');
//         const canonicalSwapped = [...swappedTriplet1, ...swappedTriplet2].join(',');
//         const canonical = [canonicalOriginal, canonicalSwapped].sort()[0];

//         if (!uniqueEntries.has(canonical)) {
//             uniqueEntries.add(canonical);
//             result.push(item);
//         }
//     });

//     return result;
// };

let lines: Line[] = [];

async function fetchAndUpdateData() {

    bufferSize = calculateBufferSize(start.value, end.value);
 bufferedStart = Math.max(1, start.value - bufferSize);
 bufferedEnd = end.value + bufferSize;

    await file.getLines(chrom.value, bufferedStart, bufferedEnd, function (line) {
            let splitData, arr;

            if (line.includes(";")) {
                splitData = line.split(";");
                arr = splitData[0].split(/[\s,:-]+/);
            } else {
                arr = line.split(/[\s,:-]+/);
            }

            lines.push({
                chrom: arr[0],
                start: Number(arr[1]),
                end: Number(arr[2]),
                chrom2: arr[3],
                start2: Number(arr[4]),
                end2: Number(arr[5]),
                score: Number(arr[6])
            });
        });

        // lines = deduplicateArray(lines);

        return lines
}


const initializeChart = ()=> {
    chartInstance = echarts.init(chartRef.value, null, {
        renderer: props.option.renderer || 'canvas'
    });
}

// Lifecycle Hooks
onMounted( () => {
    // chart initialization 
    // showSpin.value = true;
    // initializeChart()
    // // lines = await fetchAndUpdateData()
    // lines = 
    // updateChart(lines)
    // showSpin.value = false;

    watch(() => props.processedData, () => {
  nextTick(() => {
    if (props.processedData.length > 0) {
        showSpin.value = true;
        initializeChart()
        updateChart(props.processedData)
        showSpin.value = false
    }
  })
}, {immediate: true, deep: true })

    //  when data updates
    // watch([chrom, start, end], async () => {
    //     showSpin.value = true;
    //     lines = await fetchAndUpdateData()
    //     // put code here
    //     updateChart(lines); 
    //     showSpin.value = false;
    //    // chartInstance.dispatchAction({ type: 'showDataView' });
    // }, { deep: true });


// Watch location changes
// watch([chrom, start, end], async (newValues, oldValues) => {
//     const [newChrom, newStart, newEnd] = newValues;
//     const [oldChrom, oldStart, oldEnd] = oldValues;
    
//     showSpin.value = true;

//     // 检查是否在缓冲区范围内
//     if (newChrom === oldChrom && 
//         newStart > bufferedStart && 
//         newEnd < bufferedEnd && ((newEnd - newStart) == (oldEnd - oldStart))) {
        
//         // 使用 nextTick 确保 DOM 更新后再触发事件
//         // await nextTick();
        
//         if (chartInstance) {
//             chartInstance.dispatchAction({
//                 type: 'dataZoom',
//                 zoomLock: true,
//                 startValue: newStart,
//                 endValue: newEnd
//             });
//         }
//     } else {
//         // 更新缓冲区范围
//         bufferSize = calculateBufferSize(newStart, newEnd);
//         bufferedStart = Math.max(1, newStart - bufferSize);
//         bufferedEnd = newEnd + bufferSize;
//         lines = await fetchAndUpdateData()
//         updateChart(lines); 
//     }

//     showSpin.value = false;
// }, { deep: true });

    // when option updates
    watch([yAxisConfig, seriesConfig], ()=> {
        showSpin.value = true;
        //drawBezierCurves(lines);
        // put code here
        nextTick(() => {
          updateChart(props.processedData); 
        })
        showSpin.value = false;
    }, {  deep: true })

    // when size updates
    watch([() => width.value, () => height.value], () => {
        chartInstance?.resize();
    });
});

watch(
    () => screenshotStore.timestamp,
    async () => {
        if (screenshotStore.screenshotType === 'svg') {
            createSvgChart();
        }
    }
);

onUnmounted(() => {
    chartInstance?.dispose();
});
</script>