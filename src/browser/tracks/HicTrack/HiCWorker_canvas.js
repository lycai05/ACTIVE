// HiCWorker_renderer.js
import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import * as d3 from 'd3';
import * as echarts from 'echarts';

self.window = self.global = self;

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

let chart = null;
let currentDataset = null;

// function createEchartsOption(dataset, payload) {
//   const maxBin1 = d3.max(dataset, d => d.bin1);
//   const minBin1 = d3.min(dataset, d => d.bin1);
//   const maxBin2 = d3.max(dataset, d => d.bin2);
//   const minBin2 = d3.min(dataset, d => d.bin2);
//   const numBins = Math.max(maxBin1, maxBin2) - Math.min(minBin1, minBin2) + 1;
//   const maxBin = Math.max(maxBin1, maxBin2);
//   const minBin = Math.min(minBin1, minBin2);

//   const binSize = payload.canvasWidth / (payload.end - payload.start) * payload.resolution;

//   const colorScale = new ColorScale({
//     threshold: payload.itemStyle.maxScore,
//     r: parseInt(payload.itemStyle.maxCountColor.slice(1, 3), 16),
//     g: parseInt(payload.itemStyle.maxCountColor.slice(3, 5), 16),
//     b: parseInt(payload.itemStyle.maxCountColor.slice(5, 7), 16)
//   });

//   return {
//     animation: false,
//     grid: {
//       left: '3%',
//       right: '3%',
//       top: '3%',
//       bottom: '3%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'value',
//       min: minBin,
//       max: maxBin
//     },
//     yAxis: {
//       type: 'value',
//       min: minBin,
//       max: maxBin
//     },
//     series: [{
//       type: 'custom',
//       progressive: false,
//       large: true,
//       animation: false,
//       hoverLink: false,
//       calculable: false,
//       renderItem: (params, api) => {
//         const value = api.value(2);
//         const color = colorScale.getColor(value);
        
//         const [x, y] = api.coord([api.value(0), api.value(1)]);
//         const centerX = params.coordSys.x + params.coordSys.width / 2;
//         const centerY = params.coordSys.y + params.coordSys.height / 2;
        
//         const transform = {
//           x: x - centerX,
//           y: y - centerY
//         };
        
//         const cos = Math.cos(Math.PI / 4);
//         const sin = Math.sin(Math.PI / 4);
//         const rotated = {
//           x: transform.x * cos - transform.y * sin,
//           y: transform.x * sin + transform.y * cos
//         };
        
//         const scale = 1 / Math.sqrt(2);
//         const scaled = {
//           x: rotated.x * scale,
//           y: rotated.y * scale
//         };
        
//         const final = {
//           x: scaled.x + centerX,
//           y: scaled.y + centerY
//         };

//         return {
//           type: 'rect',
//           shape: {
//             x: final.x,
//             y: final.y,
//             width: binSize * scale,
//             height: binSize * scale
//           },
//           style: {
//             fill: color
//           },
//           rotation: Math.PI / 4,
//           origin: [final.x + (binSize * scale) / 2, final.y + (binSize * scale) / 2]
//         };
//       },
//       data: dataset.map(d => [d.bin1, d.bin2, d.counts]),
//       encode: {
//         x: 0,
//         y: 1,
//         tooltip: [0, 1, 2]
//       },
//     }]
//   };
// }

async function fetchData(payload) {
  const startFetch = performance.now();
  
  const straw = new HicStraw({ url: payload.url });
  const data = await straw.getContactRecords(
    payload.normalization,
    { chr: payload.chrom.replace(/chr/g, ''), start: payload.start, end: payload.end },
    { chr: payload.chrom.replace(/chr/g, ''), start: payload.start, end: payload.end },
    'BP',
    payload.resolution
  );
  
  const endFetch = performance.now();
  const fetchTime = endFetch - startFetch;
  
  return { data, fetchTime };
}

function renderData(canvas, dataset, payload) {
    const { normalization, chrom, start, end, resolution, url, canvasWidth, canvasHeight, itemStyle, flip } = payload;
  const startRender = performance.now();
  
  const maxBin1 = d3.max(dataset, d => d.bin1);
  const minBin1 = d3.min(dataset, d => d.bin1);
  const maxBin2 = d3.max(dataset, d => d.bin2);
  const minBin2 = d3.min(dataset, d => d.bin2);
  const numBins = Math.max(maxBin1, maxBin2) - Math.min(minBin1, minBin2) + 1;
  const maxBin = Math.max(maxBin1, maxBin2)
  const minBin = Math.max(minBin1, minBin2)

  const dotWidth = canvasWidth / numBins;
  const dotHeight = canvasWidth / numBins;
  
  const ctx = canvas.getContext('2d');
  ctx.translate(canvasWidth / 2, canvasWidth / 2);
  // if (flip) {
  //   ctx.rotate(- 3 * Math.PI / 4);
  // } else {
    ctx.rotate( Math.PI / 4);
  // }

  ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2));
  if (flip) {
    ctx.scale(-1, -1);
  }

  // ctx.translate(canvasWidth / 2, canvasWidth / 2);
  // ctx.rotate(Math.PI / 4);
  // ctx.scale(1 / Math.sqrt(2), 1 / Math.sqrt(2));

  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, (d) => d.bin1))
    .range([0, canvasWidth]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, (d) => d.bin2))
    .range([canvasWidth, 0]);

  const colorScale = new ColorScale({
    threshold: itemStyle.maxScore,
    r: parseInt(itemStyle.maxCountColor.slice(1, 3), 16),
    g: parseInt(itemStyle.maxCountColor.slice(3, 5), 16),
    b: parseInt(itemStyle.maxCountColor.slice(5, 7), 16)
  });

  dataset.forEach((d) => {
    const x = xScale(d.bin1);
    const y = yScale(d.bin2);
    const color = colorScale.getColor(d.counts);

    ctx.beginPath();
    ctx.rect(x, y, dotWidth, dotHeight);
    ctx.fillStyle = color;
    ctx.fill();
    // ctx.stroke()
  });

  const endRender = performance.now();
  const renderTime = endRender - startRender;
  
  return renderTime;
}

self.onmessage = async (event) => {
  const { type, canvas, payload } = event.data;

  switch (type) {

    case 'fetchNewData' || 'init':
      try {
        // 测量数据获取时间
        const { data: newDataset, fetchTime } = await fetchData(payload);
        currentDataset = newDataset;

        
        if (!currentDataset || currentDataset.length === 0) {
          postMessage({ 
            type: 'plotDone', 
            payload: { 
              isVisible: false,
              performance: { fetchTime }
            }
          });
          return;
        }

        // 测量渲染时间
        const renderTime = renderData(canvas, currentDataset, payload);

        postMessage({ 
          type: 'plotDone', 
          payload: { 
            isVisible: true,
            performance: {
              fetchTime,
              renderTime,
              totalTime: fetchTime + renderTime,
              dataPoints: currentDataset.length
            }
          }
        });
      } catch (error) {
        postMessage({ type: 'error', payload: error.message });
      }
      break;

    case 'updateOptions':
      if (currentDataset) {
        const startRender = performance.now();
        const renderTime = renderData(canvas, currentDataset, payload);
        
        postMessage({ 
          type: 'plotDone', 
          payload: { 
            isVisible: true,
            performance: {
              renderTime,
              dataPoints: currentDataset.length
            }
          }
        });
      }
      break;
  }
};