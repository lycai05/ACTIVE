import zrender from 'zrender';
import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import * as d3 from 'd3';

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

self.onmessage = async (event) => {
  const { type, canvas, payload } = event.data;

  if (type === 'fetchAndPlot') {
    const { normalization, chrom, start, end, resolution, url, canvasWidth, canvasHeight, itemStyle, flip } = payload;

    try {
      // 获取Hi-C数据
      const straw = new HicStraw({ url });
      const dataset = await straw.getContactRecords(
        normalization,
        { chr: chrom.replace(/chr/g, ''), start, end },
        { chr: chrom.replace(/chr/g, ''), start, end },
        'BP',
        resolution
      );

      if (!dataset || dataset.length === 0) {
        postMessage({ type: 'plotDone', payload: { isVisible: false } });
        return;
      }

      // 初始化zrender
      const zr = zrender.init(canvas, {
        renderer: 'canvas'  // 必须使用canvas渲染器
      });

      // 计算数据范围
      const maxBin1 = d3.max(dataset, d => d.bin1);
      const minBin1 = d3.min(dataset, d => d.bin1);
      const maxBin2 = d3.max(dataset, d => d.bin2);
      const minBin2 = d3.min(dataset, d => d.bin2);
      const numBins = Math.max(maxBin1, maxBin2) - Math.min(minBin1, minBin2) + 1;

      // 计算比例尺
      const xScale = d3.scaleLinear()
        .domain([minBin1, maxBin1])
        .range([0, canvasWidth]);

      const yScale = d3.scaleLinear()
        .domain([minBin2, maxBin2])
        .range([canvasWidth, 0]);

      // 创建颜色比例尺
      const colorScale = new ColorScale({
        threshold: itemStyle.maxScore,
        r: parseInt(itemStyle.maxCountColor.slice(1, 3), 16),
        g: parseInt(itemStyle.maxCountColor.slice(3, 5), 16),
        b: parseInt(itemStyle.maxCountColor.slice(5, 7), 16)
      });

  // 正常使用zrender API
  const circle = new zrender.Circle({
    shape: {
      cx: 200,
      cy: 200,
      r: 500
    },
    style: {
      fill: 'red'
    }
  });

  zr.add(circle);

      // 创建一个群组用于统一变换
      // const group = new zrender.Group();
      
      // // 设置变换
      // group.setOrigin([canvasWidth / 2, canvasWidth / 2]);
      // group.rotation = Math.PI / 4;
      // group.scale = [1 / Math.sqrt(2), 1 / Math.sqrt(2)];
      
      // if (flip) {
      //   group.scale = [-1 / Math.sqrt(2), -1 / Math.sqrt(2)];
      // }

      // // 添加所有数据点
      // dataset.forEach(d => {
      //   const rect = new zrender.Rect({
      //     shape: {
      //       x: xScale(d.bin1),
      //       y: yScale(d.bin2),
      //       width: canvasWidth / numBins,
      //       height: canvasWidth / numBins
      //     },
      //     style: {
      //       fill: colorScale.getColor(d.counts)
      //     },
      //     silent: true // 禁用交互以提高性能
      //   });
        
      //   group.add(rect);
      // });

      // // 将群组添加到画布
      // zr.add(group);
      
      // 强制渲染
      // zr.flush();

      const binSize = canvasWidth / (end - start) * resolution;
      const scale = 1 / Math.sqrt(2);

      self.postMessage({ 
        type: 'plotDone', 
        payload: {
          dataset: dataset,
          binSize: binSize,
          scale: scale
        }
      });

    } catch (error) {
      self.postMessage({ type: 'error', payload: error.message });
    }
  }
};