<template>
    <div v-if="isVisible" class="relative">
        <!-- 外层容器，可滚动 -->
        <div class="w-full overflow-auto" :style="containerStyle">
            <!-- 图表容器，高度根据内容动态计算 -->
            <div ref="chartContainer" :style="[props.style, {height: `${canvasHeight}px`}]" class="w-full">
                <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin>
            </div>
        </div>
    </div>
    <div v-else>
        <n-alert title="" type="warning">
            Too many items. Zoom in (< 500Kb) to see features
        </n-alert>
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
}

const props = defineProps<Props>();

const chartContainer = ref<HTMLElement | null>(null);
const chart = ref<echarts.ECharts | null>(null);
const showSpin = ref(false);
const isVisible = ref(true);
const visibilityWidth = 10000000;

// 添加新的常量定义
const RECT_HEIGHT = 5; // 每个矩形的固定高度(px)
const ROW_GAP = 2; // 行间距(px)
const canvasHeight = ref(0); // canvas的总高度

const chrom = computed(() => props.location.chrom);
const start = computed(() => props.location.start);
const end = computed(() => props.location.end);
const option = computed(() => props.option);

// 容器样式计算
const containerStyle = computed(() => ({
    height: props.style.height || '100%',
}));

const url = props.option.url;
const { width, height } = useElementSize(chartContainer);

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
    canvasHeight.value = totalRows * (RECT_HEIGHT + ROW_GAP);
    
    return items;
};

const initChart = (): void => {
    if (chartContainer.value) {
        chart.value = echarts.init(chartContainer.value, null, {renderer: props.option.renderer || 'canvas'});
    }
};

const updateChart = (data: DataItem[]): void => {
    if (!chart.value) return;

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
            left: '60px',
            right: '0%',
            bottom: '1px',
            top: '0px',
            containLabel: false,
            height: canvasHeight.value
        },
        xAxis: {
            type: 'value',
            min: start.value,
            max: end.value,
            show: false,
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: maxRow,
            interval: 1,
            offset: 10,
            axisTick: {
                show: true,
                length: 8
            },
            axisLabel: {
                formatter: function(value) {
                    return ''
                },
                margin: 10
            },
            splitLine: {
                show: true,
                lineStyle: {
                    opacity: 0
                }
            },
        },
        series: [{
            type: 'custom',
            renderItem: (params: any, api: any) => {
                const start = api.value(0);
                const row = api.value(1);
                const end = api.value(2);
                const tissue = api.value(3);
                
                const [x1, y1] = api.coord([start, row]);
                const [x2] = api.coord([end, row]);
                
                return {
                    type: 'rect',
                    shape: {
                        x: x1,
                        y: y1 - RECT_HEIGHT/2, // 居中显示
                        width: Math.max(x2 - x1, 1),
                        height: RECT_HEIGHT
                    },
                    style: {
                        fill: getTissueColor(tissue),
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

    chart.value.setOption(chartOption);
};

const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
});

let screenshotChart: echarts.ECharts | null = null;

function createSvgChart() {
    if (!chartContainer.value || !chart.value) return;

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

    const currentOption = chart.value.getOption();
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

onMounted(() => {
    showSpin.value = true
    initChart();
    showSpin.value = false
    
    watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], 
        async (newVal, oldVal) => {
            showSpin.value = true;
            if (end.value - start.value < visibilityWidth) {
                isVisible.value = true;
                const lines: DataItem[] = [];
                
                await file.getLines(chrom.value, start.value, end.value, function(line: string) {
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
            } else {
                isVisible.value = false;
            }
            showSpin.value = false;
        },
        { immediate: true, deep: true }
    );

    const resizeObserver = new ResizeObserver(() => {
        if (chart.value) {
            chart.value.resize();
        }
    });

    if (chartContainer.value) {
        resizeObserver.observe(chartContainer.value);
    }
});

onBeforeUnmount(() => {
    if (chart.value) {
        chart.value.dispose();
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