<template>
	<div class="w-full h-full" id="track-setting-draw">
		<div class="">
			<TrackList
				:highlight-region="props.highlightRegion"
				:assembly="props.assembly"
				:session="newSession"
				:sessionId="id"
				:tracks="newSession.trackIds"
				:initial-location="props.location"
				@update:location="handleLocationUpdate"
				:reverseLayout="props.reverseLayout"
			></TrackList>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { createPinia } from "pinia"
import { onMounted, ref, watch, computed, h } from "vue"
import TrackList from "@/browser/elements/TrackList.vue"
import { useSessionStore } from "@/browser/store/SessionStore/SessionStore"
import { useTrackStore } from "@/browser/store/TrackStore/TrackStore"
import { colorNameToHex } from "../../utils/colorNameToHex"
import { NCard, useMessage, NSpin } from "naive-ui"

import "jquery/jquery.min.js"
import "jquery-ui-dist/jquery-ui.min.js"
import "../../static/js/jquery.flot.js"
import "../../static/js/jquery.flot.downsample.js"
import "../../static/js/jquery.flot.selection.js"
import "./plotCurve.js"

const emit = defineEmits(["update:tracksInfo", "update:location"])

const props = defineProps({
	id: {
		type: String,
		required: true
	},
	assembly: {
		type: Object,
		required: true
	},
	tracksInfo: {
		type: Array,
		required: true
	},
	highlightRegion: {
		type: Object,
		required: false,
		default: null
		// validator: (value) => {
		//   if (!value) return true
		//   return (
		//     typeof value === 'object' &&
		//     'chrom' in value &&
		//     'start' in value &&
		//     'end' in value &&
		//     typeof value.chrom === 'string' &&
		//     typeof value.start === 'number' &&
		//     typeof value.end === 'number'
		//   )
		// }
	},
	//   location: {
	//   type: Object,
	//   required: false,
	//   default: () => null
	// },
	reverseLayout: {
		type: Boolean,
		required: false,
		default: false
	}
})

// Stores
const trackStore = useTrackStore()

const message = useMessage()

function useTrackManager(sessionId) {
	const trackStore = useTrackStore()
	const sessionStore = useSessionStore()

	function sessionExists(sessions, key) {
		return sessions.find(session => session.key === key) !== undefined
	}

	// check if the session exists, if not, create a new one using the provided name
	let newSession = ref({})
	if (sessionExists(sessionStore.getSessionList, sessionId)) {
		sessionStore.targetedSession.length = 0
		sessionStore.targetedSession.push(sessionId)
		newSession.value = sessionStore.getTargtedSession[0]
	} else {
		newSession.value = {
			key: sessionId,
			trackIds: [],
			sessionConfig: {
				type: "TrackList",
				maxTrackNum: 30
			}
		}
		sessionStore.addSession(newSession.value)
	}

	// provided a list of track information
	let newSessionTracks = []
	const AddTracksToSession = (tracksInfo, existingTrackIds = []) => {
		if (!Array.isArray(tracksInfo)) return

		// Filter out tracks that already exist
		const newTracks = tracksInfo.filter(track => !existingTrackIds.includes(track.id))

		if (newTracks.length) {
			const addTrackPromises = newTracks.map(trackInfo => createTrack(trackInfo, sessionId))
			Promise.all(addTrackPromises)
				.then(newTracks => {
					newSessionTracks.push(...newTracks)

					for (let i = 0; i < newSessionTracks.length; i++) {
						trackStore.addTrackList(newSessionTracks[i], false, true)
						sessionStore.addSessionTrack(newSession.value.key, newSessionTracks[i].key)
					}

					sessionStore.targetedSession.length = 0
					sessionStore.targetedSession.push(newSession.value.key)
					newSessionTracks = []
				})
				.catch(error => {
					console.error("Error adding tracks:", error)
				})
		}
	}

	const configMap = {
		lineWidth: "series[0].lineStyle.width",
		areaOpacity: "series[0].areaStyle.opacity",
		lineColor: "series[0].lineStyle.color",
		areaColor: "series[0].areaStyle.color",
		style: "style",
		anchorColor: "series[0].itemStyle.color",
		showGeneLabel: "series[0].label.show",
		geneLabelFill: "series[0].label.color",
		exonPosStrandFill: "series[0].itemStyle.positiveStrandColor",
		exonNegStrandFill: "series[0].itemStyle.negativeStrandColor",
		display: "series[0].itemStyle.display",
		nodeColor: "series[0].nodeStyle.fill",
		nodeOpacity: "series[0].nodeStyle.opacity",
		edgeWidth: "series[0].edgeStyle.width",
		edgeColor: "series[0].edgeStyle.fill",
		maxCountColor: "series[0].itemStyle.maxCountColor",
		dotOpacity: "series[0].itemStyle.opacity",
		posColor: "series[0].itemStyle.posColor",
		negColor: "series[0].itemStyle.negColor",
		flip: "yAxis.flip",
		scale: "yAxis.scale",
		log: "yAxis.log",
		max: "yAxis.max",
		min: "yAxis.min",
		show: "yAxis.show",
		renderer: "renderer",
		sortBy: "sortY.sortBy",
		colorField: "sortY.colorField",
		sortOrder: "sortY.sortOrder"
	}

	function applyUserConfig(defaultConfig, userConfig, configMap) {
		const updatedConfig = { ...defaultConfig }

		Object.keys(userConfig).forEach(key => {
			const path = configMap[key]
			if (path) {
				const pathParts = path.split(".")
				let currentPart = updatedConfig
				while (pathParts.length > 1) {
					const part = pathParts.shift()
					const arrayMatch = part.match(/(.+)\[(\d+)\]/)
					if (arrayMatch) {
						currentPart = currentPart[arrayMatch[1]][parseInt(arrayMatch[2], 10)]
					} else {
						currentPart = currentPart[part]
					}
				}

				const finalPart = pathParts[0]
				const finalArrayMatch = finalPart.match(/(.+)\[(\d+)\]/)

				if (finalArrayMatch) {
					currentPart[finalArrayMatch[1]][parseInt(finalArrayMatch[2], 10)] = userConfig[key]
				} else {
					// console.log(finalPart, finalPart,key )
					currentPart[finalPart] = userConfig[key]
				}
			}
		})

		return updatedConfig
	}

	function removeObjectProperties(obj) {
		const { id, name, label, type, url, ...rest } = obj
		return rest
	}

	const createTrack = async trackInfo => {
		const newTrack = await createTrackComponent(trackInfo.type)

		const remainingOptions = removeObjectProperties(trackInfo)

		for (const key in remainingOptions) {
			if (/color|Color|fill|Fill/.test(key)) {
				const value = remainingOptions[key]
				if (typeof value === "string" && colorNameToHex(value)) {
					remainingOptions[key] = colorNameToHex(value)
				}
			}
		}

		newTrack.option = applyUserConfig(newTrack.option, remainingOptions, configMap)
		newTrack.key = String(trackInfo.id)
		newTrack.trackConfig.sessionId.push(sessionId)
		newTrack.option.style = trackInfo.style
		newTrack.trackConfig.name = trackInfo.name
		newTrack.trackConfig.label = trackInfo.label
		newTrack.option.url = trackInfo.url

		return newTrack
	}

	const modules = import.meta.glob("@/browser/tracks/*/config.ts", { eager: true })
	const modulePaths = Object.keys(modules)

	const createTrackComponent = async trackType => {
		try {
			const modulePath = modulePaths.find(path => path.includes(`${trackType}`))
			const moduleImportFunction = await modules[modulePath]
			return new moduleImportFunction.default()
		} catch (error) {
			console.error(`Error while creating component of type ${trackType}: `, error)
			return null
		}
	}

	return {
		createTrack,
		AddTracksToSession,
		newSession
	}
}

// Use the track manager
const { newSession, AddTracksToSession } = useTrackManager(props.id)

// Get current track IDs
const currentTrackIds = computed(() => newSession.value.trackIds || [])

// Watch tracksInfo for changes
watch(
	() => props.tracksInfo,
	(newTracks, oldTracks) => {
		if (!newTracks) return

		const existingIds = currentTrackIds.value
		// console.log(newTracks, existingIds)
		AddTracksToSession(newTracks, existingIds)
	},
	{
		deep: true,
		immediate: true
	}
)

// Watch track changes
watch(
	() => newSession.value.trackIds,
	newTrackIds => {
		const newTracksInfo = newTrackIds.map(trackId => {
			const track = trackStore.findTrackById(trackId)
			return {
				id: track.key,
				name: track.trackConfig.name,
				label: track.trackConfig.label,
				type: track.type,
				url: track.option.url
			}
		})

		emit("update:tracksInfo", newTracksInfo)
	}
)

// 处理位置更新
const handleLocationUpdate = newLocation => {
	emit("update:location", newLocation)
}

// When showing a message, use the h function to create the icon
const createMessage = (content: string, type: "success" | "error" | "info") => {
	return message[type]({
		content,
		render() {
			return h(
				"div",
				{
					class: "message-wrapper"
				},
				[h("span", { class: "message-content" }, content)]
			)
		}
	})
}
</script>

<style scoped></style>
