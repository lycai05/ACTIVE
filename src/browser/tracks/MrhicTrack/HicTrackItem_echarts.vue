<template>
  <div class="relative h-full w-full">
    <div>
      Resolution: {{ formatResolution(currentBpResolution) }}
      Normalization: {{ selectedNormalization }}
    </div>
    <div v-if="isVisible">
      <div ref="chartContainer" class="w-full aspect-square"></div>
    </div>
    <div v-else>
      <div class="basic-canvas">
        <n-alert title="" type="warning">
          No data in this region.
        </n-alert>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeMount, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { init } from 'echarts-worker'
import HicStraw from 'hic-straw';
import { useElementSize } from '@vueuse/core';
import { createHiCStrawService } from './HiCStrawService';

// ColorScale class - 保持不变
class ColorScale {
  constructor(scale) {
    this.threshold = scale.threshold;
    this.r = scale.r;
    this.g = scale.g;
    this.b = scale.b;
  }

  getColor(value) {
    const alpha = Math.floor(255 * (Math.min(value, this.threshold) / this.threshold));
    return `rgba(${this.r},${this.g},${this.b},${alpha / 255})`;
  }
}

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
});

const chartContainer = ref(null);
const chart = ref(null);
const { width } = useElementSize(chartContainer);
const currentBpResolution = ref(5000);
const isVisible = ref(true);
const hicService = createHiCStrawService(props.option.url);

// Computed properties - 保持不变
const chrom = computed(() => props.location.chrom);
const start = computed(() => props.location.start);
const end = computed(() => props.location.end);
const resolutionMode = computed(() => props.option.series[0].resolution.mode);
const selectedResolution = computed(() => props.option.series[0].resolution.selectedResolution);
const selectedNormalization = computed(() => props.option.series[0].normalization.selectedNormalization);

const availableResolutions = computed({
  get() {
    return props.option.series[0].resolution.availableResolutions || [];
  },
  set(value) {
    if (props.option && props.option.series && props.option.series[0] && props.option.series[0].resolution) {
      props.option.series[0].resolution.availableResolutions = [...value];
    }
  }
});

const normalizationMethods = computed({
  get() {
    return props.option.series[0].normalization.normalizationMethods || [];
  },
  set(value) {
    if (props.option && props.option.series && props.option.series[0] && props.option.series[0].normalization) {
      props.option.series[0].normalization.normalizationMethods = [...value];
    }
  }
});

const renderChart = (dataset) => {
  if (!dataset || dataset.length === 0) {
    isVisible.value = false;
    return;
  }

  const colorScale = new ColorScale({
    threshold: props.option.series[0].itemStyle.maxScore,
    r: parseInt(props.option.series[0].itemStyle.maxCountColor.slice(1, 3), 16),
    g: parseInt(props.option.series[0].itemStyle.maxCountColor.slice(3, 5), 16),
    b: parseInt(props.option.series[0].itemStyle.maxCountColor.slice(5, 7), 16)
  });

  const maxBin1 = Math.max(...dataset, d => d.bin1);
  const minBin1 = Math.min(...dataset, d => d.bin1);
  const maxBin2 = Math.max(...dataset, d => d.bin2);
  const minBin2 = Math.min(...dataset, d => d.bin2);
  const maxBin = Math.max(maxBin1, maxBin2)
  const minBin = Math.max(minBin1, minBin2)

  const option = {
    animation: false,
    grid: {
      left: '3%',
      right: '3%',
      top: '3%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: minBin,
      max: maxBin
    },
    yAxis: {
      type: 'value',
      min: minBin,
      max: maxBin
    },
    series: [{
      type: 'custom',
      animation: false,
      // progressiveThreshold: 1,
      progressive:false,
      renderItem: (params, api) => {
        const value = api.value(2);
        const color = colorScale.getColor(value);
        const binSize = width.value / (end.value - start.value) * currentBpResolution.value;
        
        // 获取原始坐标
        const [x, y] = api.coord([api.value(0), api.value(1)]);
        
        // 计算中心点
        const centerX = params.coordSys.x + params.coordSys.width / 2;
        const centerY = params.coordSys.y + params.coordSys.height / 2;
        
        // 应用坐标转换
        const transform = {
          // 平移到中心
          x: x - centerX,
          y: y - centerY
        };
        
        // 旋转45度
        const cos = Math.cos(Math.PI / 4);
        const sin = Math.sin(Math.PI / 4);
        const rotated = {
          x: transform.x * cos - transform.y * sin,
          y: transform.x * sin + transform.y * cos
        };
        
        // 缩放
        const scale = 1 / Math.sqrt(2);
        const scaled = {
          x: rotated.x * scale,
          y: rotated.y * scale
        };
        
        // 平移回原位
        const final = {
          x: scaled.x + centerX,
          y: scaled.y + centerY
        };

        return {
          type: 'rect',
          shape: {
            x: final.x,
            y: final.y,
            width: binSize * scale,
            height: binSize * scale
          },
          style: {
            fill: color
          },
          rotation: Math.PI / 4,
          origin: [final.x + (binSize * scale) / 2, final.y + (binSize * scale) / 2]
        };
      },
      data: dataset.map(d => [d.bin1, d.bin2, d.counts]),
      encode: {
        x: 0,
        y: 1,
        tooltip: [0, 1, 2]
      },
    }]
  };

  chart.value.setOption(option);
};

const updateResolution = () => {
  if (resolutionMode.value === 'auto') {
    currentBpResolution.value = hicService.calculateOptimalResolution(
      {
        start: start.value,
        end: end.value,
        windowWidth: width.value,
        availableResolutions: availableResolutions.value
      }
    );
  } else {
    currentBpResolution.value = selectedResolution.value;
  }
};

const initializeData = async () => {
  try {
    // loading.value = true;

    const [resolutions, normMethods] = await Promise.all([
      hicService.fetchResolutions(),
      hicService.fetchNormalizationMethods()
    ]);

    availableResolutions.value = resolutions;
    normalizationMethods.value = normMethods;
    // currentBpResolution.value = resolutions[0];
    selectedNormalization.value = normalizationMethods[0];
    updateResolution()
    // await fetchContactMatrix();
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    // loading.value = false;
  }
};

// 保持其他辅助函数不变
const formatResolution = (resolution) => {
  if (resolution >= 1000000) return `${resolution / 1000000}Mb`;
  if (resolution >= 1000) return `${resolution / 1000}kb`;
  return `${resolution}bp`;
};

// 初始化和数据获取逻辑
onBeforeMount(initializeData);

onMounted(() => {
  
  chart.value = echarts.init(chartContainer.value, null, {
  });
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart.value?.resize();
  });
});

onUnmounted(() => {
    chart.value?.dispose();
});

// 数据更新监听
watch([
  width,
  () => props.option.series,
  chrom,
  start,
  end,
  resolutionMode,
  selectedResolution,
  selectedNormalization
], async () => {
  if (!chart.value) return;
  
  const result = await hicService.fetchContactMatrix({
    normalization: selectedNormalization.value,
    chrom: chrom.value,
    start: start.value,
    end: end.value,
    resolution: currentBpResolution.value
  });

  renderChart(result.data);
});


</script>