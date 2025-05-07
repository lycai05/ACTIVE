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
  <div class="flex items-center justify-center mx-auto">
        <n-button class="mr-4" secondary size="small" @click="showAddTrackModal = true">Add Track</n-button>
        <n-button class="mr-4" secondary size="small" @click="showTracksInfoModal = true">Show Tracks</n-button>
      </div>
    </n-card>
  <ExpressoVue id="monkey_browser" :assembly="asm" v-model:tracksInfo="tracksInfo"></ExpressoVue>

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
import { useRoute } from 'vue-router'

import ExpressoTable from '../Browse/ExpressoTable.vue'

const showAddTrackModal = ref(false)
const showTracksInfoModal = ref(false)

const route = useRoute()
const species = route.name?.toString().toLowerCase() || 'mouse'


let asm = {
  label: 'Mfas6',
  chromSizes: {
    "chr1": 223606306,
    "chr2": 194592313,
    "chr3": 186444865,
    "chr4": 171057148,
    "chr5": 186553353,
    "chr6": 179102756,
    "chr7": 171798370,
    "chr8": 144116383,
    "chr9": 131032084,
    "chr10": 96731059,
    "chr11": 132457180,
    "chr12": 130596009,
    "chr13": 108762655,
    "chr14": 125104124,
    "chr15": 111111006,
    "chr16": 79120393,
    "chr17": 95081867,
    "chr18": 73713002,
    "chr19": 58824109,
    "chr20": 75859114,
    "chrX": 150377965
  },
  initPos: [{
    chrom: 'chr1',
    start: 23790000,
    end: 26290000
  }]
}

const downloadFiles_merged = ref({
  itemCount: 0,
  items: []
})

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

const tracksInfo = ref([
  {
    id: 'chromview',
    name: '',
    label: '',
    type: 'ChromTrack'
  },
  // ARTERY
  {
    "id": "M_artery.chromatin_loops.bed.gz",
    "name": "Artery Chromatin Loops",
    "label": "Artery Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_artery.chromatin_loops.bed.gz",
    "areaColor": organColors.artery,
    "lineColor": organColors.artery
  },
  {
    id: "M_artery_H3K27ac.RPKM.bigwig",
    name: "Artery H3K27ac RPKM",
    label: "Artery H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_artery_H3K27ac.RPKM.bigwig",
    posColor: organColors.artery,
    flip: true
  },
  {
    id: "M_artery_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Artery RNA",
    label: "Artery RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_artery_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.artery
  },
  
  // BRAIN
  {
    "id": "M_brain.chromatin_loops.bed.gz",
    "name": "Brain Chromatin Loops",
    "label": "Brain Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_brain.chromatin_loops.bed.gz",
    "areaColor": organColors.brain,
    "lineColor": organColors.brain
  },
  {
    id: "M_brain_H3K27ac.RPKM.bigwig",
    name: "Brain H3K27ac RPKM",
    label: "Brain H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_brain_H3K27ac.RPKM.bigwig",
    posColor: organColors.brain,
    flip: true
  },
  {
    id: "M_brain_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Brain RNA",
    label: "Brain RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_brain_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.brain
  },
  
  // COLON
  {
    "id": "M_colon.chromatin_loops.bed.gz",
    "name": "Colon Chromatin Loops",
    "label": "Colon Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_colon.chromatin_loops.bed.gz",
    "areaColor": organColors.colon,
    "lineColor": organColors.colon
  },
  {
    id: "M_colon_H3K27ac.RPKM.bigwig",
    name: "Colon H3K27ac RPKM",
    label: "Colon H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_colon_H3K27ac.RPKM.bigwig",
    posColor: organColors.colon,
    flip: true
  },
  {
    id: "M_colon_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Colon RNA",
    label: "Colon RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_colon_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.colon
  },
  
  // HEART
  {
    "id": "M_heart.chromatin_loops.bed.gz",
    "name": "Heart Chromatin Loops",
    "label": "Heart Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_heart.chromatin_loops.bed.gz",
    "areaColor": organColors.heart,
    "lineColor": organColors.heart
  },
  {
    id: "M_heart_H3K27ac.RPKM.bigwig",
    name: "Heart H3K27ac RPKM",
    label: "Heart H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/034_M_heart_H3K27ac.RPKM.bigwig",
    posColor: organColors.heart,
    flip: true
  },
  {
    id: "M_heart_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Heart RNA",
    label: "Heart RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_heart_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.heart
  },
  
  // KIDNEY
  {
    "id": "M_kidney.chromatin_loops.bed.gz",
    "name": "Kidney Chromatin Loops",
    "label": "Kidney Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_kidney.chromatin_loops.bed.gz",
    "areaColor": organColors.kidney,
    "lineColor": organColors.kidney
  },
  {
    id: "M_kidney_H3K27ac.RPKM.bigwig",
    name: "Kidney H3K27ac RPKM",
    label: "Kidney H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_kidney_H3K27ac.RPKM.bigwig",
    posColor: organColors.kidney,
    flip: true
  },
  {
    id: "M_kidney_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Kidney RNA",
    label: "Kidney RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_kidney_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.kidney
  },
  
  // LIVER
  {
    "id": "M_liver.chromatin_loops.bed.gz",
    "name": "Liver Chromatin Loops",
    "label": "Liver Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_liver.chromatin_loops.bed.gz",
    "areaColor": organColors.liver,
    "lineColor": organColors.liver
  },
  {
    id: "M_liver_H3K27ac.RPKM.bigwig",
    name: "Liver H3K27ac RPKM",
    label: "Liver H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_liver_H3K27ac.RPKM.bigwig",
    posColor: organColors.liver,
    flip: true
  },
  {
    id: "M_liver_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Liver RNA",
    label: "Liver RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_liver_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.liver
  },
  
  // LUNG
  {
    "id": "M_lung.chromatin_loops.bed.gz",
    "name": "Lung Chromatin Loops",
    "label": "Lung Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_lung.chromatin_loops.bed.gz",
    "areaColor": organColors.lung,
    "lineColor": organColors.lung
  },
  {
    id: "M_lung_H3K27ac.RPKM.bigwig",
    name: "Lung H3K27ac RPKM",
    label: "Lung H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/034_M_lung_H3K27ac.RPKM.bigwig",
    posColor: organColors.lung,
    flip: true
  },
  {
    id: "M_lung_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Lung RNA",
    label: "Lung RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_lung_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.lung
  },
  
  // MUSCLE
  {
    "id": "M_muscle.chromatin_loops.bed.gz",
    "name": "Muscle Chromatin Loops",
    "label": "Muscle Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_muscle.chromatin_loops.bed.gz",
    "areaColor": organColors.muscle,
    "lineColor": organColors.muscle
  },
  {
    id: "M_muscle_H3K27ac.RPKM.bigwig",
    name: "Muscle H3K27ac RPKM",
    label: "Muscle H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_muscle_H3K27ac.RPKM.bigwig",
    posColor: organColors.muscle,
    flip: true
  },
  {
    id: "M_muscle_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Muscle RNA",
    label: "Muscle RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_muscle_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.muscle
  },
  
  // PANCREAS
  {
    "id": "M_pancreas.chromatin_loops.bed.gz",
    "name": "Pancreas Chromatin Loops",
    "label": "Pancreas Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_pancreas.chromatin_loops.bed.gz",
    "areaColor": organColors.pancreas,
    "lineColor": organColors.pancreas
  },
  {
    id: "M_pancreas_H3K27ac.RPKM.bigwig",
    name: "Pancreas H3K27ac RPKM",
    label: "Pancreas H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_pancreas_H3K27ac.RPKM.bigwig",
    posColor: organColors.pancreas,
    flip: true
  },
  {
    id: "M_pancreas_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Pancreas RNA",
    label: "Pancreas RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_pancreas_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.pancreas
  },
  
  // STOMACH
  {
    "id": "M_stomach.chromatin_loops.bed.gz",
    "name": "Stomach Chromatin Loops",
    "label": "Stomach Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_stomach.chromatin_loops.bed.gz",
    "areaColor": organColors.stomach,
    "lineColor": organColors.stomach
  },
  {
    id: "M_stomach_H3K27ac.RPKM.bigwig",
    name: "Stomach H3K27ac RPKM",
    label: "Stomach H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_stomach_H3K27ac.RPKM.bigwig",
    posColor: organColors.stomach,
    flip: true
  },
  {
    id: "M_stomach_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    name: "Stomach RNA",
    label: "Stomach RNA",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_stomach_RNA_rep2.aligned.filtered.SortByCoord.RPKM.bw",
    posColor: organColors.stomach
  }
])

const addTrack = (trackData) => {
  tracksInfo.value.push({
    id: trackData.sample_name.toLowerCase().replace(/\s+/g, '-'),
    name: trackData.sample_name,
    label: trackData.sample_name,
    type: trackData.track_type,
    url: trackData.download_link
  })
}
</script>
<style></style>