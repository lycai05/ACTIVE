import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import * as d3 from 'd3';

const vertexShaderSource = `
  attribute vec2 position;
  attribute vec2 instancePosition;
  attribute vec4 instanceColor;
  attribute vec2 instanceSize;
  
  uniform vec2 uResolution;
  
  varying vec4 vColor;
  
  void main() {
    vec2 pos = position * instanceSize + instancePosition;
    vec2 clipSpace = (pos / uResolution) * 2.0 - 1.0;
    clipSpace.y *= -1.0;
    
    gl_Position = vec4(clipSpace, 0, 1);
    vColor = instanceColor;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec4 vColor;
  
  void main() {
    gl_FragColor = vColor;
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

class ColorScale {
  constructor(scale) {
    this.threshold = scale.threshold;
    this.r = scale.r / 255;
    this.g = scale.g / 255;
    this.b = scale.b / 255;
  }

  getColor(value) {
    const alpha = Math.min(value, this.threshold) / this.threshold;
    return [this.r, this.g, this.b, alpha];
  }
}

self.onmessage = async (event) => {
  const { type, canvas, payload } = event.data;

  if (type === 'fetchAndPlot') {
    const { normalization, chrom, start, end, resolution, url, canvasWidth, canvasHeight, itemStyle } = payload;

    try {
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

      const gl = canvas.getContext('webgl');
      if (!gl) {
        throw new Error('WebGL not supported');
      }

      // 获取实例化渲染扩展
      const ext = gl.getExtension('ANGLE_instanced_arrays');
      if (!ext) {
        throw new Error('ANGLE_instanced_arrays extension not supported');
      }

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      const program = createProgram(gl, vertexShader, fragmentShader);
      gl.useProgram(program);

      const positions = new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        1, 1,
      ]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionLoc = gl.getAttribLocation(program, 'position');
      const instancePositionLoc = gl.getAttribLocation(program, 'instancePosition');
      const instanceColorLoc = gl.getAttribLocation(program, 'instanceColor');
      const instanceSizeLoc = gl.getAttribLocation(program, 'instanceSize');

      gl.enableVertexAttribArray(positionLoc);
      gl.enableVertexAttribArray(instancePositionLoc);
      gl.enableVertexAttribArray(instanceColorLoc);
      gl.enableVertexAttribArray(instanceSizeLoc);

      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.bin1))
        .range([0, canvasWidth]);

      const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.bin2))
        .range([canvasWidth, 0]);

      const colorScale = new ColorScale({
        threshold: itemStyle.maxScore,
        r: parseInt(itemStyle.maxCountColor.slice(1, 3), 16),
        g: parseInt(itemStyle.maxCountColor.slice(3, 5), 16),
        b: parseInt(itemStyle.maxCountColor.slice(5, 7), 16)
      });

      const instancePositions = new Float32Array(dataset.length * 2);
      const instanceColors = new Float32Array(dataset.length * 4);
      const instanceSizes = new Float32Array(dataset.length * 2);

      const dotWidth = canvasWidth / (xScale.domain()[1] - xScale.domain()[0]);
      const dotHeight = canvasWidth / (yScale.domain()[1] - yScale.domain()[0]);

      dataset.forEach((d, i) => {
        instancePositions[i * 2] = xScale(d.bin1);
        instancePositions[i * 2 + 1] = yScale(d.bin2);

        const color = colorScale.getColor(d.counts);
        instanceColors[i * 4] = color[0];
        instanceColors[i * 4 + 1] = color[1];
        instanceColors[i * 4 + 2] = color[2];
        instanceColors[i * 4 + 3] = color[3];

        instanceSizes[i * 2] = dotWidth;
        instanceSizes[i * 2 + 1] = dotHeight;
      });

      const instancePositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.STATIC_DRAW);
      gl.vertexAttribPointer(instancePositionLoc, 2, gl.FLOAT, false, 0, 0);
      ext.vertexAttribDivisorANGLE(instancePositionLoc, 1);

      const instanceColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, instanceColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(instanceColorLoc, 4, gl.FLOAT, false, 0, 0);
      ext.vertexAttribDivisorANGLE(instanceColorLoc, 1);

      const instanceSizeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceSizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, instanceSizes, gl.STATIC_DRAW);
      gl.vertexAttribPointer(instanceSizeLoc, 2, gl.FLOAT, false, 0, 0);
      ext.vertexAttribDivisorANGLE(instanceSizeLoc, 1);

      const resolutionLoc = gl.getUniformLocation(program, 'uResolution');
      gl.uniform2f(resolutionLoc, canvasWidth, canvasHeight);

      gl.viewport(0, 0, canvasWidth, canvasHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 使用扩展的实例化绘制方法
      ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, dataset.length);

      self.postMessage({ type: 'plotDone', payload: { isVisible: true } });
    } catch (error) {
      self.postMessage({ type: 'error', payload: error.message });
    }
  }
};