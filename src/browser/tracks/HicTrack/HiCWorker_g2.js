// HiCWorker_renderer.js
import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import * as d3 from 'd3';
import { Chart } from '@antv/g2';

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

function createG2Chart(canvas, dataset, payload) {
  const maxBin1 = d3.max(dataset, d => d.bin1);
  const minBin1 = d3.min(dataset, d => d.bin1);
  const maxBin2 = d3.max(dataset, d => d.bin2);
  const minBin2 = d3.min(dataset, d => d.bin2);
  const maxBin = Math.max(maxBin1, maxBin2);
  const minBin = Math.min(minBin1, minBin2);

  const binSize = payload.canvasWidth / (payload.end - payload.start) * payload.resolution;

  const colorScale = new ColorScale({
    threshold: payload.itemStyle.maxScore,
    r: parseInt(payload.itemStyle.maxCountColor.slice(1, 3), 16),
    g: parseInt(payload.itemStyle.maxCountColor.slice(3, 5), 16),
    b: parseInt(payload.itemStyle.maxCountColor.slice(5, 7), 16)
  });

  // 转换数据格式
  const transformedData = dataset.map(d => ({
    bin1: d.bin1,
    bin2: d.bin2,
    counts: d.counts,
    color: colorScale.getColor(d.counts)
  }));

  // 创建G2图表实例
  if (chart) {
    chart.destroy();
  }

  chart = new Chart({
    container: canvas,
    autoFit: true,
    padding: [20, 20, 20, 20]
  });

  chart.scale({
    bin1: {
      min: minBin,
      max: maxBin
    },
    bin2: {
      min: minBin,
      max: maxBin
    }
  });

  // 使用自定义Shape绘制热图
  chart.coordinate('rect').transpose().rotate(45);
  
  chart
    .polygon()
    .data(transformedData)
    .encode('x', 'bin1')
    .encode('y', 'bin2')
    .encode('color', 'color')
    .style('opacity', 1)
    .style('lineWidth', 0)
    .animate(false)
    .shape('square', (x, y, shape) => {
      const scaledSize = binSize / Math.sqrt(2);
      return {
        width: scaledSize,
        height: scaledSize
      };
    });

  chart.axis('bin1', {
    title: false,
    grid: null
  });

  chart.axis('bin2', {
    title: false,
    grid: null
  });

  chart.legend(false);
  
  return chart;
}

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
  const startRender = performance.now();
  
  const chart = createG2Chart(canvas, dataset, payload);
  chart.render();
  
  const endRender = performance.now();
  const renderTime = endRender - startRender;
  
  return renderTime;
}

self.onmessage = async (event) => {
  const { type, canvas, payload } = event.data;

  switch (type) {
    case 'init':
      // G2不需要像echarts那样显式初始化
      break;

    case 'fetchNewData':
      try {
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