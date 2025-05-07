<template>
    <!-- <div v-if="isVisible" class="relative"> -->
        <!-- <div class="relative h-full w-full border"  :style="props.style"> -->
            <!-- 外层容器，可滚动 -->
        <!-- <div class="w-full overflow-auto" :style="containerStyle"> -->
            <!-- 图表容器，高度根据内容动态计算 -->
            <!-- <div class="test absolute left-[35px] bg-blue-100/50 border z-20 h-full right-0"></div> -->
<div class=" h-full border border-gray-200 ml-[30px]" :style="props.style">
<n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
    <div ref="chartContainer" :style="[ {height: `${canvasHeight}px`}]" class="w-full relative">

    </div>
        <!-- </div> -->
    <!-- </div> -->
    <!-- <div v-else>
        <n-alert title="" type="warning">
            Too many items. Zoom in (< 500Kb) to see features
        </n-alert>
    </div> -->
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { TabixIndexedFile } from '@gmod/tabix';
import { RemoteFile } from 'generic-filehandle';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useScreenshotStore } from '@/browser/store'
import { useElementSize } from '@vueuse/core';

const screenshotStore = useScreenshotStore()

interface Location {
    chrom: string;
    start: number;
    end: number;
}

interface DataItem {
    chrom: string;
    start: number;
    end: number;
    pvalue: string;
    experiment: string;
    tissue: string;
    row?: number;
}

interface Props {
    location: Location;
    option: {
        url: string;
        series: any;
        renderer?: string;
    };
    dataLoaded?: boolean;
    style: object;
    trackViewIndex: {
        default: 0
    }
}

const props = defineProps<Props>();

const chartContainer = ref<HTMLElement | null>(null);
const chart = ref<echarts.ECharts | null>(null);
const showSpin = ref(false);
const isVisible = ref(true);
const visibilityWidth = 10000000000;
const emit = defineEmits(['zoomTo'])

// 添加新的常量定义
const RECT_HEIGHT = 10; // 每个矩形的固定高度(px)
const FIRST_ROW_GAP = 5; // 第一行和顶部的间隙(px)
const LAST_ROW_GAP = 5; // 最后一行和底部的间隙(px)
const MIDDLE_ROW_GAP = 5; // 行间距(px)
const canvasHeight = ref(0); // canvas的总高度

const chrom = computed(() => props.location.chrom);
const start = computed(() => props.location.start);
const end = computed(() => props.location.end);
const option = computed(() => props.option);
// const yAxisConfig = computed(() => props.option.yAxis)
const seriesConfig = computed(() => props.option.series[0])
let chartInstance: echarts.ECharts | null = null;

// 容器样式计算
const containerStyle = computed(() => ({
    height: props.style.height || '100%',
}));

const url = props.option.url;
const { width, height } = useElementSize(chartContainer);

// 计算缓冲区大小
function calculateBufferSize(start: number, end: number): number {
    const viewportSize = end - start;
    return Math.round(viewportSize * 1); // 设置缓冲区为可视区域的50%
}


// 计算带缓冲区的范围
let bufferSize 
let bufferedStart
let bufferedEnd

// 颜色映射对象
const tissueColors = {
    'Adipose': '#FF9999',
    'Adrenal gland': '#FF99CC',
    'Bladder': '#CC99FF',
    'Blood vessel': '#FF0000',
    'Brain': '#9999FF',
    'Breast': '#FF99FF',
    'Colon': '#996633',
    'Esophagus': '#CC6666',
    'Heart': '#FF3333',
    'Kidney': '#993366',
    'Liver': '#CC6600',
    'Lung': '#FF9966',
    'Lymph node': '#99CC00',
    'Muscle': '#CC3333',
    'Nerve': '#9966CC',
    'Ovary': '#FF66CC',
    'Pancreas': '#FFCC66',
    'Placenta': '#FF6666',
    'Prostate gland': '#6666CC',
    'Skin': '#FFB399',
    'Soft tissue': '#CC9999',
    'Spinal cord': '#666699',
    'Spleen': '#CC3366',
    'Stomach': '#CC9966',
    'Testis': '#6699CC',
    'Thymus': '#9999CC',
    'Thyroid gland': '#CC99CC',
    'Uterus': '#FF6699',
    'Vagina': '#FF99CC',
    'default': '#666666'
};

const getTissueColor = (tissue: string): string => {
    return tissueColors[tissue] || tissueColors.default;
};

const assignRows = (items: DataItem[]): DataItem[] => {
    const rows: DataItem[][] = [];
    items.forEach(item => {
        let row = 0;
        while (true) {
            const overlapping = rows[row]?.some(existing => 
                !(item.start >= existing.end || item.end <= existing.start)
            );
            
            if (!overlapping) {
                if (!rows[row]) rows[row] = [];
                rows[row].push(item);
                item.row = row;
                break;
            }
            row++;
        }
    });
    
    // 计算canvas总高度
    const totalRows = rows.length;
    if (totalRows === 0) {
        canvasHeight.value = FIRST_ROW_GAP + LAST_ROW_GAP; // 没有数据时的最小高度
    } else {
        // 计算总高度 = 顶部间隙 + (总行数 * 矩形高度) + ((总行数-1) * 中间间隙) + 底部间隙
        canvasHeight.value = FIRST_ROW_GAP + 
                            (totalRows * RECT_HEIGHT) + 
                            ((totalRows - 1) * MIDDLE_ROW_GAP) + 
                            LAST_ROW_GAP;
    }
    
    return items;
};

const initChart = (): void => {
    if (chartContainer.value) {
        chartInstance = echarts.init(chartContainer.value, null, {renderer: props.option.renderer || 'canvas'});
    }
};

const updateChart = (data: DataItem[]): void => {
    if (!chartInstance) return;

    const processedData = assignRows(data);
    const maxRow = Math.max(...processedData.map(item => item.row || 0));
    
    const chartOption: EChartsOption = {
        animation: false,
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            formatter: (params: any) => {
                const {data} = params;
                return `Position: ${data[0]}-${data[2]}<br/>`;
            },
            position: 'top',
            extraCssText: 'z-index: 9999',
            appendToBody: true,
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: 'rgba(80, 80, 80, 0.9)',
            textStyle: {
                color: '#fff'
            }
        },
        grid: {
            show: false,
            left: '0px',
            right: '0%',
            bottom: '1px',
            top: '0px',
            containLabel: false,
            // height: canvasHeight.value
        },
        xAxis: {
            type: 'value',
            min: bufferedStart,
            max: bufferedEnd,
            show: false,
        },
        yAxis: {
            show: false,
            type: 'value',
            min: 0,
            max: maxRow,
            interval: maxRow + 10,
            offset: 0,
            inverse: props.option.yAxis?.flip ?? false,
            axisTick: {
                show: false,
                length: 0
            },
            axisLabel: {
                formatter: function(value) {
                    return ''
                },
                margin: 0
            },
            splitLine: {
                show: false,
                lineStyle: {
                    opacity: 0
                }
            },
        },
        dataZoom: [{
            filterMode: 'filter',
            type: 'inside',
            startValue: start.value,
            endValue: end.value,
            zoomOnMouseWheel: false,  // 禁用鼠标滚轮缩放
            moveOnMouseMove: true,   // 禁用鼠标移动平移
            preventDefaultMouseMove: true,
            moveOnMouseWheel: false,
            zoomLock: true,
            throttle: 100

        }],
        series: [{
            type: 'custom',
            animation: false,
            large:true,
            largeThreshold: 10000,
            clip: true,
            renderItem: (params: any, api: any) => {
    const start = api.value(0);
    const row = api.value(1);
    const end = api.value(2);
    const tissue = api.value(3);
    
    const [x1, y1] = api.coord([start, row]);
    const [x2] = api.coord([end, row]);
    
    // 调整y坐标计算，考虑间隙
    const yPosition = FIRST_ROW_GAP + (row * (RECT_HEIGHT + MIDDLE_ROW_GAP));
    
    // Use configured color if available, otherwise use tissue-based color
    const configuredColor = seriesConfig.value?.itemStyle?.color;
    const fillColor = configuredColor || getTissueColor(tissue);
    
    // Calculate y position based on flip setting
    const isFlipped = props.option.yAxis?.flip ?? false;
    const finalYPosition = isFlipped ? 
        canvasHeight.value - yPosition - RECT_HEIGHT : 
        yPosition;

    return {
        type: 'rect',
        shape: {
            x: x1,
            y: finalYPosition,
            width: Math.max(x2 - x1, 1),
            height: RECT_HEIGHT
        },
        style: {
            fill: fillColor,
            stroke: '#fff',
            lineWidth: 0.5
        }
    };
},
            dimensions: ['start', 'row', 'end', 'tissue', 'experiment'],
            encode: {
                x: [0, 2],
                y: 1,
                tooltip: [3, 4]
            },
            data: processedData.map(item => [
                item.start,
                item.row,
                item.end,
                item.tissue,
                item.experiment
            ])
        }]
    };

    chartInstance.setOption(chartOption);
    chartInstance.on('dataZoom', (evt) => {
        var option = chartInstance.getOption();
        // console.log(option.dataZoom);
        emit('zoomTo', chrom.value, option.dataZoom[0].startValue,option.dataZoom[0].endValue, props.trackViewIndex)
    })
};

const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
});

let screenshotChart: echarts.ECharts | null = null;

function createSvgChart() {
    if (!chartContainer.value || !chartInstance) return;

    const currentWidth = width.value;
    const currentHeight = height.value;

    const screenshotDiv = document.getElementById('screenshot-container');
    if (!screenshotDiv) return;
    
    const svgContainer = document.createElement('div');
    svgContainer.style.width = `${currentWidth - 40}px`;
    svgContainer.style.height = `${currentHeight}px`;
    screenshotDiv.appendChild(svgContainer);

    screenshotChart = echarts.init(svgContainer, undefined, {
        renderer: 'svg',
        width: currentWidth - 40,
        height: currentHeight
    });

    const currentOption = chartInstance.getOption();
    screenshotChart.setOption(currentOption);

    if (screenshotChart) {
        const dataURL = screenshotChart.getDataURL({
            type: 'svg',
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
        
        return dataURL;
    }
}

watch(
    () => screenshotStore.timestamp,
    async () => {
        if (screenshotStore.screenshotType === 'canvas') {
            // 处理canvas类型截图
        } else if (screenshotStore.screenshotType === 'svg') {
            createSvgChart()
        }
    }
)
let lines: DataItem[] = [];

onMounted(async () => {
    showSpin.value = true
    initChart();
    bufferSize = calculateBufferSize(start.value, end.value);
                bufferedStart = Math.max(1, start.value - bufferSize);
                bufferedEnd = end.value + bufferSize;

                await file.getLines(chrom.value, bufferedStart,bufferedEnd, function(line: string) {
                    const arr = line.split(/[\s]+/);
                    const addedData: DataItem = {
                        chrom: arr[0],
                        start: Number(arr[1]),
                        end: Number(arr[2]),
                        pvalue: arr[3],
                        experiment: arr[5],
                        tissue: arr[7]
                    };
                    lines.push(addedData);
                });

    updateChart(lines);
    showSpin.value = false
    
    watch([seriesConfig, props.option.yAxis], 
         (newVal, oldVal) => {
        updateChart(lines);
        },
        {deep: true }
    );

    watch([chrom, start, end], 
        async (newValues, oldValues) => {
            const [newChrom, newStart, newEnd] = newValues;
            const [oldChrom, oldStart, oldEnd] = oldValues;
            showSpin.value = true;
            if (end.value - start.value < visibilityWidth) {
                //isVisible.value = true;
                
                if (newChrom === oldChrom && 
        newStart > bufferedStart && 
        newEnd < bufferedEnd && ((newEnd - newStart) == (oldEnd - oldStart))) {
        
        // 使用 nextTick 确保 DOM 更新后再触发事件
        // await nextTick();
        
        if (chart) {
            chartInstance.dispatchAction({
                type: 'dataZoom',
                zoomLock: true,
                startValue: newStart,
                endValue: newEnd
            });
        }
    } else {
        lines = []
                bufferSize = calculateBufferSize(start.value, end.value);
                bufferedStart = Math.max(1, start.value - bufferSize);
                bufferedEnd = end.value + bufferSize;

                await file.getLines(chrom.value, bufferedStart, bufferedEnd, function(line: string) {
                    const arr = line.split(/[\s]+/);
                    const addedData: DataItem = {
                        chrom: arr[0],
                        start: Number(arr[1]),
                        end: Number(arr[2]),
                        pvalue: arr[3],
                        experiment: arr[5],
                        tissue: arr[7]
                    };
                    lines.push(addedData);
                });

                updateChart(lines);}
            } else {
                isVisible.value = false;
            }
            showSpin.value = false;
        },
        { deep: true }
    );

    const resizeObserver = new ResizeObserver(() => {
        if (chartInstance) {
            chartInstance.resize();
        }
    });

    if (chartContainer.value) {
        resizeObserver.observe(chartContainer.value);
    }
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
    }
});
</script>

<style scoped>
.w-full {
    width: 100%;
}
.h-full {
    height: 100%;
}
</style>