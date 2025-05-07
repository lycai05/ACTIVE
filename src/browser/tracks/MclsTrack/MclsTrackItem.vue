<template>
    <!-- <div v-if="isVisible" class="relative"> -->
    <!-- <div class="relative h-full w-full border"  :style="props.style"> -->
    <!-- 外层容器，可滚动 -->
    <!-- <div class="w-full overflow-auto" :style="containerStyle"> -->
    <!-- 图表容器，高度根据内容动态计算 -->
    <!-- <div class="test absolute left-[35px] bg-blue-100/50 border z-20 h-full right-0"></div> -->
    <div class=" h-full border border-gray-200 ml-[30px]" :style="style">
        <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
        <div ref="chartContainer" :style="[{ height: `${canvasHeight}px` }]" class="w-full relative">

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
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
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

interface MclsData {
    chrom: string;
    start: number;
    end: number;
    id: string;
    row?: number;
    rawChrom?: string;
    rawStart?: number;
    rawEnd?: number;
}

interface Props {
    location: Location;
    option: {
        url: string;
        series?: any[];
        renderer?: string;
    };
    style: Record<string, any>;
    processedData: MclsData[];
    trackViewIndex: number;
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
const ROW_GAP = 1; // 行间距(px)
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

// const assignRows = (items: DataItem[]): DataItem[] => {
//     const rows: DataItem[][] = [];
//     items.forEach(item => {
//         let row = 0;
//         while (true) {
//             const overlapping = rows[row]?.some(existing => 
//                 !(item.start >= existing.end || item.end <= existing.start)
//             );

//             if (!overlapping) {
//                 if (!rows[row]) rows[row] = [];
//                 rows[row].push(item);
//                 item.row = row;
//                 break;
//             }
//             row++;
//         }
//     });

//     // 计算canvas总高度
//     const totalRows = rows.length;
//     canvasHeight.value = totalRows * (RECT_HEIGHT + ROW_GAP);

//     return items;
// };
const minItemsPerPvalue = ref(5);

// 新增：计算连接线数据的函数
const calculateConnectionLines = (data: MclsData[]): [number, number, number][] => {
    const groupedByPvalue: { [key: string]: MclsData[] } = {};
    
    // 按pvalue分组
    data.forEach(item => {
        if (!groupedByPvalue[item.id]) {
            groupedByPvalue[item.id] = [];
        }
        groupedByPvalue[item.id].push(item);
    });

    // 为每个pvalue组生成连接线数据
    const connectionLines: [number, number, number][] = [];
    
    Object.values(groupedByPvalue).forEach(group => {
        if (group.length > 1) {
            // 找出组内最小和最大位置
            const minStart = Math.min(...group.map(item => item.start));
            const maxEnd = Math.max(...group.map(item => item.end));
            const row = group[0].row!;
            
            // 添加连接线数据 [起始位置, 结束位置, 行号]
            connectionLines.push([minStart, maxEnd, row]);
        }
    });

    return connectionLines;
};

const calculatePvalueGroups = (items: MclsData[]): { [key: string]: number } => {
    const groups: { [key: string]: number } = {};
    items.forEach(item => {
        if (!groups[item.id]) {
            groups[item.id] = 0;
        }
        groups[item.id]++;
    });
    return groups;
};

const assignRows = (items: MclsData[]): MclsData[] => {
    // 计算每个 pvalue 组的项目数量
    const pvalueGroups = calculatePvalueGroups(items);

    // 过滤掉不满足条件的项目
    const filteredItems = items.filter(item =>
        pvalueGroups[item.id] >= minItemsPerPvalue.value
    );

    // 按照 pvalue 分组
    const groupedByPvalue: { [key: string]: MclsData[] } = {};
    filteredItems.forEach(item => {
        if (!groupedByPvalue[item.id]) {
            groupedByPvalue[item.id] = [];
        }
        groupedByPvalue[item.id].push(item);
    });

    const totalRowNumber = pvalueGroups.length

    // 为每个 pvalue 分配行号
    let currentRow = 0;
    const pvalueToRow: { [key: string]: number } = {};
    Object.keys(groupedByPvalue).forEach(pvalue => {
        pvalueToRow[pvalue] = currentRow;
        currentRow++;
    });

    // 给每个数据项分配行号
    const processedItems = filteredItems.map(item => ({
        ...item,
        row: pvalueToRow[item.id]
    }));

    // 计算canvas总高度
    canvasHeight.value = currentRow * (RECT_HEIGHT + ROW_GAP);

    return processedItems;
};

const initChart = (): void => {
    if (chartContainer.value) {
        chartInstance = echarts.init(chartContainer.value, null, { renderer: props.option.renderer || 'canvas' });
    }
};

const updateChart = (): void => {
    if (!chartInstance || props.processedData.length === 0) return;

    showSpin.value = true;
    
    // Process data and assign rows
    const processedData = assignRows(props.processedData);
    const maxRow = Math.max(...processedData.map(item => item.row || 0), 0);
    const connectionLines = calculateConnectionLines(processedData);

    // Create chart option
    const chartOption: EChartsOption = {
        animation: false,
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            formatter: (params: any) => {
                const dataIndex = params.dataIndex;
                const item = processedData[dataIndex];
                if (item) {
                    return `ID: ${item.id}<br>
                           Position: ${item.rawChrom}:${item.rawStart}-${item.rawEnd}`;
                }
                return '';
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
            left: '0',
            right: '0',
            bottom: '0',
            top: '0',
            containLabel: false,
        },
        xAxis: {
            type: 'value',
            min: start.value,
            max: end.value,
            show: false,
        },
        yAxis: {
            show: false,
            type: 'value',
            min: 0,
            max: maxRow + 1,
            interval: 1,
        },
        dataZoom: [{
            filterMode: 'filter',
            type: 'inside',
            startValue: start.value,
            endValue: end.value,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            preventDefaultMouseMove: true,
            moveOnMouseWheel: false,
            zoomLock: true,
            throttle: 100
        }],
        series: [{
            type: 'custom',
            animation: false,
            clip: true,
            renderItem: (params: any, api: any) => {
                const start = api.value(0);
                const row = api.value(1);
                const end = api.value(2);
                const id = api.value(3);

                const [x1, y1] = api.coord([start, row]);
                const [x2] = api.coord([end, row]);

                return {
                    type: 'rect',
                    shape: {
                        x: x1,
                        y: y1,
                        width: Math.max(x2 - x1, 1),
                        height: RECT_HEIGHT
                    },
                    style: {
                        fill: getTissueColor(id),
                        stroke: '#fff',
                        lineWidth: 0.5
                    }
                };
            },
            dimensions: ['start', 'row', 'end', 'id'],
            encode: {
                x: [0, 2],
                y: 1,
                tooltip: [3]
            },
            data: processedData.map(item => [
                item.start,
                item.row,
                item.end,
                item.id
            ])
        },
        {
            type: 'custom',
            animation: false,
            clip: true,
            z: 1, // 确保线在矩形下方
            renderItem: (params: any, api: any) => {
                const start = api.value(0);
                const end = api.value(1);
                const row = api.value(2);
                
                const [x1, y1] = api.coord([start, row]);
                const [x2] = api.coord([end, row]);
                
                return {
                    type: 'line',
                    shape: {
                        x1: x1,
                        y1: y1 + RECT_HEIGHT/2,
                        x2: x2,
                        y2: y1+ RECT_HEIGHT/2
                    },
                    style: {
                        stroke: props.option.series[0]?.lineStyle?.color || '#fff',
                        lineWidth: props.option.series[0]?.lineStyle?.width || 0.2,
                        lineDash: [4, 4],
                        lineDashOffset: 0
                    }
                };
            },
            data: connectionLines
        }
    ]
};

    chartInstance.setOption(chartOption);
    chartInstance.on('dataZoom', (evt) => {
        if (chartInstance) {
            const option = chartInstance.getOption();
            const dataZoom = option.dataZoom && Array.isArray(option.dataZoom) ? option.dataZoom[0] : null;
            if (dataZoom && typeof dataZoom.startValue === 'number' && typeof dataZoom.endValue === 'number') {
                emit('zoomTo', chrom.value, dataZoom.startValue, dataZoom.endValue, props.trackViewIndex);
            }
        }
    });
    
    showSpin.value = false;
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
    svgContainer.style.width = `${currentWidth}px`;
    svgContainer.style.height = `${currentHeight}px`;
    screenshotDiv.appendChild(svgContainer);

    screenshotChart = echarts.init(svgContainer, undefined, {
        renderer: 'svg',
        width: currentWidth,
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
        if (screenshotStore.screenshotType === 'svg') {
            createSvgChart()
        }
    }
)
let lines: MclsData[] = [];

onMounted(() => {
    showSpin.value = true
    initChart();
    bufferSize = calculateBufferSize(start.value, end.value);
    bufferedStart = Math.max(1, start.value - bufferSize);
    bufferedEnd = end.value + bufferSize;

    nextTick(() => {
        updateChart();
        showSpin.value = false
    });

    watch(() => props.processedData, () => {
        nextTick(() => {
            updateChart();
        });
    }, { deep: true });

    const resizeObserver = new ResizeObserver(() => {
        if (chartInstance) {
            chartInstance.resize();
        }
    });

    if (chartContainer.value) {
        resizeObserver.observe(chartContainer.value);
    }

    watch(minItemsPerPvalue, () => {
        if (lines.length > 0) {
            updateChart();
        }
    });
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