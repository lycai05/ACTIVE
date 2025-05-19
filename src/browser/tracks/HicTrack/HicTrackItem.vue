<template>
	<div class="relative w-full flex">
		<div
			class="w-[30px] flex-shrink-0 border-r border-black pt-2 before:content-[''] before:absolute before:right-0 before:top-0 before:w-[6px] before:h-[1px] before:bg-black after:content-[''] after:absolute after:right-0 after:bottom-0 after:w-[8px] after:h-[1px] after:bg-black relative"
		>
			<n-space vertical :size="12" align="center" class="pr-2">
				<n-tooltip trigger="hover">
					<template #trigger>
						<n-space vertical :size="4" align="center">
							<n-tag size="small">
								<n-text depth="3">R</n-text>
							</n-tag>
						</n-space>
					</template>
					Resolution: {{ formatResolution(currentBpResolution) }}
				</n-tooltip>
				<n-tooltip trigger="hover">
					<template #trigger>
						<n-space vertical :size="4" align="center">
							<n-tag size="small">N</n-tag>
						</n-space>
					</template>
					Normalization: {{ selectedNormalization }}
				</n-tooltip>
			</n-space>
		</div>
		<div class="flex-1 ml-[10px]">
			<div ref="canvasContainer" class="basic-canvas aspect-ratio relative overflow-hidden" :style="props.style">
				<div v-if="isVisible">
					<n-spin v-show="showSpin" class="absolute left-1/2 top-1/2 z-10"></n-spin>
				</div>
				<div v-else>
					<n-alert title="" type="warning">No data in this region.</n-alert>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, defineProps, onBeforeMount, onBeforeUnmount } from 'vue'
import HicStraw from 'hic-straw/dist/hic-straw.min.js'
import { useElementSize } from '@vueuse/core'
import * as d3 from 'd3'
import { createHiCStrawService } from './HiCStrawService'
import { useMouseInElement } from '@vueuse/core'
import { init } from '../../utils/echartsWorker'
import { useScreenshotStore } from '@/browser/store'

// ColorScale class - unused
/*
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

  setThreshold(threshold) {
    this.threshold = threshold;
    this.cache = [];
    this.binsize = this.threshold / this.nbins;
  }

  getColor(value) {
    const low = 0;
    const bin = Math.floor(Math.min(this.threshold, value) / this.binsize);
    if (this.cache[bin] === undefined) {
      const alpha = Math.floor(255 * (clamp(value, low, this.threshold) - low) / (this.threshold - low));
      this.cache[bin] = {
        red: this.r,
        green: this.g,
        blue: this.b,
        alpha,
        rgbaString: `rgba(${this.r},${this.g},${this.b},${alpha / 255})`
      };
    }
    return this.cache[bin];
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
*/

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
	dataLoaded: {
		type: Boolean,
		required: false
	},
	trackViewIndex: {
		default: 0
	}
})

const chrom = computed(() => props.location.chrom)
const start = computed(() => props.location.start)
const end = computed(() => props.location.end)

const corenavStore = ref({
	asm: 'hg38',
	chrom: props.location.chrom,
	start: props.location.start,
	end: props.location.end,
	max: 0,
	min: 0,
	size: 0
})

const currentBpResolution = ref(5000)
const isVisible = ref(true)
const showSpin = ref(false)
const type = ref('triangle')
const echartsInstance = ref(null)

const canvasContainer = ref(null)
const { width, height } = useElementSize(canvasContainer)
const hicService = createHiCStrawService(props.option.url)

const resolutionMode = computed(() => props.option.series[0].resolution.mode)
const selectedResolution = computed(() => props.option.series[0].resolution.selectedResolution)
const availableResolutions = computed({
	get() {
		return props.option.series[0].resolution.availableResolutions || []
	},
	set(value) {
		if (props.option && props.option.series && props.option.series[0] && props.option.series[0].resolution) {
			props.option.series[0].resolution.availableResolutions = [...value]
		}
	}
})

const selectedNormalization = computed(() => props.option.series[0].normalization.selectedNormalization)
const normalizationMethods = computed({
	get() {
		return props.option.series[0].normalization.normalizationMethods || []
	},
	set(value) {
		if (props.option && props.option.series && props.option.series[0] && props.option.series[0].normalization) {
			props.option.series[0].normalization.normalizationMethods = [...value]
		}
	}
})

const { elementX, elementY } = useMouseInElement(canvasContainer)
const option = computed(() => props.option)

// 计算缓冲区大小
function calculateBufferSize(start: number, end: number): number {
	const viewportSize = end - start
	return Math.round(viewportSize * 1) // 设置缓冲区为可视区域的50%
}

// 计算带缓冲区的范围
let bufferSize: number
let bufferedStart: number
let bufferedEnd: number
let instance: {
	fetchAndRenderData: (data: any) => void
	on: (event: string, callback: (event: any) => void) => void
}
let canvas: HTMLCanvasElement
let newLeft = 0

function makeSerializable(obj: Record<string, any>) {
	return JSON.parse(JSON.stringify(obj))
}

const formatResolution = (resolution: number) => {
	if (resolution >= 1000000) {
		return `${resolution / 1000000}Mb`
	} else if (resolution >= 1000) {
		return `${resolution / 1000}kb`
	}
	return `${resolution}bp`
}

const updateResolution = () => {
	if (resolutionMode.value === 'auto') {
		currentBpResolution.value = hicService.calculateOptimalResolution({
			start: start.value,
			end: end.value,
			windowWidth: width.value,
			availableResolutions: availableResolutions.value
		})
		selectedResolution.value = currentBpResolution.value
	} else {
		currentBpResolution.value = selectedResolution.value
	}
}

const initializeData = async () => {
	try {
		const [resolutions, normMethods] = await Promise.all([
			hicService.fetchResolutions(),
			hicService.fetchNormalizationMethods()
		])

		availableResolutions.value = resolutions
		normalizationMethods.value = normMethods
		selectedNormalization.value = normalizationMethods.value[0]
		updateResolution()
	} catch (error) {
		console.error('Initialization error:', error)
	}
}

const loading = ref(false)
const matrixData = ref(null)

// Unused worker code
/*
// const worker = new MyWorker()
// let worker = new Worker(new URL('./HiCWorker_echarts.js', import.meta.url), { type: 'module' });
*/

const mouseClickPos = ref({
	mousePosition: [0, 0],
	Position1: 0,
	Position2: 0,
	counts: 0
})

function binToPosition(binIndex, resolution) {
	const start = binIndex * resolution
	const end = start + resolution
	return { start, end }
}

const initializeChart = async (needNewData = true) => {
	loading.value = true

	bufferSize = calculateBufferSize(start.value, end.value)
	bufferedStart = Math.max(1, start.value - bufferSize)
	bufferedEnd = end.value + bufferSize

	canvas = d3
		.select(canvasContainer.value)
		.append('canvas')
		.attr('width', width.value * 3)
		.attr('height', width.value * 3)
		.style('width', width.value * 3 + 'px')
		.style('height', width.value * 3 + 'px')
		.style('position', 'absolute')
		.style('left', '-' + width.value + 'px')
		.style(option.value.yAxis.flip ? 'top' : 'bottom', '0px')
		.node() as HTMLCanvasElement

	instance = init(canvas)

	instance.fetchAndRenderData(
		makeSerializable({
			normalization: selectedNormalization.value,
			chrom: chrom.value,
			start: start.value,
			end: end.value,
			bufferedStart: bufferedStart,
			bufferedEnd: bufferedEnd,
			resolution: currentBpResolution.value,
			url: props.option.url,
			canvasWidth: width.value,
			canvasHeight: height.value,
			itemStyle: props.option.series[0].itemStyle,
			flip: option.value.yAxis.flip
		})
	)

	instance.on('click', event => {
		console.log(event)
		// mouseClickPos.value.x  = event.x
		// mouseClickPos.value.y = event.y
		mouseClickPos.value.mousePosition = [elementX.value, elementY.value]
		mouseClickPos.value.Position1 = binToPosition(event.data[0], currentBpResolution.value)
		mouseClickPos.value.Position2 = binToPosition(event.data[1], currentBpResolution.value)
		mouseClickPos.value.counts = event.data[2]
	})

	loading.value = false
}

const accumulatedOffset = ref(0)

// Add after other refs
const screenshotStore = useScreenshotStore()

watch(
	() => screenshotStore.timestamp,
	() => {
		if (!canvas || !canvasContainer.value) return

		console.log('Capturing screenshot from canvas')
		try {
			// Create a new canvas for the screenshot
			const screenshotCanvas = document.createElement('canvas')
			screenshotCanvas.width = width.value
			screenshotCanvas.height = height.value

			// Get the context and draw the original canvas
			const ctx = screenshotCanvas.getContext('2d')
			if (ctx) {
				const currentLeft = d3.select(canvas).style('left')
				const currentLeftValue = currentLeft.replace('px', '') // 结果: "2245"

				console.log(canvas.getBoundingClientRect(), width.value, height.value)
				// Draw the original canvas content
				ctx.drawImage(
					canvas,
					-currentLeftValue,
					width.value * 2 - 30 - (height.value - 1000),
					width.value,
					height.value,
					0,
					0,
					width.value,
					height.value
				)

				// Create a container div to control the viewport
				const containerDiv = document.createElement('div')
				containerDiv.style.width = width.value - 30 + 'px'
				containerDiv.style.height = height.value + 'px'
				containerDiv.style.overflow = 'hidden'
				containerDiv.style.position = 'relative'
				containerDiv.style.marginLeft = '30px'

				// Position the canvas inside the container
				screenshotCanvas.style.position = 'absolute'
				// Use the current position of the original canvas

				//screenshotCanvas.style.left = currentLeft;
				screenshotCanvas.style[option.value.yAxis.flip ? 'top' : 'bottom'] = '0px'
				//screenshotCanvas.style[option.value.yAxis.flip ? 'bottom' : 'top'] = 'auto';

				// Add the canvas to the container
				containerDiv.appendChild(screenshotCanvas)

				// Add to the document
				const screenshotDiv = document.getElementById('screenshot-container')
				if (screenshotDiv) {
					screenshotDiv.appendChild(containerDiv)
					console.log('Screenshot added to container')
				} else {
					// Create the container if it doesn't exist
					const newContainer = document.createElement('div')
					newContainer.id = 'screenshot-container'
					document.body.appendChild(newContainer)
					newContainer.appendChild(containerDiv)
					console.log('Created new container for screenshot')
				}
			}
		} catch (e) {
			console.error('Screenshot capture failed:', e)
		}
	}
)

// Add message event listener for screenshot responses
onMounted(() => {
	showSpin.value = true
	initializeData()
		.then(() => {
			return initializeChart()
		})
		.then(() => {
			showSpin.value = false
		})

	// Watch for data changes
	watch([chrom, start, end], async (newValues, oldValues) => {
		const [newChrom, newStart, newEnd] = newValues
		const [oldChrom, oldStart, oldEnd] = oldValues
		showSpin.value = true

		if (
			newChrom === oldChrom &&
			newStart > bufferedStart &&
			newEnd < bufferedEnd &&
			newEnd - newStart == oldEnd - oldStart
		) {
			// 计算本次移动距离
			const moveDistance = newStart - oldStart
			const pixelMove = (moveDistance / (oldEnd - oldStart)) * width.value

			// 更新累积偏移量
			accumulatedOffset.value -= pixelMove

			// 设置新位置
			newLeft = -width.value + accumulatedOffset.value

			d3.select(canvas).style('left', newLeft + 'px')
		} else {
			updateResolution()
			bufferSize = calculateBufferSize(newStart, newEnd)
			bufferedStart = Math.max(1, newStart - bufferSize)
			bufferedEnd = newEnd + bufferSize
			instance.fetchAndRenderData(
				makeSerializable({
					normalization: selectedNormalization.value,
					chrom: newChrom,
					start: newStart,
					end: newEnd,
					bufferedStart: bufferedStart,
					bufferedEnd: bufferedEnd,
					resolution: currentBpResolution.value,
					url: props.option.url,
					canvasWidth: width.value,
					canvasHeight: height.value,
					itemStyle: props.option.series[0].itemStyle,
					flip: option.value.yAxis.flip
				})
			)
			accumulatedOffset.value = 0
			d3.select(canvas).style('left', '-' + width.value + 'px')
		}

		showSpin.value = false
	})

	// Watch for visualization parameter changes
	watch(
		[
			() => width.value,
			() => option.value,
			() => resolutionMode.value,
			() => selectedResolution.value,
			() => selectedNormalization.value
		],
		async () => {
			showSpin.value = true
			bufferSize = calculateBufferSize(start.value, end.value)
			bufferedStart = Math.max(1, start.value - bufferSize)
			bufferedEnd = end.value + bufferSize

			// Update canvas position when flip changes
			if (canvas) {
				d3.select(canvas)
					.style(option.value.yAxis.flip ? 'top' : 'bottom', '0px')
					.style(option.value.yAxis.flip ? 'bottom' : 'top', 'auto') // Clear the opposite property
			}

			instance.fetchAndRenderData(
				makeSerializable({
					normalization: selectedNormalization.value,
					chrom: chrom.value,
					start: start.value,
					end: end.value,
					bufferedStart: bufferedStart,
					bufferedEnd: bufferedEnd,
					resolution: currentBpResolution.value,
					url: props.option.url,
					canvasWidth: width.value,
					canvasHeight: height.value,
					itemStyle: props.option.series[0].itemStyle,
					flip: option.value.yAxis.flip
				})
			)
			showSpin.value = false
		},
		{ deep: true }
	)

	//   window.addEventListener('resize', () => echartsInstance?.resize());
})

onBeforeUnmount(() => {
	// worker.terminate()
})
</script>

<style scoped></style>
