<template>
    <div class="relative h-full w-full" :style="props.style">
        <spin :loading="showSpin" message="" class="h-full w-full" />
        <div ref="canvasContainer" class="basic-canvas">
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { useElementSize, useResizeObserver } from '@vueuse/core'
import { BigWig } from '@gmod/bbi';
import { RemoteFile } from 'generic-filehandle';
import * as echarts from 'echarts'
import { downSample } from './downSample.js';
import { useScreenshotStore } from '@/browser/store'
import Spin from './Spin.vue'
import { debounce } from 'lodash-es';

// Performance Timer Class
class PerformanceTimer {
    private timers: Map<string, number> = new Map();
    private results: Map<string, number> = new Map();

    start(label: string) {
        this.timers.set(label, performance.now());
    }

    end(label: string) {
        const startTime = this.timers.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.results.set(label, duration);
            this.timers.delete(label);
        }
    }

    getResult(label: string): number {
        return this.results.get(label) || 0;
    }

    getAllResults() {
        return Object.fromEntries(this.results.entries());
    }

    clear() {
        this.timers.clear();
        this.results.clear();
    }
}

// Data Cache Management Class
class DataCache {
    private cache: Map<string, Feature[]> = new Map();
    private readonly maxCacheSize: number = 10;

    private generateKey(chrom: string, start: number, end: number): string {
        return `${chrom}:${start}-${end}`;
    }

    private hasOverlap(region1: [number, number], region2: [number, number]): boolean {
        return !(region1[1] < region2[0] || region1[0] > region2[1]);
    }

    findOverlappingData(chrom: string, start: number, end: number): Feature[] | null {
        for (const [key, features] of this.cache.entries()) {
            const [cachedChrom, range] = key.split(':');
            const [cachedStart, cachedEnd] = range.split('-').map(Number);
            
            if (cachedChrom === chrom && 
                this.hasOverlap([start, end], [cachedStart, cachedEnd])) {
                return features;
            }
        }
        return null;
    }

    add(chrom: string, start: number, end: number, features: Feature[]): void {
        const key = this.generateKey(chrom, start, end);
        
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, features);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Type definitions
interface Location {
    chrom: string;
    start: number;
    end: number;
}

interface Feature {
    start: number;
    end: number;
    score: number;
}

// Initialize instances
const performanceTimer = new PerformanceTimer();
const screenshotStore = useScreenshotStore()
const dataCache = new DataCache();

// Props definitions
const props = defineProps({
    location: {
        type: Object as () => Location,
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
        default: 0
    }
})
const emit = defineEmits(['zoomTo'])
// Reactive state
const canvasContainer = ref<HTMLDivElement | null>(null)
const showSpin = ref(false)
const isVisible = ref(true)
const features = ref<Feature[]>([])

// Computed properties
const { width, height } = useElementSize(canvasContainer)
const chrom = computed(() => props.location.chrom)
const start = computed(() => props.location.start)
const end = computed(() => props.location.end)
const yAxisConfig = computed(() => props.option.yAxis)
const seriesConfig = computed(() => props.option.series?.[0]?.itemStyle)

// Chart instance
let chartInstance: echarts.ECharts | null = null;

// BigWig file handler initialization
const filehandle = new RemoteFile(props.option.url);
const file = new BigWig({ filehandle });

// 计算缓冲区大小
function calculateBufferSize(start: number, end: number): number {
    const viewportSize = end - start;
    return Math.round(viewportSize * 1); // 设置缓冲区为可视区域的50%
}


// 计算带缓冲区的范围
let bufferSize 
let bufferedStart
let bufferedEnd

// Helper Functions
function getMissingRanges(cachedData: Feature[], start: number, end: number) {
    const missingRanges = [];
    let currentPos = start;

    // 假设 cachedData 已经排序
    for (const feature of cachedData) {
        if (feature.start > currentPos) {
            missingRanges.push({
                start: currentPos,
                end: feature.start
            });
        }
        currentPos = Math.max(currentPos, feature.end);
    }

    if (currentPos < end) {
        missingRanges.push({
            start: currentPos,
            end: end
        });
    }

    return missingRanges;
}

// 优化版本
function mergeFeaturesData(oldFeatures: Feature[], newFeatures: Feature[]): Feature[] {
    const merged: Feature[] = [];
    let i = 0, j = 0;

    while (i < oldFeatures.length && j < newFeatures.length) {
        if (oldFeatures[i].start < newFeatures[j].start) {
            if (merged.length === 0 || merged[merged.length - 1].start !== oldFeatures[i].start) {
                merged.push(oldFeatures[i]);
            }
            i++;
        } else {
            if (merged.length === 0 || merged[merged.length - 1].start !== newFeatures[j].start) {
                merged.push(newFeatures[j]);
            }
            j++;
        }
    }

    // 处理剩余元素
    while (i < oldFeatures.length) {
        if (merged.length === 0 || merged[merged.length - 1].start !== oldFeatures[i].start) {
            merged.push(oldFeatures[i]);
        }
        i++;
    }

    while (j < newFeatures.length) {
        if (merged.length === 0 || merged[merged.length - 1].start !== newFeatures[j].start) {
            merged.push(newFeatures[j]);
        }
        j++;
    }

    return merged;
}

function filterFeaturesByRange(features: Feature[], start: number, end: number): Feature[] {
    return features.filter(f => f.start >= start && f.end <= end);
}

async function fetchFeatures(chromValue: string, startValue: number, endValue: number, scale: number) {
    // performanceTimer.start('dataFetch');
    try {
        // 如果缓存中没有数据，获取带缓冲区的完整范围数据
        console.log(scale)
        const features = await file.getFeatures(chromValue, bufferedStart, bufferedEnd, { scale });
        // 将数据添加到缓存
        // dataCache.add(chromValue, bufferedStart, bufferedEnd, features);
        // performanceTimer.end('dataFetch');
        return { success: true, features };
    } catch (error) {
        // performanceTimer.end('dataFetch');
        return { success: false, error };
    }
}

// Get or create chart instance
function getChartInstance(dom: HTMLElement) {
    if (!chartInstance) {
        chartInstance = echarts.init(dom, undefined, {
            renderer: props.option.renderer || 'canvas',
            useDirtyRect: true,
            width: width.value,
            height: height.value
        });
    }

    return chartInstance
}


// Generate chart options
function generateChartOption(data: any[], startVal: number, endVal: number, bufferedStart, bufferedEnd, maxYAxis: number, minYAxis: number) {
    const yAxisShow = props.option.yAxis?.show ?? true;
    const yAxisScale = props.option.yAxis?.scale ?? 'auto';
    const yAxisMax = props.option.yAxis?.max;
    const yAxisMin = props.option.yAxis?.min;
    const flipAxis = props.option.yAxis?.flip ?? false;
    const posColor = props.option.series?.[0]?.itemStyle?.posColor ?? '#1890ff';
    const negColor = props.option.series?.[0]?.itemStyle?.negColor ?? '#f5222d';
    const opacity = props.option.series?.[0]?.itemStyle?.opacity ?? 1;

    const yAxisBounds = {
        min: yAxisScale === 'fixed' ? yAxisMin : minYAxis,
        max: yAxisScale === 'fixed' ? yAxisMax : maxYAxis
    };

    return {
        animation: false,
        tooltip: {
            trigger: 'axis',
            triggerOn: 'click',
            formatter: function (params: any) {
                const data = params[0].data;
                return `Position: ${data.start}-${data.end}<br/>Score: ${data.score.toFixed(3)}`;
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
            right: '0%',
            bottom: '1px',
            top: '0px',
            containLabel: false
        },
        xAxis: {
            type: 'value',
            min: bufferedStart,
            max: bufferedEnd,
            show: false,
            // animation: true,
        },
        yAxis: {
            show: yAxisShow,
            type: 'value',
            offset: 0,            
            inverse: flipAxis,
            axisLabel: {
                formatter: function(value) { // 科学计数法显示标签
                    var res = value.toString()
                    var numN1 = 0
                    var numN2 = 1
                    var num1 = 0
                    var num2 = 0
                    var t1 = 1
                    for (var k = 0; k < res.length; k++) {
                        if (res[k] === '.') { t1 = 0 }
                        if (t1) { num1++ } else { num2++ }
                    }

                    if (Math.abs(value) < 1 && res.length > 4) {
                        for (var i = 2; i < res.length; i++) {
                            if (res[i] === '0') {
                                numN2++
                            } else if (res[i] === '.') {
                                continue
                            } else {
                                break
                            }
                        }
                        var v = parseFloat(value)
                        v = v * Math.pow(10, numN2)
                        return v.toString() + 'e-' + numN2
                    } else if (num1 > 4) {
                        if (res[0] === '-') {
                            numN1 = num1 - 2
                        } else {
                            numN1 = num1 - 1
                        }
                        v = parseFloat(value)
                        v = v / Math.pow(10, numN1)
                        if (num2 > 4) { v = v.toFixed(4) }
                        return v.toString() + 'e' + numN1
                    } else {
                        return value.toFixed(1);
                    }
                },
                margin: 6,
                color: 'black',
                verticalAlignMinLabel: flipAxis ? 'up' : 'bottom',
                verticalAlignMaxLabel: flipAxis ? 'bottom' : 'up'
            },
            interval: yAxisBounds.max - yAxisBounds.min,
            min: yAxisBounds.min,
            max: yAxisBounds.max,
            axisTick: { show: true, length: 4 },
            splitLine: { show: false }
        },
        dataZoom: [{
            filterMode: 'filter',
            type: 'inside',
            startValue: startVal,
            endValue: endVal,
            zoomOnMouseWheel: false,  // 禁用鼠标滚轮缩放
            moveOnMouseMove: true,   // 禁用鼠标移动平移
            preventDefaultMouseMove: true,
            moveOnMouseWheel: false,
            zoomLock: true,
            throttle: 0
        }],
        series: [{
            type: 'custom',
            animation: false,
            clip: true,
            progressive: 5000,
            progressiveThreshold: 5000,
            renderItem: function (params: any, api: any) {
                const value = api.value(2);
                const start = api.value(0);
                const end = api.value(1);
                const baseCoord = api.coord([start, 0]);
                const point = api.coord([start, value]);
                const nextPoint = api.coord([end, value]);
                
                const height = Math.abs(point[1] - baseCoord[1]);
                const rectY = flipAxis ? 
                    (value >= 0 ? baseCoord[1] : point[1]) : 
                    (value >= 0 ? point[1] : baseCoord[1]);

                return {
                    type: 'rect',
                    shape: {
                        x: Math.floor(point[0]), 
                        y: rectY,
                        width: Math.ceil(nextPoint[0] - point[0] + 2),
                        height: height
                    },
                    style: {
                        ...api.style(),
                        stroke: 'none',
                        opacity: opacity
                    }
                };
            },
            encode: {
                x: [0, 1],
                y: 2
            },
            data: data.map(f => ({
                value: [f.start, f.end, f.y],
                start: f.start,
                end: f.end,
                score: f.y
            })),
            itemStyle: {
                color: (params: any) => params.data.value[2] >= 0 ? posColor : negColor
            }
        }]
    };
}


// Update chart with performance monitoring
function updateChart(featuresData: Feature[]) {
    if (!canvasContainer.value || !chartInstance) return;

    // performanceTimer.start('dataProcessing');
    let data = featuresData.map(feature => ({
        x: (feature.start + feature.end) / 2,
        y: feature.score,
        start: feature.start,
        end: feature.end
    }));

    data = downSample(data, {
        width: width.value,
        dpr: window.devicePixelRatio,
        method: 'average'
    });

    if (props.option.yAxis?.log) {
        data = data.map(item => ({
            ...item,
            y: item.y === 0 ? 0 : 
               item.y > 0 ? Math.log10(item.y) : 
               -Math.log10(Math.abs(item.y))
        }));
    }

    const scores = data.map(f => f.y);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    const maxYAxis = maxScore >= 0 ? maxScore : 0;
    const minYAxis = minScore < 0 ? minScore : 0;
    // performanceTimer.end('dataProcessing');

    // performanceTimer.start('chartRendering');
    const chartOption = generateChartOption(
        data,
        start.value,
        end.value,
        bufferedStart,
        bufferedEnd,
        props.option.yAxis?.scale === 'fixed' ? (props.option.yAxis.max || maxYAxis) : maxYAxis,
        props.option.yAxis?.scale === 'fixed' ? (props.option.yAxis.min || minYAxis) : minYAxis
    );
    
    chartInstance.setOption(chartOption);
    chartInstance.on('dataZoom', debounce((evt) => {
        var option = chartInstance.getOption();
        // console.log(option.dataZoom);
        // console.log('props.trackViewIndex', props.trackViewIndex)
        emit('zoomTo', chrom.value, option.dataZoom[0].startValue, option.dataZoom[0].endValue, props.trackViewIndex)
    }, 100))
    // performanceTimer.end('chartRendering');
}

// Fetch and update data with performance monitoring
async function fetchAndUpdateData() {
    try {
        // performanceTimer.clear();
        // performanceTimer.start('total');
        showSpin.value = true;

        bufferSize = calculateBufferSize(start.value, end.value);
        bufferedStart = Math.max(1, start.value - bufferSize);
        bufferedEnd = end.value + bufferSize;

        const pixelPerBp = width.value / (end.value - start.value);
        const scale = Math.min(1, pixelPerBp);

        let result = await fetchFeatures(chrom.value, start.value, end.value, scale);

        if (result.features.length === 0) {
            const altChrom = chrom.value.replace(/chr/g, '');
            result = await fetchFeatures(altChrom, start.value, end.value, scale);
        }

        features.value = result.features;
        updateChart(features.value);

        // performanceTimer.end('total');
    } catch (error) {
        console.error('Error in fetchAndUpdateData:', error);
    } finally {
        showSpin.value = false;
    }
}

// Initialize chart
function initializeChart() {
    if (!canvasContainer.value) return;
    chartInstance = getChartInstance(canvasContainer.value);
}

// 首先定义一个 throttle 函数
function throttle(fn: Function, delay: number) {
    let lastTime = 0;
    let timer: NodeJS.Timeout | null = null;
    
    return function (...args: any[]) {
        const now = Date.now();
        
        if (now - lastTime < delay) {
            // 如果距离上次执行还没到指定时间，则取消之前的定时器并重新设置
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                lastTime = now;
                fn.apply(this, args);
            }, delay);
            return;
        }
        
        lastTime = now;
        fn.apply(this, args);
    };
}

// Add this function before the watch statement for screenshotStore
function createSvgChart() {
    if (!canvasContainer.value || !chartInstance) return;

    const currentWidth = width.value;
    const currentHeight = height.value;

    const screenshotDiv = document.getElementById('screenshot-container');
    if (!screenshotDiv) return;
  
    const svgContainer = document.createElement('div');
    svgContainer.style.width = `${currentWidth - 40}px`;
    svgContainer.style.height = `${currentHeight}px`;
    screenshotDiv.appendChild(svgContainer);

    const screenshotChart = echarts.init(svgContainer, undefined, {
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
    
        // Clean up
       // screenshotChart.dispose();
        //screenshotDiv.removeChild(svgContainer);
    
        return dataURL;
    }
}

// Lifecycle hooks
onMounted(async () => {
    showSpin.value = true;
    initializeChart();
    await fetchAndUpdateData();
    showSpin.value = false;

    // Set up resize observer for better container size detection
    useResizeObserver(canvasContainer, (entries) => {
        if (chartInstance && entries[0]) {
            const { width: newWidth, height: newHeight } = entries[0].contentRect;
            chartInstance.resize({
                width: newWidth,
                height: newHeight
            });
        }
    });

    // Watch location changes
    watch([chrom, start, end], async (newValues, oldValues) => {
        const [newChrom, newStart, newEnd] = newValues;
        const [oldChrom, oldStart, oldEnd] = oldValues;
        // console.log(props.trackViewIndex)
        // performanceTimer.clear();
        // performanceTimer.start('locationChange');
        showSpin.value = true;

        // 检查是否在缓冲区范围内
        if (newChrom === oldChrom && 
            newStart > bufferedStart && 
            newEnd < bufferedEnd && ((newEnd - newStart) == (oldEnd - oldStart))) {
            
            // 使用 nextTick 确保 DOM 更新后再触发事件
            // await nextTick();
            
            if (chartInstance) {
                chartInstance.dispatchAction({
                    type: 'dataZoom',
                    zoomLock: true,
                    startValue: newStart,
                    endValue: newEnd
                });
            }
        } else {
            // 更新缓冲区范围
            bufferSize = calculateBufferSize(newStart, newEnd);
            bufferedStart = Math.max(1, newStart - bufferSize);
            bufferedEnd = newEnd + bufferSize;
            
            await fetchAndUpdateData();
        }

        // performanceTimer.end('locationChange');
        // console.log('Location change total time (ms):', 
        //     performanceTimer.getResult('locationChange'));
        showSpin.value = false;
    }, { deep: true });


    // Watch size and configuration changes
    watch(
        [height, yAxisConfig, seriesConfig],
        throttle(() => {
            if (features.value.length > 0) {
                // performanceTimer.clear();
                // performanceTimer.start('configChange');
                showSpin.value = true;
                updateChart(features.value);
                // performanceTimer.end('configChange');
                // console.log('Config change total time (ms):', performanceTimer.getResult('configChange'));
                showSpin.value = false;
            }
        }, 1000), // 200ms 的节流时间
        { deep: true }
    );

    // Watch screenshot store changes
    watch(
        () => screenshotStore.timestamp,
        async () => {
            if (screenshotStore.screenshotType === 'svg') {
                return createSvgChart();
            }
        }
    )

    window.addEventListener('resize', () => chartInstance?.resize());

    watch([width, height], () => {
        if (chartInstance) {
            chartInstance.resize({
                width: width.value, 
                height: height.value
            });
        }
    })
});

// Cleanup
onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener('resize', () => chartInstance?.resize());
    dataCache.clear();
});
</script>

<style scoped>
.basic-canvas {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>