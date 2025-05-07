// HiCWorker_renderer.ts
import { EChartsWorkerBase, Message, positionToBin, binToPosition, ColorScale } from './echartsWorkerBase';
import HicStraw from 'hic-straw/dist/hic-straw.min.js';
import type { EChartsOption } from 'echarts';

class HiCWorker extends EChartsWorkerBase {
    private currentDataset: any = null;

    private createEchartsOption(dataset: any[], payload: any): EChartsOption {
        const minBin = positionToBin(payload.bufferedStart, payload.resolution);
        const maxBin = positionToBin(payload.bufferedEnd, payload.resolution);
        const binSize = payload.canvasWidth * 3 / (payload.bufferedEnd - payload.bufferedStart) * payload.resolution;

        const colorScale = new ColorScale({
            threshold: payload.itemStyle.maxScore,
            r: parseInt(payload.itemStyle.maxCountColor.slice(1, 3), 16),
            g: parseInt(payload.itemStyle.maxCountColor.slice(3, 5), 16),
            b: parseInt(payload.itemStyle.maxCountColor.slice(5, 7), 16)
        });

        return {
            animation: false,
            tooltip: {
                trigger: 'item',
                triggerOn: 'click',
                formatter: function(params: any) {
                    const data = params.data;
                    const position1 = binToPosition(data[0], payload.resolution);
                    const position2 = binToPosition(data[1], payload.resolution);
                    return `Position1: ${position1.start}-${position1.end}
Position2: ${position2.start}-${position2.end}
Counts: ${data[2]}`;
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
                left: '0',
                right: '0%',
                bottom: '0px',
                top: '0px',
                containLabel: false
            },
            xAxis: {
                type: 'value',
                min: minBin + 1,
                max: maxBin,
                show: false
            },
            yAxis: {
                type: 'value',
                show: false,
                min: minBin,
                max: maxBin,
            },
            series: [{
                type: 'custom',
                progressive: false,
                large: true,
                animation: false,
                hoverLink: false,
                calculable: false,
                renderItem: (params: any, api: any) => {
                    const value = api.value(2);
                    const color = colorScale.getColor(value);
                    
                    const [x, y] = api.coord([api.value(0), api.value(1)]);
                    const centerX = params.coordSys.x + params.coordSys.width / 2;
                    const centerY = params.coordSys.y + params.coordSys.height / 2;
                    
                    const transform = {
                        x: x - centerX,
                        y: y - centerY
                    };
                    
                    const cos = Math.cos(Math.PI / 4);
                    const sin = Math.sin(Math.PI / 4);
                    const rotated = {
                        x: transform.x * cos - transform.y * sin,
                        y: transform.x * sin + transform.y * cos
                    };
                    
                    const scale = 1 / Math.sqrt(2);
                    const scaled = {
                        x: rotated.x * scale,
                        y: rotated.y * scale
                    };
                    
                    const final = {
                        x: scaled.x + centerX,
                        y: scaled.y + centerY + params.coordSys.width / 2
                    };
                    const overlap = 0.5;

                    return {
                        type: 'rect',
                        shape: {
                            x: final.x - overlap/2,
                            y: final.y - overlap/2,
                            width: binSize * scale + overlap,
                            height: binSize * scale + overlap
                        },
                        style: {
                            fill: color,
                            stroke: 'transparent',
                            strokeWidth: 0,
                            lineWidth: 0,
                            borderWidth: 0
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
    }

    private async fetchData(payload: any) {
        const startFetch = performance.now();
        
        const straw = new HicStraw({ url: payload.url });
        const data = await straw.getContactRecords(
            payload.normalization,
            { chr: payload.chrom.replace(/chr/g, ''), start: payload.bufferedStart, end: payload.bufferedEnd },
            { chr: payload.chrom.replace(/chr/g, ''), start: payload.bufferedStart, end: payload.bufferedEnd },
            'BP',
            payload.resolution
        );
        
        const endFetch = performance.now();
        const fetchTime = endFetch - startFetch;
        
        return { data, fetchTime };
    }

    private renderData(dataset: any[], payload: any) {
        const startRender = performance.now();
        
        const option = this.createEchartsOption(dataset, payload);
        this.instance?.setOption(option, true);
        
        const endRender = performance.now();
        const renderTime = endRender - startRender;
        
        return renderTime;
    }

    public async fetchAndRenderData(payload: any) {
        const { data } = await this.fetchData(payload);
        this.renderData(data, payload);
        postMessage({message: 'renderer ====================================='});
    }

    public handleDataZoom(args: { startValue: number; endValue: number; resolution: number }) {
        const bin1 = positionToBin(args.startValue, args.resolution);
        const bin2 = positionToBin(args.endValue, args.resolution);
        this.instance?.dispatchAction({
            type: 'dataZoom',
            zoomLock: true,
            startValue: bin1,
            endValue: bin2
        });
    }

    // 添加截图功能
    public takeScreenshot(params: { trackId: number, width: number, height: number }) {
        if (!this.instance) {
            return;
        }

        try {
            // 直接通过getData方式获取渲染结果
            const option = this.instance.getOption();
            const dataURL = this.instance.getDataURL({
                type: 'png',
                pixelRatio: window.devicePixelRatio || 1,
                backgroundColor: '#fff'
            });
            
            // 直接发送dataURL回主线程
            postMessage({
                type: 'screenshotReady',
                data: {
                    dataURL,
                    width: params.width,
                    height: params.height,
                    trackId: params.trackId
                }
            });
        } catch (error) {
            console.error('Error taking screenshot:', error);
            
            // 失败时尝试备用方法
            try {
                // 获取当前canvas
                const canvas = this.instance.getDom() as unknown as OffscreenCanvas;
                
                // 创建一个位图
                const bitmap = canvas.transferToImageBitmap();
                
                // 发送位图回主线程
                postMessage({
                    type: 'screenshotReady',
                    data: {
                        bitmap,
                        width: params.width,
                        height: params.height,
                        trackId: params.trackId,
                        useBitmap: true
                    }
                }, [bitmap]);
            } catch (fallbackError) {
                console.error('Fallback screenshot method failed:', fallbackError);
                
                // 通知主线程截图失败
                postMessage({
                    type: 'screenshotReady',
                    data: {
                        error: true,
                        message: 'Screenshot failed'
                    }
                });
            }
        }
    }
}

// 创建worker实例
const worker = new HiCWorker();

// 消息处理
self.onmessage = async ({ data }: MessageEvent<Message>) => {
    switch (data.type) {
        case 'init':
            return worker.initialize(data.canvas, data.theme, data.option);
        case 'resize':
            return worker.resize(...data.args);
        case 'render':
            return worker.render(
                ...(parse(data.args as unknown as string) as Parameters<typeof worker.render>)
            );
        case 'event':
            return worker.handleEvent(data.event);
        case 'dispose':
            return worker.dispose();
        case 'addEventListener':
            return worker.addEventListener(data.event);
        case 'removeEventListener':
            return worker.removeEventListener(data.event);
        case 'showLoading':
            return worker.getInstance()?.showLoading(...data.args);
        case 'hideLoading':
            return worker.getInstance()?.hideLoading(...data.args);
        case 'fetchAndRenderData':
            return await worker.fetchAndRenderData(data.args);
        case 'dataZoom':
            return worker.handleDataZoom(data.args);
        case 'dispatchAction':
            if (data.args && data.args.type === 'screenshot') {
                return worker.takeScreenshot(data.args.params);
            }
            return worker.getInstance()?.dispatchAction(data.args);
    }
};