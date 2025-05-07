<!-- PclsTrackItem.vue -->
<template>
  <div class="relative">
    <div class="w-full overflow-auto" :style="containerStyle">
      <div ref="chartRef" class="w-full" :style="{height: `${canvasHeight}px`}">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { useElementSize } from '@vueuse/core'
import { useScreenshotStore } from '@/browser/store'

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
  rowHeight: {
    type: Number,
    default: 10,
    required: false
  },
  rowGap: {
    type: Number,
    default: 1,
    required: false
  },
  rectHeight: {
    type: Number,
    default: 10,
    required: false
  }
})

const chartRef = ref(null)
const chart = ref(null)
const canvasHeight = ref(0)
const screenshotStore = useScreenshotStore()
const { width, height } = useElementSize(chartRef)

const containerStyle = computed(() => ({
  height: `${canvasHeight.value}px`,
  minHeight: props.style.height || '100%'
}))

// Layout utility functions
const _intersects = (dim1, dim2, hpad = 1) => {
  let dim1Start, dim1End, dim1Start2, dim1End2
  let dim2Start, dim2End, dim2Start2, dim2End2

  // 处理第一个维度
  if (dim1.outTrackViews === 1) {
    // 第一个anchor不在trackView中
    // const anchor2Center = (dim1.start2 + dim1.end2) / 2
    dim1Start = dim1.start2 - 19  // 距离第二个anchor 20bp
    dim1End = dim1.start2 - 20
    dim1Start2 = dim1.start2
    dim1End2 = dim1.end2
  } else if (dim1.outTrackViews === 2) {
    // 第二个anchor不在trackView中
    const anchor1Center = (dim1.start + dim1.end) / 2
    dim1Start = dim1.start
    dim1End = dim1.end
    dim1Start = dim1.end + 19  // 距离第二个anchor 20bp
    dim1End = dim1.end + 20
  } else {
    // 正常情况
    dim1Start = dim1.start
    dim1End = dim1.end
    dim1Start2 = dim1.start2
    dim1End2 = dim1.end2
  }

  // 处理第二个维度
  if (dim2.outTrackViews === 1) {
    // 第一个anchor不在trackView中
    const anchor2Center = (dim2.start2 + dim2.end2) / 2
    dim1Start = dim1.start2 - 19  // 距离第二个anchor 20bp
    dim1End = dim1.start2 - 20
    dim2Start2 = dim2.start2
    dim2End2 = dim2.end2
  } else if (dim2.outTrackViews === 2) {
    // 第二个anchor不在trackView中
    const anchor1Center = (dim2.start + dim2.end) / 2
    dim2Start = dim2.start
    dim2End = dim2.end
    dim1Start = dim1.end + 19  // 距离第二个anchor 20bp
    dim1End = dim1.end + 20
  } else {
    // 正常情况
    dim2Start = dim2.start
    dim2End = dim2.end
    dim2Start2 = dim2.start2
    dim2End2 = dim2.end2
  }

  const pad = hpad
  // 计算两个维度的范围
  const p = Math.min(dim1Start, dim1Start2) - pad
  const q = Math.max(dim1End, dim1End2) + pad
  const m = Math.min(dim2Start, dim2Start2) - pad
  const n = Math.max(dim2End, dim2End2) + pad

  return p < n && q >= m
}


const _noIntersection = (dim, group) => {
  for (let i = 0; i < group.length; i++) {
    if (_intersects(group[i], dim)) return false
  }
  return true
}

const _determineRow = (dim, groups) => {
  for (let i = 0; i < groups.length; i++) {
    if (_noIntersection(dim, groups[i])) {
      groups[i].push(dim)
      return i
    }
  }
  groups.push([dim])
  return groups.length - 1
}

const layoutByColor = (items) => {
  const colorGroups = {}
  items.forEach(item => {
    const colorValue = item[props.option.sortY.colorField]
    if (!colorGroups[colorValue]) {
      colorGroups[colorValue] = []
    }
    colorGroups[colorValue].push(item)
  })

  let currentRow = 0
  const result = []
  const groupInfo = []

  const sortedColors = Object.keys(colorGroups).sort((a, b) => {
    const order = props.option.sortY.sortOrder === 'desc' ? -1 : 1
    return order * (Number(a) - Number(b))
  })

  sortedColors.forEach(colorValue => {
    const group = colorGroups[colorValue]
    const layoutGroups = []
    group.forEach(item => {
      const row = _determineRow(item, layoutGroups)
      result.push({
        ...item,
        row: currentRow + row
      })
    })
    
    groupInfo.push({
      colorValue,
      startRow: currentRow,
      endRow: currentRow + layoutGroups.length - 1,
      rowCount: layoutGroups.length
    })
    
    currentRow += layoutGroups.length
  })

  return { 
    layoutedItems: result, 
    groupInfo 
  }
}

const layoutByPosition = (items) => {
  const layoutGroups = []
  return items.map(item => ({
    ...item,
    row: _determineRow(item, layoutGroups)
  }))
}

const getColorByValue = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return props.option.series?.[0]?.itemStyle?.color || '#5470c6'
  }

  // Business-oriented color palette
  const colors = [
    '#2E86C1', // Blue
    '#27AE60', // Green
    '#F39C12', // Orange
    '#C0392B', // Red
    '#8E44AD', // Purple
    '#16A085', // Teal
    '#D35400', // Dark Orange
    '#2980B9', // Light Blue
    '#1ABC9C', // Turquoise
    '#7F8C8D'  // Gray
  ]

  const allValues = props.processedData
    .map(l => Number(l[props.option.sortY.colorField]))
    .filter(v => !isNaN(v))
    
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  
  // Map the value to a discrete color index
  const normalizedValue = (value - minValue) / (maxValue - minValue)
  const colorIndex = Math.min(
    Math.floor(normalizedValue * colors.length),
    colors.length - 1
  )
  
  return colors[colorIndex]
}

const initChart = () => {
  if (!chartRef.value) return

  const layoutResult = props.option.sortY.sortBy === 'color' 
    ? layoutByColor(props.processedData) 
    : { layoutedItems: layoutByPosition(props.processedData), groupInfo: [] }

  const layoutedLines = layoutResult.layoutedItems
  const groupInfo = layoutResult.groupInfo

  const totalRows = Math.max(...layoutedLines.map(line => line.row)) + 1
  const totalHeight = totalRows * props.rowHeight + (totalRows - 1) * props.rowGap
  canvasHeight.value = totalHeight + 50

  nextTick(() => {
    if (chart.value) {
      chart.value.dispose()
    }
    
    chart.value = echarts.init(chartRef.value, null, {
      renderer: 'canvas',
      height: canvasHeight.value
    })
    
    const series = [{
    type: 'custom',
    animation: false,
    clip: false,
    renderItem: (params, api) => {
      if (typeof api.coord !== 'function') {
    return {
      type: 'group',
      children: [] // 返回空组，避免渲染错误
    };
  }
     
      const item = layoutedLines[params.dataIndex]
      const start1 = api.value(0)
      const end1 = api.value(1)
      const start2 = api.value(2)
      const end2 = api.value(3)
      
      const rowPosition = item.row * (props.rowHeight + props.rowGap) + 2
      const centerY = rowPosition + props.rowHeight / 2
      
      const y = api.coord([0, centerY])[1]
      
      const rect1Width = Math.max(api.size([end1 - start1, 0])[0], 3)
      const rect2Width = Math.max(api.size([end2 - start2, 0])[0], 3)
      
      const color = item[props.option.sortY.colorField] ? 
        getColorByValue(item[props.option.sortY.colorField]) : 
        props.option.series[0]?.itemStyle?.color || '#5470c6'
      
      const children = [
        // 第一个矩形
        {
          type: 'rect',
          shape: {
            x: api.coord([start1, 0])[0],
            y: y - props.rectHeight/2,
            width: rect1Width,
            height: props.rectHeight
          },
          style: { fill: color }
        },
        // 第二个矩形
        {
          type: 'rect',
          shape: {
            x: api.coord([start2, 0])[0],
            y: y - props.rectHeight/2,
            width: rect2Width,
            height: props.rectHeight
          },
          style: { fill: color }
        }
      ]

            // 根据outTrackViews的值添加不同的线段
      //       if (item.outTrackViews === 1) {
      //   // 向左的2px小横线
      //   children.push({
      //     type: 'line',
      //     shape: {
      //       x1: api.coord([start2, 0])[0],
      //       y1: y,
      //       x2: api.coord([start2, 0])[0] - 10, // 向左延伸2px
      //       y2: y
      //     },
      //     style: {
      //       stroke: props.option.series[0]?.lineStyle?.color || '#fff',
      //       lineWidth: props.option.series[0]?.lineStyle?.width || 0.2
      //     }
      //   })
      // } else if (item.outTrackViews === 2) {
      //   // 向右的2px小横线
      //   children.push({
      //     type: 'line',
      //     shape: {
      //       x1: api.coord([end1, 0])[0],
      //       y1: y,
      //       x2: api.coord([end1, 0])[0] + 10, // 向右延伸2px
      //       y2: y
      //     },
      //     style: {
      //       stroke: props.option.series[0]?.lineStyle?.color || '#fff',
      //       lineWidth: props.option.series[0]?.lineStyle?.width || 0.2,
      //       lineDash: [4, 4],
      //       lineDashOffset: 0
      //     }
      //   })
      // } else {
      //   // 正常的连接线（当outTrackViews为0时）
      //   children.push({
      //     type: 'line',
      //     shape: {
      //       x1: api.coord([end1, 0])[0],
      //       y1: y,
      //       x2: api.coord([start2, 0])[0],
      //       y2: y
      //     },
      //     style: {
      //       stroke: props.option.series[0]?.lineStyle?.color || '#fff',
      //       lineWidth: props.option.series[0]?.lineStyle?.width || 0.2,
      //       lineDash: [4, 4],
      //       lineDashOffset: 0
      //     }
      //   })
      // }


      //现在所有的loop都有两个anchor在trackView中，只需要画正常的连接线
      children.push({
        type: 'line',
        shape: {
          x1: api.coord([end1, 0])[0],
          y1: y,
          x2: api.coord([start2, 0])[0],
          y2: y
        },
        style: {
          stroke: props.option.series[0]?.lineStyle?.color || '#fff',
          lineWidth: props.option.series[0]?.lineStyle?.width || 0.2,
          lineDash: [4, 4],
          lineDashOffset: 0
        }
      })

      return {
        type: 'group',
        children: children
      }
    },
    data: layoutedLines.map(item => [
      item.start,
      item.end,
      item.start2,
      item.end2,
      item.row * (props.rowHeight + props.rowGap)
    ])
  }]

    if (props.option.sortY.sortBy === 'color' && groupInfo.length > 0) {
      series.push({
        type: 'custom',
        renderItem: (params, api) => {
          if (typeof api.coord !== 'function') {
    return {
      type: 'group',
      children: [] // 返回空组，避免渲染错误
    };
  }
          const groupData = groupInfo[params.dataIndex]
          if (params.dataIndex === 0) return
          
          const rowPosition = groupData.startRow * (props.rowHeight + props.rowGap) + 2


          const y = api.coord([0, rowPosition])[1]
          
          return {
            type: 'group',
            animation: false,
            clip: true,
            children: [
              {
                type: 'line',
                shape: {
                  x1: api.coord([props.location.start, 0])[0],
                  y1: y,
                  x2: api.coord([props.location.end, 0])[0],
                  y2: y
                },
                style: {
                  stroke: '#ccc',
                  lineWidth: 0.2
                }
              },
              {
                type: 'text',
                style: {
                  text: `Score ${groupData.colorValue}`,
                  font: '10px Arial',
                  x: api.coord([props.location.start, 0])[0] - 60,
                  y: y - 10
                }
              }
            ]
          }
        },
        data: groupInfo
      })
    }

    const option = {
      grid: {
        show: false,
        left: '0px',
        right: '0px',
        bottom: '0px',
        top: '0px',
        containLabel: true,
        height: canvasHeight.value
      },
      xAxis: {
        type: 'value',
        min: props.location.start,
        max: props.location.end,
        show: false,
      },
      yAxis: {
        show: false,
        type: 'value',
        min: 0,
        max: totalHeight,
        interval: totalHeight,
        inverse: true,
        offset: 0,
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
      series: series,
      tooltip: {
        trigger: 'item',
        triggerOn: 'click',
        formatter: (params) => {
          const item = layoutedLines[params.dataIndex]
          return `${item.rawChrom1}:${item.rawStart1}-${item.rawEnd1}<br/>
                  ${item.rawChrom2}:${item.rawStart2}-${item.rawEnd2}<br/>
                  P-value: ${item.pvalue}<br/>
                  Row: ${item.row}`
        },
        position: 'top',
        extraCssText: 'z-index: 9999',
        appendToBody: true,
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'rgba(80, 80, 80, 0.9)',
        textStyle: {
          color: '#fff'
        }
      }
    }

    chart.value.setOption(option)
  })
}

function createSvgChart() {
  if (!chartRef.value || !chart.value) return;

  const currentWidth = width.value;
  const currentHeight = canvasHeight.value;

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

  try {
    // Get the current option from the chart instance
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
  } catch (error) {
    console.error('Error creating SVG chart for screenshot:', error);
    
    // If there's an error getting the option, recreate the chart with the same configuration
    const layoutResult = props.option.sortY?.sortBy === 'color' 
      ? layoutByColor(props.processedData) 
      : { layoutedItems: layoutByPosition(props.processedData), groupInfo: [] };
    
    const layoutedLines = layoutResult.layoutedItems;
    const groupInfo = layoutResult.groupInfo;
    
    const totalRows = Math.max(...layoutedLines.map(line => line.row), 0) + 1;
    const totalHeight = totalRows * props.rowHeight + (totalRows - 1) * props.rowGap;
    
    const series = [{
      type: 'custom',
      animation: false,
      clip: false,
      renderItem: (params, api) => {
        if (typeof api.coord !== 'function') {
          return {
            type: 'group',
            children: [] // Return empty group to avoid rendering errors
          };
        }
       
        const item = layoutedLines[params.dataIndex];
        if (!item) return { type: 'group', children: [] };
        
        const start1 = api.value(0);
        const end1 = api.value(1);
        const start2 = api.value(2);
        const end2 = api.value(3);
        
        const rowPosition = item.row * (props.rowHeight + props.rowGap) + 2;
        const centerY = rowPosition + props.rowHeight / 2;
        
        const y = api.coord([0, centerY])[1];
        
        const rect1Width = Math.max(api.size([end1 - start1, 0])[0], 3);
        const rect2Width = Math.max(api.size([end2 - start2, 0])[0], 3);
        
        const color = item[props.option.sortY.colorField] ? 
          getColorByValue(item[props.option.sortY.colorField]) : 
          props.option.series?.[0]?.itemStyle?.color || '#5470c6';
        
        const children = [
          // First rectangle
          {
            type: 'rect',
            shape: {
              x: api.coord([start1, 0])[0],
              y: y - props.rectHeight/2,
              width: rect1Width,
              height: props.rectHeight
            },
            style: { fill: color }
          },
          // Second rectangle
          {
            type: 'rect',
            shape: {
              x: api.coord([start2, 0])[0],
              y: y - props.rectHeight/2,
              width: rect2Width,
              height: props.rectHeight
            },
            style: { fill: color }
          }
        ];

        // Add connector line
        children.push({
          type: 'line',
          shape: {
            x1: api.coord([end1, 0])[0],
            y1: y,
            x2: api.coord([start2, 0])[0],
            y2: y
          },
          style: {
            stroke: props.option.series?.[0]?.lineStyle?.color || '#fff',
            lineWidth: props.option.series?.[0]?.lineStyle?.width || 0.2,
            lineDash: [4, 4],
            lineDashOffset: 0
          }
        });

        return {
          type: 'group',
          children: children
        };
      },
      data: layoutedLines.map(item => [
        item.start,
        item.end,
        item.start2,
        item.end2,
        item.row * (props.rowHeight + props.rowGap)
      ])
    }];
    
    // Create a similar option to what's used in initChart
    const option = {
      grid: {
        show: false,
        left: '0px',
        right: '0px',
        bottom: '0px',
        top: '0px',
        containLabel: true,
        height: currentHeight
      },
      xAxis: {
        type: 'value',
        min: props.location.start,
        max: props.location.end,
        show: false,
      },
      yAxis: {
        show: false,
        type: 'value',
        min: 0,
        max: totalHeight,
        interval: totalHeight,
        inverse: true,
        offset: 0,
        axisTick: {
          show: false,
          length: 0
        },
        axisLabel: {
          formatter: function(value) {
            return '';
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
      series: series,
      tooltip: {
        trigger: 'item',
        position: 'top',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'rgba(80, 80, 80, 0.9)',
        textStyle: {
          color: '#fff'
        }
      }
    };
    
    screenshotChart.setOption(option);
    
    if (screenshotChart) {
      const dataURL = screenshotChart.getDataURL({
        type: 'svg',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      
      return dataURL;
    }
  }
}

watch(
  () => screenshotStore.timestamp,
  async () => {
    if (screenshotStore.screenshotType === 'canvas') {
      // Process canvas type screenshot if needed
    } else if (screenshotStore.screenshotType === 'svg') {
      createSvgChart();
    }
  }
)

const handleResize = () => {
  chart.value?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

watch(() => props.processedData, () => {
  nextTick(() => {
    if (props.processedData.length > 0) {
      initChart()
    }
  })
}, {immediate: true, deep: true })

watch(() => canvasHeight.value, () => {
  nextTick(() => {
    if (chart.value) {
      chart.value.resize({
        height: canvasHeight.value
      })
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style scoped>
.tooltip {
  position: absolute;
  padding: 10px;
  color: #fff;
  background: #333;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1000;
}
</style>