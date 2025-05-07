// echartsWorkerBase.ts
import type { ECharts, EChartsOption, init, zrender } from 'echarts'
import { parse } from 'telejson'
import * as echarts from 'echarts'
self.window = self.global = self as any;

export type InitOption = Parameters<typeof init>[2]
export type EventType = Parameters<zrender.ZRenderType['handler']['dispatch']>[0]

export type Message =
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
          args: Array<any>
      }
    | {
          type: 'dataZoom'
          args: {
              startValue: number
              endValue: number
          }
      }
    | {
          type: 'dispatchAction'
          args: any
      }

export class EChartsWorkerBase {
    protected instance: ECharts | null = null;

    /**
     * Resize the chart with the given width and height.
     */
    protected resize(...args: Parameters<ECharts['resize']>) {
        this.instance?.resize(...args)
    }

    /**
     * Render the chart with the given option.
     */
    protected render(...args: Parameters<ECharts['setOption']>) {
        this.instance?.setOption(...args)
    }

    /**
     * Dispose of the chart instance
     */
    protected dispose() {
        this.instance?.dispose()
        close()
    }

    /**
     * Initialize the chart instance.
     */
    protected initialize(
        canvas: OffscreenCanvas,
        theme: string | EChartsOption,
        option: InitOption = {}
    ) {
        this.instance?.dispose()

        const devicePixelRatio = option.devicePixelRatio ?? 1
        option.width ??= canvas.width / devicePixelRatio
        option.height ??= canvas.height / devicePixelRatio

        this.instance = echarts.init(
            canvas as unknown as HTMLDivElement,
            theme,
            option
        )

        postMessage({message: 'initialized ====================================='})
    }

    /**
     * Register events to the main thread.
     */
    protected addEventListener(type: string) {
        this.instance?.on(type, event => {
            const zrX = event?.event?.event.zrX;
            const zrY = event?.event?.event.zrY;
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
    protected removeEventListener(type: string) {
        this.instance?.off(type)
    }

    /**
     * Handle mouse events from the main thread.
     */
    protected handleEvent(event: MouseEvent) {
        const newEvent = Object.assign(new Event(event.type, event), {
            zrX: event.offsetX,
            zrY: event.offsetY
        })

        this.instance?.getZr().handler.dispatch(newEvent.type as EventType, newEvent)
    }

    /**
     * Get the chart instance
     */
    protected getInstance(): ECharts | null {
        return this.instance;
    }
}

/**
 * Utility function for position to bin conversion
 */
export function positionToBin(position: number, resolution: number): number {
    return Math.floor(position / resolution);
}

/**
 * Utility function for bin to position conversion
 */
export function binToPosition(binIndex: number, resolution: number) {
    const start = binIndex * resolution;
    const end = start + resolution;
    return {start, end};
}

/**
 * Color scale utility class
 */
export class ColorScale {
    private cache: string[] = [];
    private nbins = 2000;
    private binsize: number;

    constructor(private scale: {
        threshold: number;
        r: number;
        g: number;
        b: number;
    }) {
        this.binsize = this.scale.threshold / this.nbins;
    }

    getColor(value: number): string {
        const bin = Math.floor(Math.min(this.scale.threshold, value) / this.binsize);
        if (this.cache[bin] === undefined) {
            const alpha = Math.floor(255 * (Math.min(value, this.scale.threshold) / this.scale.threshold));
            this.cache[bin] = `rgba(${this.scale.r},${this.scale.g},${this.scale.b},${alpha / 255})`;
        }
        return this.cache[bin];
    }
}