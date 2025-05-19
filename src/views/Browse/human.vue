<template>
	<!-- <BrowserBase>
    <template #default>
      <ul>
        <li class="flex space-x-3 items-center mb-2">
          <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500" fill="currentColor"
            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"></path>
          </svg>
          <p class="text-xl font-light text-gray-500">This is the Browser Navigation page for monkey.</p>
        </li>
      </ul>

    </template>
  </BrowserBase> -->
	<n-card class="mb-6">
		<div class="flex items-center justify-end mx-2 my-4">
			<n-space>
				<n-tooltip trigger="hover">
					<template #trigger>
						<n-button secondary size="small" @click="prepareScreenshot">
							<template #icon>
								<Icon icon="mdi:camera" />
							</template>
						</n-button>
					</template>
					Take screenshot
				</n-tooltip>
				<n-button secondary size="small" @click="showAddTrackModal = true">Add Track</n-button>
				<n-button secondary size="small" @click="showTracksInfoModal = true">Show Tracks</n-button>
				<n-tooltip trigger="hover">
					<template #trigger>
						<n-button secondary size="small" @click="handleRefresh">
							<template #icon>
								<Icon icon="mdi:refresh" />
							</template>
						</n-button>
					</template>
					Refresh the browser
				</n-tooltip>
				<n-tooltip trigger="hover">
					<template #trigger>
						<n-button secondary size="small" @click="openHelpPage">
							<template #icon>
								<Icon icon="mdi:help-circle" />
							</template>
						</n-button>
					</template>
					Open help page
				</n-tooltip>
			</n-space>
		</div>
		<ExpressoVue :key="refreshKey" id="human_browser" :assembly="asm" v-model:tracksInfo="tracksInfo"></ExpressoVue>
	</n-card>
	<!-- Screenshot Modal -->
	<n-modal v-model:show="toggleComponent">
		<n-card>
			<template #header>Preview screenshot</template>
			<ScreenshotExporter />
			<n-divider />
			<div ref="screenshotContainer" id="screenshot-container"></div>
		</n-card>
	</n-modal>
	<!-- Modals -->
	<n-modal
		v-model:show="showAddTrackModal"
		preset="card"
		size="huge"
		header-class="bg-white"
		content-class="bg-white"
	>
		<template #header>Load tracks from file server</template>
		<n-tabs type="line" animated>
			<n-tab-pane name="Add Meta Track" tab="Meta Track" display-directive="if">
				<DownloadTable :downloadFiles="downloadFiles_merged" @addTrack="addTrack"></DownloadTable>
			</n-tab-pane>
			<n-tab-pane name="Add Bulk 3D track" tab="Bulk Hi-C/HiChIP/ChIA-PET track" display-directive="show">
				<ExpressoTable @add-track="addTrack"></ExpressoTable>
			</n-tab-pane>
			<n-tab-pane
				name="Add Single cell 3D track"
				tab="Single cell 3D track"
				display-directive="show"
			></n-tab-pane>
			<n-tab-pane
				name="Add Single molecular 3D track"
				tab="Single molecular 3D track"
				display-directive="show"
			></n-tab-pane>
		</n-tabs>
	</n-modal>

	<n-modal
		v-model:show="showTracksInfoModal"
		preset="card"
		style="max-width: 900px"
		header-class="bg-white"
		content-class="bg-white"
		size="huge"
	>
		<template #header>Loaded tracks</template>
		<n-table :bordered="false" :single-line="false">
			<thead>
				<tr>
					<th>Track Id</th>
					<th>Track label</th>
					<th>Track Type</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="track in tracksInfo" :key="track.id">
					<td>{{ track.id }}</td>
					<td>{{ track.name }}</td>
					<td>{{ track.type }}</td>
				</tr>
			</tbody>
		</n-table>
	</n-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BrowserBase from '@/components/browser/BrowserBase.vue'
import ExpressoVue from '@/browser/elements/Expresso/ExpressoVue.vue'
import chromBands from '@/data/chromBands.json'
import AutocompleteDialog from '@/components/common/AutocompleteDialog.vue'
import AnnotationDetail from '@/views/ResultsDetail/index.vue'
import DownloadTable from './DownloadTable.vue'
import ExpressoTable from './ExpressoTable.vue'
import { fetchGeneCoord } from './fetchGeneCoord.js'
import { useMessage } from 'naive-ui'
import { useModalStore } from '@/stores/modalStore'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { NModal, NCard, NDivider } from 'naive-ui'
import ScreenshotExporter from '@/browser/elements/ScreenshotExporter.vue'
import { useScreenshotStore } from '@/browser/store'
import { useElementSize } from '@vueuse/core'

const modalStore = useModalStore()

const route = useRoute()
const species = route.name?.toString().toLowerCase() || 'monkey'

const showAddTrackModal = ref(false)
const showTracksInfoModal = ref(false)
const currentGene = ref('')
const value = ref(null)
const showDrawer = ref(true)
const isDrawerOpen = ref(false)
const openIcon = 'majesticons:open'
const refreshKey = ref(0)
const toggleComponent = ref(false)
const screenshotContainer = ref(null)
const screenshotStore = useScreenshotStore()
const { width } = useElementSize(screenshotContainer)

const handleRefresh = () => {
	refreshKey.value++
}

const openHelpPage = () => {
	window.open('/help/human', '_blank')
}

const prepareScreenshot = async () => {
	toggleComponent.value = true
	await nextTick()

	// 获取ExpressoVue组件的实际宽度
	const expressoContainer = document.querySelector('#human_browser')
	if (expressoContainer) {
		const containerWidth = expressoContainer.clientWidth || 800
		if (screenshotContainer.value) {
			screenshotContainer.value.style.width = `${containerWidth + 30}px`
		}
		screenshotStore.triggerScreenshot('svg')
	}
}

// 切换抽屉状态
const toggleDrawer = () => {
	isDrawerOpen.value = !isDrawerOpen.value
}

let asm = {
	label: 'hg38',
	chromSizes: {
		chr1: 195471971,
		chr2: 182113224,
		chrX: 171031299,
		chr3: 160039680,
		chr4: 156508116,
		chr5: 151834684,
		chr6: 149736546,
		chr7: 145441459,
		chr10: 130694993,
		chr8: 129401213,
		chr14: 124902244,
		chr9: 124595110,
		chr11: 122082543,
		chr13: 120421639,
		chr12: 120129022,
		chr15: 104043685,
		chr16: 98207768,
		chr17: 94987271,
		chrY: 91744698,
		chr18: 90702639,
		chr19: 61431566,
		chrM: 16299
	},
	initPos: [
		{
			chrom: 'chr1',
			start: 63742763,
			end: 67102794
		}
	]
	//chromBands: chromBands
}
// chr11:65,370,274-65,475,274
//chr1:63,742,763-67,102,794
// const tracksInfo = ref([
// {
//     id: 'chromview_human',
//     name: '',
//     label: '',
//     type: 'ChromTrack'
//   },
//   {
//     id: 'hg38-ucsc-gene-annotation-chromatin-interactions',
//     name: 'Gene annotation',
//     label: 'UCSC Gene annotation',
//     type: 'GeneTrack',
//     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
//   },
// {
//   id: 'meta domain',
//   name: 'Meta domain insulation track',
//   label: 'Meta insulation score',
//   type: 'MetaDomainTrack',
//   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/expresso_domain_boundary_stat_5k.bed.gz'
// },
// {
//   id: 'meta compartment',
//   name: 'Meta compartment type',
//   label: 'Meta compartment type',
//   type: 'MetaCompartmentTrack',
//   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/compartment_counts.bed.gz'
// },
// {
//   id: 'meta loops',
//   name: 'Meta loops type',
//   label: 'Meta loops type',
//   type: 'DotTrack',
//   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/merged_loops_with_counts.bed.gz'
// },
// {
//   id: 'meta loops2',
//   name: 'Meta loops type',
//   label: 'Meta loops type',
//   type: 'CurvTrack',
//   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/merged_loops_with_counts.bed.gz'
// }
//])

// {
//   id: 'GWAS Catalog',
//   "name": "GWAS Catalog",
//   "label": "GWAS Catalog",
//   "type": "SnpTrack",
//   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/gwas/Finn_GWAS_srt.txt.gz",

// },
// {
//   id: 'Adipose subcutaneous Eqtl',
//   "name": "Adipose subcutaneous Eqtl",
//   "label": "Adipose subcutaneous Eqtl",
//   "type": "PclsTrack",
//   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/eqtl/Adipose_Subcutaneous.bed.gz",
//   "style": 'block'
// }
const organColors = {
	artery: '#E63946', // 鲜红色 - 代表血管系统
	brain: '#5A67D8', // 靛蓝色 - 代表神经系统
	colon: '#8B5CF6', // 紫色 - 代表消化系统
	heart: '#DC2626', // 深红色 - 代表心血管系统
	kidney: '#2563EB', // 蓝色 - 代表泌尿系统
	liver: '#047857', // 深绿色 - 代表代谢系统
	lung: '#60A5FA', // 天蓝色 - 代表呼吸系统
	muscle: '#9D174D', // 酒红色 - 代表肌肉系统
	pancreas: '#D97706', // 琥珀色 - 代表内分泌系统
	stomach: '#7C3AED' // 紫罗兰 - 代表消化系统
}
const tracksInfo = [
	{
		id: 'chromview',
		name: '',
		label: '',
		type: 'ChromTrack'
	},
	{
		id: 'hg38-ucsc-gene-annotation-chromatin-interactions',
		name: 'Gene annotation',
		label: 'UCSC Gene annotation',
		type: 'GeneTrack',
		url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
	},
	// {
	//   id: 'k562 matrix',
	//   name: 'k562 matrix',
	//   label: 'k562 matrix',
	//   type: 'MrhicTrack',
	//   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.contact_matrix.hic'
	// },
	{
		id: 'k562 matrix2',
		name: '',
		label: 'k562 matrix2',
		type: 'HicTrack',
		url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.contact_matrix.hic'
	},
	{
		id: 'k562 curves',
		name: '',
		label: 'k562 curves',
		type: 'CurvTrack',
		url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz',
		lineColor: organColors.heart,
		areaColor: organColors.heart
	},
	{
		id: 'k562 loops',
		name: '',
		label: 'k562 loops',
		type: 'PclsTrack',
		url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz'
		// "lineColor": organColors.heart,
		// "areaColor": organColors.heart
	},
	// {
	//   "id": "k562 loops",
	//   "name": "k562 loops",
	//   "label": "k562 loops",
	//   "type": "PclsTrack",
	//   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz",
	//   // "lineColor": organColors.heart,
	//   // "areaColor": organColors.heart
	// },

	{
		id: 'k562 anchors',
		name: '',
		label: 'k562 anchors',
		type: 'SclsTrack',
		url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz'
		// "lineColor": organColors.heart,
		// "areaColor": organColors.heart
	},

	{
		id: 'k562 ChIA-PET bigwig',
		name: '',
		label: 'k562 ChIA-PET bigwig',
		type: 'CompTrack',
		url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM5379463/GSM5379463.bigwig',
		// "lineColor": organColors.heart,
		// "areaColor": organColors.heart
		flip: true
	}
	// {
	//   "id": "LNCap Pore-C clusters",
	//   "name": "LNCap Pore-C clusters",
	//   "label": "LNCap Pore-C clusters",
	//   "type": "MclsTrack",
	//   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/browser/porec/GSM5923735_LNCaP_Set1_18hour.srt.bed.gz",
	//   // "lineColor": organColors.heart,
	//   // "areaColor": organColors.heart
	// },
	// {
	//   "id": "LNCap Pore-C clusters2",
	//   "name": "LNCap Pore-C clusters",
	//   "label": "LNCap Pore-C clusters",
	//   "type": "SclsTrack",
	//   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/browser/porec/GSM5923735_LNCaP_Set1_18hour.srt.bed.gz",
	//   // "lineColor": organColors.heart,
	//   // "areaColor": organColors.heart
	// },
]

const downloadFiles_merged = ref({
	itemCount: 4,
	items: [
		{
			sample_name: 'Domain boundary Meta Track',
			info: 'Domain insulation score across 1000 Hi-C datasets',
			track_type: 'MetaDomainTrack',
			download_link:
				'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/expresso_domain_boundary_stat_5k.bed.gz'
		},
		{
			sample_name: 'Compartment Meta Track',
			info: 'Compartment proprotion across 1000 Hi-C datasets',
			track_type: 'MetaCompartmentTrack',
			download_link: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/compartment_counts.bed.gz'
		},
		{
			sample_name: 'Chromatin Loop Meta Track',
			info: 'Ensembled chromatin loop across 1000 Hi-C datasets',
			track_type: 'DotTrack',
			download_link:
				'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/merged_loops_with_counts.bed.gz'
		}
	]
})

// Add method to add new track
const addTrack = trackData => {
	tracksInfo.value.push({
		id: trackData.sample_name.toLowerCase().replace(/\s+/g, '-'),
		name: trackData.sample_name,
		label: trackData.sample_name,
		type: trackData.track_type,
		url: trackData.download_link
	})
}
const message = useMessage()

const handleGeneSearch = async () => {
	console.log(currentGene.value)
	if (!currentGene.value) {
		message.warning('Please enter a gene symbol (e.g. NEAT1, GATA4)')
		return
	}

	const result = await fetchGeneCoord(currentGene.value)

	if (result.status === 'success') {
		message.success(result.message)
	} else {
		message.error(result.message)
	}
}

// import { useSessionStore } from '@/browser/store'

// const sessionStore = useSessionStore();

// // Computed and watchers
// const sessionTracks = computed(() => {
//   return sessionStore.getTargtedSessiongetSessionTracks('human_browser')
// })

// watch(sessionTracks, (newTracks, oldTracks) => {
//   tracksInfo.value = newTracks
// }, {immediate: false})
</script>
<style lang="scss" scoped>
.compose-btn-wrap {
	width: 20%;

	:deep() {
		.n-button {
			width: 100%;
		}
	}
}

/* 抽屉样式 */
.drawer {
	z-index: 10000;
	position: fixed;
	bottom: 75px;
	left: 0;
	width: 100%;
	background-color: #ffffff;
	border-top: 2px solid #ddd;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	transform: translateY(100%);
	transition: transform 0.3s ease;
}

.drawer.open {
	transform: translateY(0);
}

/* 抽屉内容区域 */
.drawer-content {
	// padding: 20px;
	height: 800px;
	overflow-y: auto;
}

/* 把手样式 */
.drawer-handle {
	position: absolute;
	top: -45px;
	right: -1%;
	transform: translateX(-50%);
	width: 50px;
	height: 80px;
	background-color: #007bff;
	color: white;
	text-align: center;
	line-height: 30px;
	font-size: 14px;
	border-radius: 15px 15px 0 0;
	cursor: pointer;
	user-select: none;
}
</style>
