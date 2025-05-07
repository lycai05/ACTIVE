<template>
  <div class="w-full h-full mx-auto" id="track-setting-draw">
    <div>
      <div class="flex mr-2">
        <div id="screenshot-holder" class=" w-full">
          <div  class="track-holder w-full" style="position: relative">
            <div class="track-item relative track-item-sortable flex-auto flex flex-col">
              <div class="flex">
                <div 
                  ref="cvs_holder" 
                  class="relative track-content flex-auto mr-2"
                  style="min-height: 24px;min-width: 0;overflow: hidden">
                  <p v-show="true" class="text-lg absolute top-0 right-1 z-20">Human - Mouse synteny regions</p>
                  <div ref="containerRef"  class="w-full"> 
                    <!-- ECharts container instead of SVG -->
                    <div ref="chartRef" style="width: 100%; height: 150px;"></div>
                  </div>
                </div>
                
                <!-- Track Controls -->
                <div class="track-item-config-holder cursor-pointer bg-gray-500  rounded-r-lg relative w-6 flex-none flex flex-col justify-between items-center pt-1 pb-1">
                  <div class="controller flex flex-col items-center justify-around">
                    <div class="controller">
                      <slot name="controller"></slot>
                    </div>

                    <!-- Settings Button -->
                    <div 
                      class="track-item-setting text-white hover:text-gray focus:text-gray"
                      @click="toggleSettings">
                      <n-popover placement="right" trigger="click" width="220px">
                        <template #trigger>
                          <svg class="w-4 h-4" viewBox="0 0 1024 1024">
                            <path
                              d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7-.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1c0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35z"
                              fill="currentColor"
                            />
                          </svg>
                        </template>
                        <div class="settings-content">
                          <!-- Add your settings content here -->
                          <div class="p-4">
                            <h3 class="text-lg font-medium mb-2">Display Settings</h3>
                            <div class="space-y-2">
                              <div class="flex items-center justify-between">
                                <span>Opacity</span>
                                <input type="range" v-model="pathOpacity" min="0.1" max="1" step="0.1" />
                              </div>
                              <div class="flex items-center justify-between">
                                <span>Stroke Width</span>
                                <input type="range" v-model="strokeWidth" min="1" max="5" step="0.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </n-popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { Ref } from 'vue';
import { NCard, NPopover } from 'naive-ui';
import { TabixIndexedFile } from '@gmod/tabix';
import { RemoteFile } from 'generic-filehandle';
import { useElementSize } from '@vueuse/core';
import * as echarts from 'echarts';

interface Location {
  chrom: string;
  start: number;
  end: number;
  max: number;
  min: number;
  size: number;
}

interface Link {
  chrom1: string;
  start1: number;
  end1: number;
  chrom2: string;
  start2: number;
  end2: number;
  query_seq?: string;
  target_seq?: string;
}

interface Props {
  location1: Location;
  location2: Location;
  links: Link[];
  url?: string; // Optional URL prop with default value
}

const props = withDefaults(defineProps<Props>(), {
  url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38_to_mm10/hg38_mm10_axt.gz'
});

// UI State
const chartRef = ref<HTMLElement | null>(null);
const showSettings = ref(false);
const pathOpacity = ref(0.3);
const strokeWidth = ref(1);
const hoveredIndex = ref(-1);

let chart: echarts.ECharts | null = null;

const containerRef = ref(null);
const { width } = useElementSize(containerRef);

// Constants
const SVG_HEIGHT = 150;

// 添加本地状态来存储解析的数据
const parsedLinks: Ref<Link[]> = ref([]);

const file = new TabixIndexedFile({
  filehandle: new RemoteFile(props.url),
  tbiFilehandle: new RemoteFile(`${props.url}.tbi`)
});

// Utility Functions
const isOverlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
  return start1 < end2 && start2 < end1;
};

// Format nucleotide sequence for tooltip display
const formatSequence = (seq?: string): string => {
  if (!seq) return 'N/A';
  
  // If sequence is too long, truncate it
  if (seq.length > 100) {
    return seq.substring(0, 100) + '...';
  }
  return seq;
};

// 文件解析函数
const parseSyntenyLine = (line: string): Link | null => {
  try {
    const [chrom1, start1, end1, rest] = line.split('\t');
    
    // 解析id和genomealign部分
    const genomealignMatch = rest.match(/id:\d+,genomealign:{(.*?)}/);
    if (!genomealignMatch) return null;
    
    const alignData = genomealignMatch[1];
    // 解析目标序列信息
    const chrMatch = alignData.match(/chr:"(.*?)"/);
    const startMatch = alignData.match(/start:(\d+)/);
    const stopMatch = alignData.match(/stop:(\d+)/);
    const strandMatch = alignData.match(/strand:"(.*?)"/);
    const targetSeqMatch = alignData.match(/targetseq:"(.*?)"/);
    const querySeqMatch = alignData.match(/queryseq:"(.*?)"/);

    if (!chrMatch || !startMatch || !stopMatch) return null;

    return {
      chrom1: chrom1,
      start1: parseInt(start1),
      end1: parseInt(end1),
      chrom2: chrMatch[1],
      start2: parseInt(startMatch[1]),
      end2: parseInt(stopMatch[1]),
      query_seq: querySeqMatch ? querySeqMatch[1] : undefined,
      target_seq: targetSeqMatch ? targetSeqMatch[1] : undefined
    };
  } catch (error) {
    console.error('Error parsing line:', error);
    return null;
  }
};

// 数据获取函数
const fetchSyntenyData = async (chrom: string, start: number, end: number) => {
  const lines: Link[] = [];
  try {
    await file.getLines(chrom, start, end, (line: string) => {
      const parsedLine = parseSyntenyLine(line);
      if (parsedLine) {
        lines.push(parsedLine);
      }
    });
    parsedLinks.value = lines;
  } catch (error) {
    console.error('Error fetching synteny data:', error);
  }
};

// Computed Properties
const filteredLinks = computed(() => {
  if (!props.location1 || !props.location2) return [];

  return parsedLinks.value.filter(link => {
    const overlap1 = link.chrom1 === props.location1.chrom && 
                    isOverlap(link.start1, link.end1, props.location1.start, props.location1.end);
    const overlap2 = link.chrom2 === props.location2.chrom && 
                    isOverlap(link.start2, link.end2, props.location2.start, props.location2.end);
    
    // 添加额外的边界检查
    const isWithinBounds = 
      link.start1 >= props.location1.start &&
      link.end1 <= props.location1.end &&
      link.start2 >= props.location2.start &&
      link.end2 <= props.location2.end;

    return overlap1 && overlap2 && isWithinBounds;
  });
});

// Functions for path generation in ECharts
const getScaledPoint = (point: number, isHuman: boolean) => {
  const location = isHuman ? props.location1 : props.location2;
  const ratio = width.value / (location.end - location.start + 1);
  const scaled = (point - location.start) * ratio;
  
  // Add boundary check
  return Math.min(Math.max(0, scaled), width.value);
};

// ECharts-related functions
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    
    // Add chart event handlers
    chart.on('mouseover', 'series', (params) => {
      hoveredIndex.value = params.dataIndex;
      chart?.setOption({
        tooltip: {
          show: true
        }
      });
    });
    
    chart.on('mouseout', 'series', () => {
      hoveredIndex.value = -1;
      chart?.setOption({
        tooltip: {
          show: false
        }
      });
    });
    
    updateChartOptions();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      chart?.resize();
    });
  }
};

const updateChartOptions = () => {
  if (!chart || width.value <= 0) return;
  
  // Using scatter series with custom rendering
  const options = {
    animation: true,
    grid: {
      left: 0,
      right: 0,
      top: 10,
      bottom: 0,
      containLabel: false
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: width.value,
      show: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: SVG_HEIGHT,
      show: false
    },
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(params) {
        const link = filteredLinks.value[params.dataIndex];
        if (!link) return '';
        
        // Create a nicely formatted tooltip
        return `
          <div style="padding: 8px">
            <div style="font-weight: bold; margin-bottom: 5px">Synteny Region</div>
            <div style="margin-bottom: 5px">
              <b>Human:</b> ${link.chrom1}:${link.start1.toLocaleString()}-${link.end1.toLocaleString()}
              <br>
              <b>Mouse:</b> ${link.chrom2}:${link.start2.toLocaleString()}-${link.end2.toLocaleString()}
            </div>
            <div style="margin-top: 5px; font-size: 0.9em">
              <div style="margin-bottom: 3px"><b>Human Sequence:</b></div>
              <div style="font-family: monospace; word-break: break-all; background: #f5f5f5; padding: 3px; border-radius: 3px">
                ${formatSequence(link.query_seq)}
              </div>
            </div>
            <div style="margin-top: 5px; font-size: 0.9em">
              <div style="margin-bottom: 3px"><b>Mouse Sequence:</b></div>
              <div style="font-family: monospace; word-break: break-all; background: #f5f5f5; padding: 3px; border-radius: 3px">
                ${formatSequence(link.target_seq)}
              </div>
            </div>
          </div>
        `;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)',
      textStyle: {
        color: '#333',
        fontSize: 12
      }
    },
    series: [{
      type: 'custom',
      renderItem: function(params, api) {
        const link = filteredLinks.value[params.dataIndex];
        if (!link) return;
        
        const x1 = getScaledPoint(link.start1, true);
        const x2 = getScaledPoint(link.end1, true);
        const x3 = getScaledPoint(link.start2, false);
        const x4 = getScaledPoint(link.end2, false);
        
        // Simple quadrilateral shape
        const points = [
          [x1, 0],         // Top left
          [x2, 0],         // Top right
          [x4, SVG_HEIGHT],// Bottom right
          [x3, SVG_HEIGHT] // Bottom left
        ];
        
        const isHovered = params.dataIndex === hoveredIndex.value;
        
        return {
          type: 'polygon',
          shape: {
            points: points
          },
          style: {
            fill: isHovered ? 'rgba(0, 100, 255, 0.6)' : 'blue',
            opacity: isHovered ? 0.6 : pathOpacity.value,
            stroke: isHovered ? '#005eff' : 'blue',
            lineWidth: isHovered ? Number(strokeWidth.value) + 1 : Number(strokeWidth.value)
          },
          // Enable hover states
          emphasis: {
            style: {
              fill: 'rgba(0, 100, 255, 0.6)',
              opacity: 0.6,
              stroke: '#005eff',
              lineWidth: Number(strokeWidth.value) + 1
            }
          }
        };
      },
      data: filteredLinks.value.map((_, index) => index), // Just use indices
      // Allow mouse interaction for tooltip
      silent: false
    }]
  };
  
  chart.setOption(options, true);
};

// Event Handlers
const toggleSettings = (): void => {
  showSettings.value = !showSettings.value;
};

// Watchers
watch(
  () => props.location1,
  async (newLocation) => {
    if (newLocation) {
      await fetchSyntenyData(newLocation.chrom, newLocation.start, newLocation.end);
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => [width.value, filteredLinks.value, pathOpacity.value, strokeWidth.value, hoveredIndex.value],
  () => {
    nextTick(() => {
      updateChartOptions();
    });
  },
  { deep: true }
);

// Lifecycle Hooks
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  
  window.removeEventListener('resize', () => {
    chart?.resize();
  });
});
</script>

<style scoped>
.track-item-config-holder {
  transition: background-color 0.2s ease;
}

.track-item-config-holder:hover {
  background-color: #e5e7eb;
}

.track-content {
  transition: all 0.3s ease;
}

.settings-content {
  padding: 1rem;
}
</style>