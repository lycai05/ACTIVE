<template>
  <div ref="canvasContainer" :style="props.style">
    <v-chart 
      ref="chartRef"
      :init-options="initOptions"
      :option="chartOption"
      :autoresize="{throttle: 100}"
      style="width: 100%; height: 100%"
      @datazoom="handleDataZoom"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import * as echarts from 'echarts/core';
import { CustomChart } from 'echarts/charts';
import VChart from 'vue-echarts';
import {
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import { useElementSize } from '@vueuse/core';
import { useScreenshotStore } from '@/browser/store';
import { useCanvasInitOptions } from '@/browser/hooks/useCanvasInitOptions.hook';
import { mergeTheme } from '@/browser/utils/settings';
import { includes } from './config';
import { debounce } from 'lodash-es';

// Register necessary components
echarts.use([
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  CustomChart,
  CanvasRenderer,
  SVGRenderer
]);

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
  dataset: {
    type: Array,
    required: true
  },
  dispatchDataZoom: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: true
  }
});

// Refs & Variables
const canvasContainer = ref(null);
const chartRef = ref(null);
const emit = defineEmits(['zoomTo']);

// Computed
const start = computed(() => props.location.start);
const end = computed(() => props.location.end);

const initOptions = useCanvasInitOptions(props.option, 'canvas');

// Chart configuration
const computeOption = (dataset: any[], location: any) => {
  if (!dataset.length) return {};

  const scores = dataset.map((f: any) => 
    props.option.yAxis?.log ? Math.log10(f.score) : f.score
  );
  const maxScore = Math.max(...scores);
  
  const maxYAxis = props.option.yAxis?.scale === 'fixed' ? 
    (props.option.yAxis?.max || maxScore) : maxScore;
  const minYAxis = props.option.yAxis?.scale === 'fixed' ? 
    (props.option.yAxis?.min || 0) : 0;
  const flipAxis = props.option.yAxis?.flip ?? false;

  return {
    tooltip: {
      formatter: (params: any) => {
        const item = dataset[params.dataIndex];
        return `${item.rawChrom1}:${item.rawStart1}-${item.rawEnd1}<br/>
                ${item.rawChrom2}:${item.rawStart2}-${item.rawEnd2}<br/>
                Score: ${item.score}<br/>`;
      },
    },
    grid: {
            show: false,
            left: '30px',
            right: '0%',
            bottom: '1.5px',
            top: '0px',
            containLabel: false
        },
    dataZoom: [{
      filterMode: 'filter',
      type: 'inside',
      startValue: location.start,
      endValue: location.end,
      zoomOnMouseWheel: false,
      moveOnMouseMove: true,
      preventDefaultMouseMove: false, 
      moveOnMouseWheel: false,
      rangeMode: ['value', 'value'],
      zoomLock: true,
      throttle: 0,
    }],
    xAxis: {
      min: location.start,
      max: location.end,
    },
    yAxis: {
      axisLabel: {
        verticalAlignMinLabel: flipAxis ? 'up' : 'bottom',
        verticalAlignMaxLabel: flipAxis ? 'bottom' : 'up',
        formatter: (value: any) => {
          if (value == maxYAxis || value === minYAxis) {
            return value.toFixed(0);
          }
          return '';
        },
      },
      inverse: flipAxis,
      interval: maxYAxis - minYAxis,
      min: minYAxis,
      max: maxYAxis,
      margin: 6,
      offset: 0,
      axisTick: { 
        show: true, 
        length: 4,
        alignWithLabel: true,
        interval: (index: number, value: number) => {
          // Show ticks only at min and max positions
          return value === minYAxis + 10 || value === maxYAxis;
        }
      },
      splitLine: { show: false },
      zlevel: 100
    },
    series: [{
      type: 'custom',
      name: 'CurvTrackItem',
      animation: false,
      renderItem: (params: any, api: any) => {
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
          const yPosition = isFlipped ? yBase : maxYAxis;
          
          linePath = [
            ['M', xStart, yPosition],
            ['C', cp1x, yPosition + heightOffset, cp2x, yPosition + heightOffset, xEnd, yPosition],
          ].join(' ');
          
          areaPath = [
            ['M', xStart, yPosition],
            ['C', cp1x, yPosition + heightOffset, cp2x, yPosition + heightOffset, xEnd, yPosition],
            ['L', xEnd, yPosition],
            ['L', xStart, yPosition],
            ['Z']
          ].join(' ');
       } else {
          const heightOffset = Math.abs(yBottom - yHeight);
          const adjustedOffset = yHeight - (heightOffset * 0.3);
          
          linePath = [
            ['M', xStart, yBottom],
            ['C', cp1x, adjustedOffset, cp2x, adjustedOffset, xEnd, yBottom],
          ].join(' ');
          
          areaPath = [
            ['M', xStart, yBottom],
            ['C', cp1x, adjustedOffset, cp2x, adjustedOffset, xEnd, yBottom],
            ['L', xEnd, yBottom],
            ['L', xStart, yBottom],
            ['Z']
          ].join(' ');
        }

        return {
          type: 'group',
          children: [
            {
              // Area
              type: 'path',
              shape: { pathData: areaPath },
              style: {
                fill: props.option.series[0].areaStyle?.color || 'rgba(255,0,0,0.0)',
                opacity: props.option.series[0].areaStyle?.opacity || 0
              }
            },
            {
              // Line
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
      data: dataset
        .filter((line: any) => {
          if (line.chrom !== line.chrom2) return false;
          
          const viewStart = start.value;
          const viewEnd = end.value;
          
          const point1InRange = line.start >= viewStart && line.end <= viewEnd;
          const point2InRange = line.start2 >= viewStart && line.end2 <= viewEnd;
          
          if (props.option.data?.show === 'one') {
            return point1InRange || point2InRange;
          } else if (props.option.data?.show === 'both') {
            return point1InRange && point2InRange;
          }
        })
        .map((line: any) => {
          const x1 = (line.start + line.end) / 2;
          const x2 = (line.start2 + line.end2) / 2;
          const height = props.option.yAxis?.log ? Math.log10(line.score) : line.score;
          return {value: [x1, x2, height]};
        })
    }]
  };
};

const chartOption = computed(() => {
  return mergeTheme(computeOption(props.dataset, props.location), props.option, includes);
});

// Methods
const handleDataZoom = debounce((evt) => {
  if (chartRef.value) {
    const option = chartRef.value.getOption();
    emit('zoomTo', props.location.chrom, option.dataZoom[0].startValue, option.dataZoom[0].endValue, 0);
  }
}, 100);

// Screenshot handling
const screenshotStore = useScreenshotStore();
const { width, height } = useElementSize(chartRef);

function createSvgChart() {
  if (!canvasContainer.value || !chartRef.value) return;

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

  const currentOption = chartRef.value.getOption();
  screenshotChart.setOption(currentOption);

  if (screenshotChart) {
    const dataURL = screenshotChart.getDataURL({
      type: 'svg',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
    
    // Clean up
    //screenshotChart.dispose();
    //screenshotDiv.removeChild(svgContainer);
    
    return dataURL;
  }
}

watch(
    () => screenshotStore.timestamp,
    async () => {
        if (screenshotStore.screenshotType === 'canvas') {
            // 处理canvas类型截图
            createSvgChart()
        } else if (screenshotStore.screenshotType === 'svg') {
            createSvgChart()
        }
    }
)

watch(
  () => props.option,
  () => {
    if (chartRef.value) {
      chartRef.value.setOption(chartOption.value);
    }
  },
  { deep: true }
);
</script>