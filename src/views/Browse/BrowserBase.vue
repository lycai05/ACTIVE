<template>
  <div>
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
          <n-button secondary size="small" @click="showAddTrackModal = true">Add Track</n-button>
          <n-button secondary size="small" @click="showTracksInfoModal = true">Show Tracks</n-button>
        </n-space>
      </div>
      <slot></slot>
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

    <!-- Add Track Modal -->
    <n-modal v-model:show="showAddTrackModal" preset="card" size="huge" header-class="bg-white" content-class="bg-white">
      <template #header>Load tracks from CREScope file server</template>
      <n-tabs type="line" animated>
        <n-tab-pane name="Add Meta Track" tab="Add Meta Track" display-directive="if">
          <DownloadTable :downloadFiles="downloadFiles" @addTrack="addTrack"></DownloadTable>
        </n-tab-pane>
        <n-tab-pane name="Add EXPRESSO track" tab="Add EXPRESSO track" display-directive="show">
          <ExpressoTable :species="species" @add-track="addTrack"></ExpressoTable>
        </n-tab-pane>
        <n-tab-pane name="Add Species Track" tab="Add Species Track" display-directive="show">
          <DownloadTable :downloadFiles="speciesTracks" @addTrack="addTrack"></DownloadTable>
        </n-tab-pane>
      </n-tabs>
    </n-modal>

    <!-- Tracks Info Modal -->
    <n-modal v-model:show="showTracksInfoModal" preset="card" style="max-width: 900px" header-class="bg-white" content-class="bg-white" size="huge">
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NModal, NCard, NButton, NSpace, NTabs, NTabPane, NTable, NDivider } from 'naive-ui'
import { Icon } from '@iconify/vue'
import DownloadTable from './DownloadTable.vue'
import ExpressoTable from './ExpressoTable.vue'
import ScreenshotExporter from '@/browser/elements/ScreenshotExporter.vue'
import { useScreenshotStore } from '@/browser/store'
import { useElementSize } from '@vueuse/core'

interface TrackItem {
  sample_name: string
  info: string
  track_type: string
  download_link: string
}

interface DownloadFiles {
  itemCount: number
  items: TrackItem[]
}

interface Track {
  id: string
  name: string
  label: string
  type: string
  url?: string
}

const props = defineProps<{
  browserId: string
  assembly: any
  downloadFiles: DownloadFiles
  speciesTracks?: DownloadFiles
}>()

const showAddTrackModal = ref(false)
const showTracksInfoModal = ref(false)
const refreshKey = ref(0)
const toggleComponent = ref(false)
const screenshotContainer = ref<HTMLElement | null>(null)
const screenshotStore = useScreenshotStore()
const { width } = useElementSize(screenshotContainer)

const tracksInfo = ref<Track[]>([{
  id: `chromview_${props.browserId.split('_')[0]}`,
  name: '',
  label: '',
  type: 'ChromTrack'
}])

const route = useRoute()
const species = route.name?.toString().toLowerCase() || 'monkey'

const handleRefresh = () => {
  refreshKey.value++
}

const prepareScreenshot = async () => {
  toggleComponent.value = true
  await nextTick()
  
  if (screenshotContainer.value) {
    const containerWidth = width.value || 800
    screenshotContainer.value.style.width = `${containerWidth + 30}px`
    screenshotStore.triggerScreenshot('svg')
  }
}

const addTrack = (trackData: TrackItem) => {
  tracksInfo.value.push({
    id: trackData.sample_name.toLowerCase().replace(/\s+/g, '-'),
    name: trackData.sample_name,
    label: trackData.sample_name,
    type: trackData.track_type,
    url: trackData.download_link
  })
}

// Preload gene track
onMounted(() => {
  if (props.speciesTracks?.items) {
    const geneTrack = props.speciesTracks.items.find(item => item.track_type === 'GeneTrack')
    if (geneTrack) {
      addTrack(geneTrack)
    }
  }
})
</script> 