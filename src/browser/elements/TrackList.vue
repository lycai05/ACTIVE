<template>
	<div ref="trackList" v-if="isLoaded" :id="props.sessionId" class="track-list bg-white flex flex-col p-2 w-full">
		<!-- 根据reverseLayout调整布局顺序 -->
		<template v-if="!props.reverseLayout">
			<div
				class="track-item relative track-item-sortable flex flex-col mb-1"
				ref="trackItem"
				:id="`${props.trackId}`"
			>
				<div class="flex">
					<div
						ref="cvs_holder"
						class="relative track-content flex-auto mr-2"
						style="min-height: 10px; min-width: 0; overflow: hidden"
					>
						<nav-bar-track
							:chromNames="navigationStore.chromNames"
							:chromSizes="navigationStore.chromSizes"
							@shift="handleShift"
							@zoomIn="zoomIn"
							@zoomOut="zoomOut"
							@zoomTo="handleZoomTo"
							v-model:showTrackLabel="isShowTrackLabel"
							v-model:showVerticalLine="isShowVerticalLine"
							:trackViews="navigationStore.trackViews"
							:sessionId="sessionId"
						></nav-bar-track>
					</div>
					<div
						class="track-item-config-holder track-item-drag-handler cursor-pointer bg-white rounded-r-lg relative w-6 flex-none flex flex-col justify-between items-center pt-1 pb-1"
					></div>
				</div>
			</div>

			<div id="screenshot-holder" ref="screenshotHolder">
				<div ref="trackholderRef" class="track-holder" style="position: relative">
					<template v-for="(trackComponent, index) in trackComponents">
						<track-item :trackId="trackComponent.key" :sessionId="$props.sessionId">
							<template #trackTitle>
								<p v-show="isShowTrackLabel" class="text-sm absolute top-0 right-1 z-20">
									{{ trackComponent.trackConfig.name }}
								</p>
							</template>
							<template #canvas>
								<DynamicComponent
									:componentKey="trackComponent.trackConfig.chartKey"
									:props="{
										config: trackComponent,
										chromBands: navigationStore.chromBands,
										chromSizes: navigationStore.chromSizes,
										dataLoaded: isLoaded,
										trackViews: navigationStore.trackViews,
										sessionId: sessionId,
										trackId: trackComponent.key,
										style: useHeightStyle(trackComponent.attr)
									}"
									@zoom-to="handleZoomTo"
								></DynamicComponent>
							</template>
							<template #controller>
								<component
									:is="trackComponent.trackConfig.controllerKey"
									v-if="trackComponent.trackConfig.controllerKey"
									:key="index"
									:controllerConfig="trackComponent.controllerConfig"
									:location="navigationStore"
								></component>
							</template>
						</track-item>
					</template>

					<canvas
						v-show="isShowVerticalLine"
						ref="verticalLine"
						class="z-30"
						@mousedown="handleDragStart"
						@mousemove="handleDragMove"
						@mouseup="handleDragEnd"
						@click="handleVerticalLineClick"
					></canvas>
				</div>
			</div>
		</template>

		<template v-else>
			<div id="screenshot-holder" ref="screenshotHolder">
				<div ref="trackholderRef" class="track-holder" style="position: relative">
					<template v-for="(trackComponent, index) in trackComponents">
						<track-item :trackId="trackComponent.key" :sessionId="$props.sessionId">
							<template #trackTitle>
								<p v-show="isShowTrackLabel" class="text-sm absolute top-0 right-1 z-20">
									{{ trackComponent.trackConfig.name }}
								</p>
							</template>
							<template #canvas>
								<DynamicComponent
									:componentKey="trackComponent.trackConfig.chartKey"
									:props="{
										config: trackComponent,
										chromBands: navigationStore.chromBands,
										chromSizes: navigationStore.chromSizes,
										dataLoaded: isLoaded,
										trackViews: navigationStore.trackViews,
										sessionId: sessionId,
										trackId: trackComponent.key,
										style: useHeightStyle(trackComponent.attr)
									}"
									@zoom-to="handleZoomTo"
								></DynamicComponent>
							</template>
							<template #controller>
								<component
									:is="trackComponent.trackConfig.controllerKey"
									v-if="trackComponent.trackConfig.controllerKey"
									:key="index"
									:controllerConfig="trackComponent.controllerConfig"
									:location="navigationStore"
								></component>
							</template>
						</track-item>
					</template>

					<canvas
						v-show="isShowVerticalLine"
						ref="verticalLine"
						class="z-30"
						@mousedown="handleDragStart"
						@mousemove="handleDragMove"
						@mouseup="handleDragEnd"
						@click="handleVerticalLineClick"
					></canvas>
				</div>
			</div>

			<div
				class="track-item relative track-item-sortable flex flex-col mb-1"
				ref="trackItem"
				:id="`${props.trackId}`"
			>
				<div class="flex">
					<div
						ref="cvs_holder"
						class="relative track-content flex-auto mr-2"
						style="min-height: 10px; min-width: 0; overflow: hidden"
					>
						<nav-bar-track
							:chromNames="navigationStore.chromNames"
							:chromSizes="navigationStore.chromSizes"
							@shift="handleShift"
							@zoomIn="zoomIn"
							@zoomOut="zoomOut"
							@zoomTo="handleZoomTo"
							v-model:showTrackLabel="isShowTrackLabel"
							v-model:showVerticalLine="isShowVerticalLine"
							:trackViews="navigationStore.trackViews"
							:sessionId="sessionId"
						></nav-bar-track>
					</div>
					<div
						class="track-item-config-holder track-item-drag-handler cursor-pointer bg-white rounded-r-lg relative w-6 flex-none flex flex-col justify-between items-center pt-1 pb-1"
					></div>
				</div>
			</div>
		</template>

		<!-- Context Menu -->
		<div
			v-if="showMenu"
			class="fixed bg-white border rounded shadow-lg z-50 py-1"
			:style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
		>
			<div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleMenuSelect('showSynteny')">
				Selected Region: {{ selectedRegion.chrom }} : {{ selectedRegion.start }} - {{ selectedRegion.end }}
			</div>
			<div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleMenuSelect('annotation')">
				Annotate the above region
			</div>
			<div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleMenuSelect('cancel')">Cancel</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick, computed, getCurrentInstance, defineAsyncComponent } from 'vue'
import NavBarTrack from '../tracks/NavBarTrack/NavBarTrack.vue'
import ChromViewH from '../tracks/ChromViewH.vue'
import DynamicComponent from './DynamicComponent.vue'
import TrackItem from '@/browser/elements/TrackItem.vue'
import { useHeightStyle } from '@/browser/hooks/useStyle'
import Sortable from 'sortablejs'
import { useTrackStore } from '@/browser/store'
import { useSessionStore } from '@/browser/store'
import { useElementSize } from '@vueuse/core'
import * as d3 from 'd3'
import { useModalStore } from '@/stores/modalStore'
import html2canvas from 'html2canvas'
import { useNavigationStore } from '@/browser/store'
import { jsPDF } from 'jspdf'
import { withThrottle } from '../utils/utils.js'
import { useMessage } from 'naive-ui'

// Store initialization
const modalStore = useModalStore()
const trackStore = useTrackStore()
const sessionStore = useSessionStore()
const message = useMessage()

// Emits
const emit = defineEmits(['update:location'])

// Props
const props = defineProps({
	assembly: { type: Object, required: true },
	sessionId: { type: String, required: true },
	tracks: { type: Array, required: true },
	session: { type: Object, required: true },
	config: {
		type: Object,
		required: false,
		default: () => ({ style: 'full' })
	},
	highlightRegion: {
		type: Object,
		required: false,
		default: () => null
	},
	reverseLayout: {
		type: Boolean,
		default: false
	}
})
const navigationStore = useNavigationStore(props.sessionId)

// State
const isShowTrackLabel = ref(true)
const isShowVerticalLine = ref(false)
const isLoaded = ref(false)
const trackList = ref(null)
const trackholderRef = ref(null)
const screenshotHolder = ref(null)
const verticalLine = ref(null)
const highlightCanvas = ref(null)
const trackComponents = ref([])
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const clickPosition = ref(null)

// Drag state
const isDragging = ref(false)
const dragStart = ref({ x: 0, genomicPos: 0 })
const dragEnd = ref({ x: 0, genomicPos: 0 })
const selectedRegion = ref(null)

// Constants and computed
const minRegionSize = 1
// let chromSizes = props.assembly.chromSizes;
// let chromBands = props.assembly.chromBands || null;
// let chromNames = [];
const { width } = useElementSize(trackholderRef)
const { height } = useElementSize(screenshotHolder)
const trackholderSize = useElementSize(trackholderRef)
const screenshotHolderSize = useElementSize(screenshotHolder)

const sessionTracks = computed(() => {
	return sessionStore.getSessionTracks(props.session)
})

// Minimum width in base pairs
const MIN_TRACK_WIDTH_BP = 200

// Methods
// const setupChromSizesAndBands = async () => {
//   for (let chromName in chromSizes) {
//     chromNames.push(chromName);
//   }

//   chromNames.sort((p, q) => {
//     var a = 0, b = 0, x = 0;
//     if (p.substr(0, 3) == 'chr') {
//       x = 3;
//     } else if (p.substr(0, 9) == 'scaffold_') {
//       x = 9;
//     }

//     a = parseInt(p.substr(x));
//     b = parseInt(q.substr(x));
//     var c = a - b;

//     if (!isNaN(c)) return c;
//     if (isNaN(a) && isNaN(b)) return p < q ? -1 : 1;
//     if (isNaN(a)) return 1;
//     if (isNaN(b)) return -1;
//   });

//   navigationStore.initialize(props.assembly);
//   isLoaded.value = true;
// };
const setupChromosizesAndBands = async () => {
	navigationStore.initialize(props.assembly)
	isLoaded.value = true
}

/**
 * @desc 函数节流
 * @param func 回调函数
 * @param limit 时间限制
 */
function throttle(func, limit) {
	//上次执行时间
	let previous = 0
	return function () {
		//当前时间
		let now = Date.now()

		let context = this
		let args = arguments

		// 若当前时间-上次执行时间大于时间限制
		if (now - previous > limit) {
			func.apply(context, args)
			previous = now
		}
	}
}

// Method to check if any track would become too small after zooming
const checkTrackWidths = (targetStart: number, targetEnd: number) => {
	if (!trackholderRef.value) return true

	const trackholderWidth = trackholderRef.value.offsetWidth - 32 // Accounting for padding
	if (!trackholderWidth) return true

	// Get all track views and the proposed change for the active track
	const trackViews = [...navigationStore.trackViews]
	const activeIndex = navigationStore.activeTrackViewIndex

	// Create a copy of trackViews with the proposed change
	if (activeIndex >= 0 && activeIndex < trackViews.length) {
		// Apply the proposed change to a copy
		const modifiedViews = [...trackViews]
		modifiedViews[activeIndex] = {
			...modifiedViews[activeIndex],
			start: targetStart,
			end: targetEnd
		}

		// Calculate total genomic length
		const totalLength = modifiedViews.reduce((acc, view) => acc + (view.end - view.start), 0)

		// Check each track's width
		for (let i = 0; i < modifiedViews.length; i++) {
			const view = modifiedViews[i]
			// Calculate width ratio for this view
			const widthRatio = (view.end - view.start) / totalLength
			// Calculate actual pixel width
			const trackWidth = trackholderWidth * widthRatio

			console.log(`Track ${i}: genomic size=${view.end - view.start}, ratio=${widthRatio}, width=${trackWidth}px`)

			// If any track is too small, prevent zooming
			if (trackWidth < MIN_TRACK_WIDTH_BP) {
				message.warning('Cannot zoom in further: some tracks width are too small')
				return false
			}
		}
	}

	return true
}

// Navigation methods with width checks
const handleZoomTo = (chrom: string, start: number, end: number, activeTrackViewIndex: number | null) => {
	// Check if zooming would make any track too small
	if (!checkTrackWidths(start, end)) {
		return
	}

	navigationStore.zoomTo(
		{ chrom, start, end },
		activeTrackViewIndex !== null ? activeTrackViewIndex : undefined,
		minRegionSize
	)
}

const zoomIn = (activeTrackViewIndex: number | null) => {
	const idx = activeTrackViewIndex !== null ? activeTrackViewIndex : navigationStore.activeTrackViewIndex
	if (idx < 0 || idx >= navigationStore.trackViews.length) return

	const track = navigationStore.trackViews[idx]
	const s = track.start
	const e = track.end
	const m = (s + e) / 2
	const x = (e - s + 1) / 4
	const targetStart = Math.round(m - x)
	const targetEnd = Math.round(m + x) - 1

	// Check if zooming would make any track too small
	if (!checkTrackWidths(targetStart, targetEnd)) {
		return
	}

	navigationStore.zoomIn(activeTrackViewIndex !== null ? activeTrackViewIndex : undefined, minRegionSize)
}

const zoomOut = (activeTrackViewIndex: number | null) => {
	const idx = activeTrackViewIndex !== null ? activeTrackViewIndex : navigationStore.activeTrackViewIndex
	if (idx < 0 || idx >= navigationStore.trackViews.length) return

	const track = navigationStore.trackViews[idx]
	const s = track.start
	const e = track.end
	const m = (s + e) / 2
	const x = Math.max(1, e - s)
	const targetStart = Math.round(m - x)
	const targetEnd = Math.round(m + x) + 1

	navigationStore.zoomOut(activeTrackViewIndex !== null ? activeTrackViewIndex : undefined, minRegionSize)
}

const handleShift = (ev: any, direction: number, activeTrackViewIndex: number | null) => {
	const idx = activeTrackViewIndex !== null ? activeTrackViewIndex : navigationStore.activeTrackViewIndex
	if (idx < 0 || idx >= navigationStore.trackViews.length) return

	const track = navigationStore.trackViews[idx]
	const span = track.end - track.start + 1
	let delta = ev.ctrlKey ? (ev.shiftKey ? 0.95 : 0.475) : 0.1
	delta *= direction * span
	const targetStart = track.start + delta
	const targetEnd = track.end + delta

	// Check if shifting would make any track too small
	if (!checkTrackWidths(targetStart, targetEnd)) {
		return
	}

	navigationStore.handleShift(
		ev,
		direction,
		activeTrackViewIndex !== null ? activeTrackViewIndex : undefined,
		minRegionSize
	)
}

// Canvas and interaction methods
const calculateGenomicPosition = (clientX: number) => {
	const canvas = verticalLine.value
	const rect = canvas.getBoundingClientRect()
	const x = clientX - rect.left
	const canvasWidth = width.value - 32
	const regionSize = navigationStore.end - navigationStore.start
	const basePerPixel = regionSize / canvasWidth
	const position = Math.round(navigationStore.start + x * basePerPixel)

	return {
		chrom: navigationStore.chrom,
		position: position,
		x: x
	}
}

const handleDragStart = (event: MouseEvent) => {
	isDragging.value = true
	const pos = calculateGenomicPosition(event.clientX)
	dragStart.value = {
		x: pos.x,
		genomicPos: pos.position
	}
	event.preventDefault()
}

const handleDragMove = (event: MouseEvent) => {
	if (!isDragging.value) return

	const pos = calculateGenomicPosition(event.clientX)
	dragEnd.value = {
		x: pos.x,
		genomicPos: pos.position
	}

	const ctx = verticalLine.value.getContext('2d')
	ctx.clearRect(0, 0, verticalLine.value.width, verticalLine.value.height)

	const startX = Math.min(dragStart.value.x, dragEnd.value.x)
	const width = Math.abs(dragEnd.value.x - dragStart.value.x)

	ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
	ctx.fillRect(startX, 0, width, verticalLine.value.height)

	ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'
	ctx.strokeRect(startX, 0, width, verticalLine.value.height)
}

const handleDragEnd = (event: MouseEvent) => {
	if (!isDragging.value) return

	isDragging.value = false
	const pos = calculateGenomicPosition(event.clientX)
	dragEnd.value = {
		x: pos.x,
		genomicPos: pos.position
	}

	selectedRegion.value = {
		chrom: navigationStore.chrom,
		start: Math.min(dragStart.value.genomicPos, dragEnd.value.genomicPos),
		end: Math.max(dragStart.value.genomicPos, dragEnd.value.genomicPos)
	}

	menuPosition.value = {
		x: event.clientX,
		y: event.clientY
	}
	showMenu.value = true
}

const handleVerticalLineClick = (event: MouseEvent) => {
	if (isDragging.value) return

	clickPosition.value = calculateGenomicPosition(event.clientX)
	menuPosition.value = {
		x: event.clientX,
		y: event.clientY
	}
	showMenu.value = true
	event.stopPropagation()
}

const handleMenuSelect = (action: string) => {
	if (action === 'showSynteny') {
		console.log('Selected region:', selectedRegion.value)
		alert(
			`Selected region:\nChrom: ${selectedRegion.value.chrom}\nStart: ${selectedRegion.value.start}\nEnd: ${selectedRegion.value.end}`
		)
	} else if (action === 'annotation') {
		modalStore.openModal({
			chrom: selectedRegion.value.chrom,
			start: String(selectedRegion.value.start),
			end: String(selectedRegion.value.end)
		})
	}
	showMenu.value = false

	const ctx = verticalLine.value.getContext('2d')
	ctx.clearRect(0, 0, verticalLine.value.width, verticalLine.value.height)
}

// Highlight region
const drawHighlight = () => {
	const canvas = highlightCanvas.value
	if (!canvas || !trackholderSize.width.value || !screenshotHolderSize.height.value) return

	const ctx = canvas.getContext('2d')
	canvas.width = trackholderSize.width.value - 32
	canvas.height = screenshotHolderSize.height.value
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (props.highlightRegion?.chrom === navigationStore.chrom) {
		const regionSize = navigationStore.end - navigationStore.start
		const basePerPixel = regionSize / canvas.width
		const startX = (props.highlightRegion.start - navigationStore.start) / basePerPixel
		const endX = (props.highlightRegion.end - navigationStore.start) / basePerPixel

		ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'
		ctx.fillRect(startX, 0, endX - startX, canvas.height)

		ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)'
		ctx.lineWidth = 2
		ctx.strokeRect(startX, 0, endX - startX, canvas.height)
	}
}

// Watchers
watch(
	() => navigationStore.$state,
	newValue => {
		emit('update:location', newValue)
	},
	{ deep: true }
)

watch(
	sessionTracks,
	(newTracks, oldTracks) => {
		if (newTracks.length > oldTracks.length) {
			trackComponents.value = newTracks
		}
	},
	{ immediate: false }
)

watch(
	[
		() => navigationStore.$state,
		() => props.highlightRegion,
		() => trackholderSize.width.value,
		() => screenshotHolderSize.height.value
	],
	() => {
		if (trackholderSize.width.value && screenshotHolderSize.height.value) {
			drawHighlight()
		}
	},
	{ deep: true, immediate: true }
)

// Lifecycle hooks
onMounted(async () => {
	await setupChromosizesAndBands()
	trackComponents.value = sessionTracks.value

	nextTick(() => {
		if (trackholderSize.width.value && screenshotHolderSize.height.value) {
			drawHighlight()
		}
	})

	// Initialize sortable
	Sortable.create(trackholderRef.value, {
		handle: '.track-item-drag-handler',
		draggable: '.track-item-sortable',
		group: { name: 'trackList' },
		animation: 150,
		ghostClass: 'ghost',
		dragClass: 'drag',
		onUpdate: function (evt: any) {
			console.log(evt.item)
		},
		onSort: function (evt: any) {
			console.log(evt.item)
		},
		onEnd: function (evt: any) {
			console.log(evt.item)
		}
	})

	// Setup keyboard navigation
	document.addEventListener('keydown', ev => {
		if (ev.key === 'ArrowLeft' || ev.key === 'Left') {
			handleShift(ev, -1, null)
		} else if (ev.key === 'ArrowRight' || ev.key === 'Right') {
			handleShift(ev, 1, null)
		}
	})
})
</script>

<style scoped>
.ghost {
	opacity: 0.5;
	border: 2px dashed #cccccc;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	transition: transform 0.2s ease;
}

.drag {
	opacity: 0.7;
	border-color: #666666;
	background-color: #f4f4f4;
	transform: scale(1.05);
	z-index: 1000;
}

.track-holder {
	user-select: none;
}
</style>
