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
          <p class="text-xl font-light text-gray-500">This is the Browser Navigation page for mouse.</p>
        </li>
      </ul>
    </template>
  </BrowserBase> -->
  <n-card class="mb-6">
  <div class="flex items-center justify-end mx-2 my-4">
    <n-space >
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
  <ExpressoVue :key="refreshKey" id="mouse_browser" :assembly="asm" v-model:tracksInfo="tracksInfo"></ExpressoVue>
</n-card>

  <!-- Modals -->
  <n-modal v-model:show="showAddTrackModal" preset="card" size="huge" header-class="bg-white" content-class="bg-white">
    <template #header>Load tracks from CREScope file server</template>
    <n-tabs type="line" animated>
      <n-tab-pane name="Add Meta Track" tab="Add Meta Track" display-directive="if">
        <DownloadTable :downloadFiles="downloadFiles_merged" @addTrack="addTrack"></DownloadTable>
      </n-tab-pane>
      <n-tab-pane name="Add EXPRESSO track" tab="Add EXPRESSO track" display-directive="show">
        <ExpressoTable species="species" @add-track="addTrack"></ExpressoTable>
      </n-tab-pane>
    </n-tabs>
  </n-modal>

  <n-modal v-model:show="showTracksInfoModal" preset="card" style="max-width: 900px" header-class="bg-white"
    content-class="bg-white" size="huge">
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

<script setup lang="ts">
import BrowserBase from '@/components/browser/BrowserBase.vue'
import ExpressoVue from "@/browser/elements/Expresso/ExpressoVue.vue"
import { ref } from 'vue'
import DownloadTable from '../Browse/DownloadTable.vue'
import ExpressoTable from '../Browse/ExpressoTable.vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const showAddTrackModal = ref(false)
const showTracksInfoModal = ref(false)
const refreshKey = ref(0)

const handleRefresh = () => {
  refreshKey.value++
}

const openHelpPage = () => {
  window.open('/help/mouse', '_blank')
}

const downloadFiles_merged = ref({
  itemCount: 0,
  items: []
})

const route = useRoute()
const species = route.name?.toString().toLowerCase() || 'monkey'

const organColors = {
  artery: '#E63946',  // 鲜红色 - 代表血管系统
  brain: '#5A67D8',   // 靛蓝色 - 代表神经系统
  colon: '#8B5CF6',   // 紫色 - 代表消化系统
  heart: '#DC2626',   // 深红色 - 代表心血管系统
  kidney: '#2563EB',  // 蓝色 - 代表泌尿系统
  liver: '#047857',   // 深绿色 - 代表代谢系统
  lung: '#60A5FA',    // 天蓝色 - 代表呼吸系统
  muscle: '#9D174D',  // 酒红色 - 代表肌肉系统
  pancreas: '#D97706', // 琥珀色 - 代表内分泌系统
  stomach: '#7C3AED'  // 紫罗兰 - 代表消化系统
}

const addTrack = (trackData) => {
  tracksInfo.value.push({
    id: trackData.sample_name.toLowerCase().replace(/\s+/g, '-'),
    name: trackData.sample_name,
    label: trackData.sample_name,
    type: trackData.track_type,
    url: trackData.download_link
  })
}

let asm = 
  {
    id: 'mm10',
    chromSizes: {
      "chr1": 195471971,
      "chr2": 182113224,
      "chrX": 171031299,
      "chr3": 160039680,
      "chr4": 156508116,
      "chr5": 151834684,
      "chr6": 149736546,
      "chr7": 145441459,
      "chr10": 130694993,
      "chr8": 129401213,
      "chr14": 124902244,
      "chr9": 124595110,
      "chr11": 122082543,
      "chr13": 120421639,
      "chr12": 120129022,
      "chr15": 104043685,
      "chr16": 98207768,
      "chr17": 94987271,
      "chrY": 91744698,
      "chr18": 90702639,
      "chr19": 61431566,
      "chrM": 16299
    },
    initPos:
    [{
      chrom: 'chr1',
      start: 22790000,
      end: 26290000
    }]
  }

const tracksInfo = ref([
{
    id: 'chromview_mouse',
    name: '',
    label: '',
    type: 'ChromTrack'
  },
// {
//     id: 'meta domain mouse',
//     name: 'Meta domain insulation',
//     label: 'Meta insulation score',
//     type: 'MetaDomainTrack',
//     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_domain_meta_track.srt.bed.gz'
//   },
//   {
//     id: 'meta compartment mouse',
//     name: 'Meta compartment type',
//     label: 'Meta compartment type',
//     type: 'MetaCompartmentTrack',
//     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_compartment_meta_track.txt.gz'
//   },
//   {
//     id: 'meta loops2',
//     name: 'Meta loops type',
//     label: 'Meta loops type',
//     type: 'DotTrack',
//     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_merged_loop_track_srt.bed.gz'
//   }
  ])
</script>

<style></style>