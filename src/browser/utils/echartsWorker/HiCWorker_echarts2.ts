// HiCWorker_renderer.js
import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import * as d3 from 'd3';
import * as echarts from 'echarts';

import type { ECharts, EChartsOption, init, zrender } from 'echarts'
import { parse } from 'telejson'

self.window = self.global = self;
let instance: ECharts | null = null
// 
class ColorScale {
  constructor(scale) {
    this.threshold = scale.threshold;
    this.r = scale.r;
    this.g = scale.g;
    this.b = scale.b;
    this.cache = [];
    this.nbins = 2000;
    this.binsize = this.threshold / this.nbins;
  }

  getColor(value) {
    const bin = Math.floor(Math.min(this.threshold, value) / this.binsize);
    if (this.cache[bin] === undefined) {
      const alpha = Math.floor(255 * (Math.min(value, this.threshold) / this.threshold));
      this.cache[bin] = `rgba(${this.r},${this.g},${this.b},${alpha / 255})`;
    }
    return this.cache[bin];
  }
}

// let chart = null;
let currentDataset = null;

function positionToBin(position, resolution) {
  return Math.floor(position / resolution);
}

function binToPosition(binIndex, resolution) {
  const start = binIndex * resolution;
  const end = start + resolution;
  return {start, end};
}


function createEchartsOption(dataset, payload) {
  // const maxBin1 = d3.max(dataset, d => d.bin1);
  // const minBin1 = d3.min(dataset, d => d.bin1);
  // const maxBin2 = d3.max(dataset, d => d.bin2);
  // const minBin2 = d3.min(dataset, d => d.bin2);
  // const numBins = Math.max(maxBin1, maxBin2) - Math.min(minBin1, minBin2);

  // const maxBin = Math.max(maxBin1, maxBin2);
  // const minBin = Math.min(minBin1, minBin2);

  const minBin1 = positionToBin(payload.start, payload.resolution)
  const maxBin1 = positionToBin(payload.end, payload.resolution)
  const minBin2 = positionToBin(payload.start2, payload.resolution)
  const maxBin2 = positionToBin(payload.end2, payload.resolution)
  const binSize = payload.canvasWidth  / (payload.end - payload.start) * payload.resolution;

  const colorScale = new ColorScale({
    threshold: payload.itemStyle.maxScore,
    r: parseInt(payload.itemStyle.maxCountColor.slice(1, 3), 16),
    g: parseInt(payload.itemStyle.maxCountColor.slice(3, 5), 16),
    b: parseInt(payload.itemStyle.maxCountColor.slice(5, 7), 16)
  });

// console.log(positionToBin(payload.start, payload.resolution))
// console.log(positionToBin(payload.end, payload.resolution))

  return {
    animation: false,
    tooltip: {
      show: false,
      trigger: 'item',
      triggerOn: 'click',
      confine: 'true',
      // extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
      // className: 'echarts-tooltip',
      // enterable: true, 
      axisPointer: {
        type: 'cross',
        show: false
      },
      // appendToBody: true, 
      // alwaysShowContent : true,
      // backgroundColor: 'red',

      formatter: function (params: any) {
        // console.log(params)
        const data = params.data;
        // console.log(data)
        const position1 = binToPosition(data[0], payload.resolution)
        const position2 = binToPosition(data[1], payload.resolution)
        return `Position1: ${position1.start}-${position1.end}
Position2: ${position2.start}-${position2.end}
Counts: ${data[2]}`;

      },
      position: 'top',
      // extraCssText: 'z-index: 9999',
      appendToBody: true,
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: 'rgba(80, 80, 80, 0.9)',
      textStyle: { color: '#fff' }
    },
    grid: {
      show: false,
      left: '0',
      right: '0%',
      bottom: '0px',
      top: '0px',
      containLabel: false
    },
    xAxis: {
      position: 'top',
      type: 'value',
      min: minBin1 + 1,
      max: maxBin1,
      show: false
    },
    yAxis: {
      type: 'value',
      show: false,
      min: minBin2,
      max: maxBin2,
      // interval: maxBin - minBin,
      // offset: 10,
      // axisTick: {
      //     show: true,
      //     length: 8
      // },
      // axisLabel: {
      //     formatter: function(value) {
      //         return ''
      //     },
      //     margin: 10
      // },
      // splitLine: {
      //     show: true,
      //     lineStyle: {
      //         opacity: 0
      //     }
      },
  // dataZoom: [
  //   {
  //     type: 'inside',
  //     xAxisIndex: 0,
  //     startValue: positionToBin(payload.start, payload.resolution),
  //     endValue: positionToBin(payload.end, payload.resolution),
  //     zoomLock: true,
  //     throttle: 0,
  //     filterMode: 'none'  // 重要：防止数据被过滤
  //   },
  //   {
  //     type: 'inside',
  //     yAxisIndex: 0,
  //     startValue: positionToBin(payload.start, payload.resolution),
  //     endValue: positionToBin(payload.end, payload.resolution),
  //     zoomLock: true,
  //     throttle: 0,
  //     filterMode: 'none'  // 重要：防止数据被过滤
  //   }
  // ],
  series: [{
    type: 'scatter',
    progressive: 10000,
    progressiveThreshold: 30000,
    large: true,
    largeThreshold: 30000,
    animation: false,
    hoverLink: false,
    calculable: false,
    symbol: 'rect',
    symbolSize: function(data) {
      // 根据counts值计算散点大小
      // console.log(binSize)
      return binSize
    },
    itemStyle: {
      color: function(params) {
        // 使用原来的colorScale来设置颜色
        return colorScale.getColor(params.data[2]);
      }
    },
    data: dataset.map(d => [d.bin1, d.bin2, d.counts]),
    encode: {
      x: 0,
      y: 1,
      tooltip: [0, 1, 2]
    }
  }]
    // series: [{
    //   type: 'custom',
    //   progressive: false,
    //   large: true,
    //   animation: false,
    //   hoverLink: false,
    //   calculable: false,
    //   renderItem: (params, api) => {
    //     const value = api.value(2);
    //     const color = colorScale.getColor(value);
        
    //     const [x, y] = api.coord([api.value(0), api.value(1)]);
    //     // const centerX = params.coordSys.x + params.coordSys.width / 2;
    //     // const centerY = params.coordSys.y + params.coordSys.height / 2;
        
    //     // const transform = {
    //     //   x: x - centerX,
    //     //   y: y - centerY
    //     // };
        
    //     // const cos = Math.cos(Math.PI / 4);
    //     // const sin = Math.sin(Math.PI / 4);
    //     // const rotated = {
    //     //   x: transform.x * cos - transform.y * sin,
    //     //   y: transform.x * sin + transform.y * cos
    //     // };
        
    //     const scale = 1 / Math.sqrt(2);
    //     // const scaled = {
    //     //   x: rotated.x * scale,
    //     //   y: rotated.y * scale
    //     // };
    //   // const scaled = {
    //   //     x: x * scale,
    //   //     y: y * scale
    //   //   };
        
    //     // const final = {
    //     //   x: scaled.x + centerX,
    //     //   y: scaled.y + centerY + params.coordSys.width / 2
    //     // };
    //     const overlap = 0.5;  // 0.5像素的重叠

    //     return {
    //       type: 'rect',
    //       shape: {
    //         x: x ,
    //         y: y ,
    //         width: binSize  ,
    //         height: binSize 
    //       },
    //       style: {
    //         fill: color,
    //         stroke: 'transparent',  // 设置stroke为透明
    //         strokeWidth: 0,         // 设置线宽为0
    //         lineWidth: 0,          // 设置线宽为0
    //         borderWidth: 0         // 设置边框宽度为0
    //       },
    //       // rotation: Math.PI / 4,
    //       // origin: [final.x + (binSize * scale) / 2, final.y + (binSize * scale) / 2]
    //     };
    //   },
      // renderItem: (params, api) => {
      //   const value = api.value(2);
      //   const color = colorScale.getColor(value);
        
      //   const [x, y] = api.coord([api.value(0), api.value(1)]);
        
      //   // 获取坐标系的中心点
      //   const centerX = params.coordSys.x + params.coordSys.width / 2;
      //   const centerY = params.coordSys.y + params.coordSys.height / 2;
        
      //   // 将坐标转换为相对于中心点的坐标
      //   const relativeX = x - centerX;
      //   const relativeY = y - centerY;
        
      //   // 计算45度旋转后的坐标 (顺时针旋转45度)
      //   const cos = Math.cos(Math.PI / 4);
      //   const sin = Math.sin(Math.PI / 4);
      //   const rotatedX = relativeX * cos - relativeY * sin;
      //   const rotatedY = relativeX * sin + relativeY * cos;
        
      //   // 缩放因子 (1/√2)
      //   const scale = 1 / Math.sqrt(2);
      //   const scaledX = rotatedX * scale;
      //   const scaledY = rotatedY * scale;
        
      //   // 将坐标转换回绝对坐标，并向下平移 coordSys.width/2
      //   const finalX = scaledX + centerX;
      //   const finalY = scaledY + centerY + params.coordSys.width / 2;
        
      //   // 计算正方形的四个顶点
      //   const size = binSize * scale;
      //   const halfSize = size / 2;
      //   const overlap = 0.5; // 0.5像素的重叠
        
      //   // 计算四个顶点的坐标 (逆时针顺序)
      //   const points = [
      //     // 左上角
      //     [finalX - halfSize - overlap/2, finalY - overlap/2],
      //     // 右上角
      //     [finalX + halfSize + overlap/2, finalY - overlap/2],
      //     // 右下角
      //     [finalX + halfSize + overlap/2, finalY + size + overlap/2],
      //     // 左下角
      //     [finalX - halfSize - overlap/2, finalY + size + overlap/2]
      //   ];
      
      //   return {
      //     type: 'polygon',
      //     shape: {
      //       points: points
      //     },
      //     style: {
      //       fill: color,
      //       stroke: 'transparent',
      //       lineWidth: 0
      //     }
      //   };
      // },
    //   data: dataset.map(d => [d.bin1, d.bin2, d.counts]),
    //   encode: {
    //     x: 0,
    //     y: 1,
    //     tooltip: [0, 1, 2]
    //   },
    // }]
  };
}

async function fetchData(payload) {
  const startFetch = performance.now();
  
  const straw = new HicStraw({ url: payload.url });
  console.log(payload.chrom2)
  const data = await straw.getContactRecords(
    payload.normalization,
    { chr: payload.chrom.replace(/chr/g, ''), start: payload.start, end: payload.end },
    { chr: payload.chrom2.replace(/chr/g, ''), start: payload.start2, end: payload.end2 },
    'BP',
    payload.resolution
  );
  
  const endFetch = performance.now();
  const fetchTime = endFetch - startFetch;
  
  return { data, fetchTime };
}

function renderData(dataset, payload) {
  const startRender = performance.now();
  
  const option = createEchartsOption(dataset, payload);
  instance.setOption(option, true);
  
  const endRender = performance.now();
  const renderTime = endRender - startRender;
  
  return renderTime;
}

async function  fetchAndRenderData(payload) {
  const { data } = await fetchData(payload);
  renderData(data, payload);
  postMessage({message: 'renderer ====================================='})

}



type InitOption = Parameters<typeof init>[2]

type EventType = Parameters<zrender.ZRenderType['handler']['dispatch']>[0]

type Message =
    | {
          type: 'init'
          canvas: OffscreenCanvas
          theme: string | EChartsOption
          option: InitOption
      }
    | {
          type: 'resize'
          args: Parameters<ECharts['resize']>
      }
    | {
          type: 'render'
          args: Parameters<ECharts['setOption']>
      }
    | {
          type: 'event'
          event: MouseEvent
      }
    | {
          type: 'dispose'
      }
    | {
          type: 'addEventListener'
          event: string
      }
    | {
          type: 'removeEventListener'
          event: string
      }
    | {
          type: 'showLoading'
          args: Parameters<ECharts['showLoading']>
      }
    | {
          type: 'hideLoading'
          args: Parameters<ECharts['hideLoading']>
      }
    | {
      type: 'fetchAndRenderData',
      args: Array<10>
    }
    | {
      type: 'dataZoom'
      args: {
          startValue: number
          endValue: number
      }
    }


// self.echarts.setPlatformAPI({
//     createCanvas() {
//         return new OffscreenCanvas(1, 1) as unknown as HTMLCanvasElement
//     }
// })

/**
 * Resize the chart with the given width and height.
 */
function resize(...args: Parameters<ECharts['resize']>) {
    instance?.resize(...args)
}

/**
 * Render the chart with the given option.
 */
function render(...args: Parameters<ECharts['setOption']>) {
    instance?.setOption(...args)
}

/**
 * Dispose of the chart instance
 * and stop the worker.
 */
function dispose() {
    instance?.dispose()
    close()
}

/**
 * Initialize the chart instance.
 */
function initialize(
    canvas: OffscreenCanvas,
    theme: string | EChartsOption,
    option: InitOption = {}
) {
    instance?.dispose()

    const devicePixelRatio = option.devicePixelRatio ?? 1
    option.width ??= canvas.width / devicePixelRatio
    option.height ??= canvas.height / devicePixelRatio

    instance = echarts.init(
        canvas as unknown as HTMLDivElement,
        theme,
        option
    )

    postMessage({message: 'initialized ====================================='})
}

/**
 * Register events to the main thread.
 */
function addEventListener(type: string) {
    instance?.on(type, event => {
              // 提取坐标信息
              const zrX = event?.event?.event.zrX;
              const zrY = event?.event?.event.zrY;
      console.log(event)
        postMessage({
            type: `echarts:${type}`,
            data: {
                ...(event as Record<string, unknown>),
                event: null,
                x: zrX, 
                y: zrY
            }
        })
    })
}

/**
 * Remove events to the main thread.
 */
function removeEventListener(type: string) {
    instance?.off(type)
}

/**
 * Handle mouse events from the main thread.
 */
function handleEvent(event: MouseEvent) {
    const newEvent = Object.assign(new Event(event.type, event), {
        zrX: event.offsetX,
        zrY: event.offsetY
    })

    instance?.getZr().handler.dispatch(newEvent.type as EventType, newEvent)
}

/**
 * Handle the message from the main thread.
 */
 async function onMessageHandler({ data }: MessageEvent<Message>) {
    switch (data.type) {
        case 'init':
            return initialize(data.canvas, data.theme, data.option)
        case 'resize':
            return resize(...data.args)
        case 'render':
            return render(
                ...(parse(data.args as unknown as string) as Parameters<
                    ECharts['setOption']
                >)
            )
        case 'event':
            return handleEvent(data.event)
        case 'dispose':
            return dispose()
        case 'addEventListener':
            return addEventListener(data.event)
        case 'removeEventListener':
            return removeEventListener(data.event)
        case 'showLoading':
            return instance?.showLoading(...data.args)
        case 'hideLoading':
            return instance?.hideLoading(...data.args)
        case 'fetchAndRenderData':
            return  await fetchAndRenderData(data.args)
        case 'dataZoom':
              const bin1 = positionToBin(data.args.startValue, data.args.resolution)
              const bin2 = positionToBin(data.args.endValue, data.args.resolution)
              return instance?.dispatchAction({
                  type: 'dataZoom',
                  zoomLock: true,
                  startValue: bin1,
                  endValue: bin2
              });
    }
}

self.onmessage = onMessageHandler.bind(self)

// self.onmessage = async (event) => {
//   const { type, canvas, payload } = event.data;

//   switch (type) {
//     case 'init':
//       chart = echarts.init(canvas);
//       break;

//     case 'fetchNewData':
//       try {
//         // 测量数据获取时间
//         const { data: newDataset, fetchTime } = await fetchData(payload);
//         currentDataset = newDataset;

//         if (!currentDataset || currentDataset.length === 0) {
//           postMessage({ 
//             type: 'plotDone', 
//             payload: { 
//               isVisible: false,
//               performance: { fetchTime }
//             }
//           });
//           return;
//         }

//         // 测量渲染时间
//         const renderTime = renderData(currentDataset, payload);

//         postMessage({ 
//           type: 'plotDone', 
//           payload: { 
//             isVisible: true,
//             performance: {
//               fetchTime,
//               renderTime,
//               totalTime: fetchTime + renderTime,
//               dataPoints: currentDataset.length
//             }
//           }
//         });
//       } catch (error) {
//         postMessage({ type: 'error', payload: error.message });
//       }
//       break;

//     case 'updateOptions':
//       if (currentDataset) {
//         const startRender = performance.now();
//         const renderTime = renderData(currentDataset, payload);
        
//         postMessage({ 
//           type: 'plotDone', 
//           payload: { 
//             isVisible: true,
//             performance: {
//               renderTime,
//               dataPoints: currentDataset.length
//             }
//           }
//         });
//       }
//       break;
//   }
// };
