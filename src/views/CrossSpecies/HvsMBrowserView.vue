<template>
    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full mb-6">
      <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
        title="Browse genes or CREs with sequence homology" :segmented="{
          content: true,
          footer: true
        }">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <n-h3 align-text>Browse human CREs with sequence homology in monkey</n-h3>
            <button @click="prepareScreenshot" type="button" class="p-2.5 group bg-gray-100 rounded-full hover:bg-gray-200 me-4 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:bg-gray-600 dark:hover:bg-gray-800">
              <svg class="text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20" viewBox="0 0 28 28">
                <path d="M3 6.75A3.75 3.75 0 0 1 6.75 3h14.5A3.75 3.75 0 0 1 25 6.75v14.5A3.75 3.75 0 0 1 21.25 25H6.75A3.75 3.75 0 0 1 3 21.25zm5.75-.25A2.25 2.25 0 0 0 6.5 8.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 1 8.75 8h3a.75.75 0 0 0 0-1.5zm7.5 0a.75.75 0 0 0 0 1.5h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 0 1.5 0v-3a2.25 2.25 0 0 0-2.25-2.25zM8 16.25a.75.75 0 0 0-1.5 0v3a2.25 2.25 0 0 0 2.25 2.25h3a.75.75 0 0 0 0-1.5h-3a.75.75 0 0 1-.75-.75zm13.5 0a.75.75 0 0 0-1.5 0v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 0 0 1.5h3a2.25 2.25 0 0 0 2.25-2.25z"/>
              </svg>
              <span class="sr-only">Preview screenshot</span>
            </button>
          </div>
        </template>
        <template #default>
          <ExpressoVue  :key="HumanBrowserKey" id="cross_species_human"
            :assembly="asm" :tracksInfo="tracksInfo" :highlight-region="highlightRegionHuman" 
            :browser-id="'human'"
            @update:location="handleLocationUpdate"></ExpressoVue>
          <div class="mb-4">
            <ExpressoLink 
              v-if="HumanBrowser && MonkeyBrowser" 
              :location1="browserLocation"
              :location2="monkeyBrowserLocation" 
              :links="link_human_monkey"
              url="https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38_to_ma6/hg38_to_maf6.2.txt.gz"
            ></ExpressoLink>
          </div>
          <ExpressoVue  :key="MonkeyBrowserKey" id="cross_species_monkey"
            :assembly="asmMonkey" :highlight-region="highlightRegionMonkey" :tracksInfo="tracksInfoMonkey"
            :browser-id="'monkey'"
            @update:location="handleMonkeyLocationUpdate" :reverseLayout="asmMonkey.reverseLayout">
          </ExpressoVue>
        </template>
      </CardActions>
    </CardWrapper>
    <n-modal v-model:show="toggleComponent">
      <n-card>
        <template #header>Preview screenshot</template>
        <ScreenshotExporter />
        <n-divider />
        <div ref="screenshotContainer" id="screenshot-container"></div>
      </n-card>
    </n-modal>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, defineAsyncComponent, onMounted, nextTick } from 'vue'
  import ExpressoLink from "@/browser/elements/ExpressoLink.vue"
  import chromBands from '@/data/chromBands.json'
  import MousechromBands from '@/data/mousechromband.json'
  import ExpressoVue from "@/browser/elements/Expresso/ExpressoVue.vue"
  import ExpressoVueMonkey from "@/browser/elements/Expresso/ExpressoVueMonkey.vue"
  import { NModal, NCard, NDivider } from 'naive-ui'
  import ScreenshotExporter from '@/browser/elements/ScreenshotExporter.vue'
  import { useScreenshotStore } from '@/browser/store'
  import { useElementSize } from '@vueuse/core'

  const highlightRegionHuman = ref({})
  const highlightRegionMonkey = ref({})
  
  // Assembly configuration
  const asm = ref({
    label: 'hg38',
    chromSizes: {
      "chr1": 248956422,
      "chr2": 242193529,
      "chr3": 198295559,
      "chr4": 190214555,
      "chr5": 181538259,
      "chr6": 170805979,
      "chr7": 159345973,
      "chrX": 156040895,
      "chr8": 145138636,
      "chr9": 138394717,
      "chr11": 135086622,
      "chr10": 133797422,
      "chr12": 133275309,
      "chr13": 114364328,
      "chr14": 107043718,
      "chr15": 101991189,
      "chr16": 90338345,
      "chr17": 83257441,
      "chr18": 80373285,
      "chr20": 64444167,
      "chr19": 58617616,
      "chrY": 57227415,
      "chr22": 50818468,
      "chr21": 46709983
    },
    initPos: [{
      chrom: 'chr11',
      start: 49135092,
      end: 49218638
    }],
   // chromBands: chromBands
  })
  //chr11:49,145,092-49,208,638
  let asmMonkey = {
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
    chrom: 'chr14',
    start: 80331301,
    end: 80541382
  }],
  reverseLayout: true
}
  //14	ensembl	CDS	80531301	80531301
  const browserLocation = ref({
    chrom: 'chr2',
    start: 234050679,
    end: 234077134,
    max: 242193529,
    min: 0,
    size: 242193529
  })
  
  const monkeyBrowserLocation = ref({
    chrom: 'chr1',
    start: 23790000,
    end: 26290000,
    max: 223606306,
    min: 0,
    size: 223606306
  })
  
  const handleLocationUpdate = (newLocation) => {
    console.log('Human browser update:', newLocation)
    if (newLocation?.trackViews?.[0]) {
      browserLocation.value = newLocation.trackViews[0]
    }
  }
  
  const handleMonkeyLocationUpdate = (newLocation) => {
    console.log('Monkey browser update:', newLocation)
    if (newLocation?.trackViews?.[0]) {
      monkeyBrowserLocation.value = newLocation.trackViews[0]
    }
  }
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
};
  const tracksInfo = ref([


    // {
    //   id: 'human enhancers',
    //   name: 'Enhancers',
    //   label: 'Enhancers',
    //   type: 'SclsTrack',
    //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/crescope/1d_dataset/human_encode_enhancers_hg38_srt.bed.gz'
    // },
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
  // },
  {
    id: 'human_brain-hic',
    name: 'Brain Hi-C',
    label: 'Brain Hi-C', 
    type: 'HicTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7610354_GSM7610353/GSM7610354_GSM7610353.contact_matrix.hic'
  },
  {
    id: 'human_heart-hic',
    name: 'Heart Hi-C',
    label: 'Heart Hi-C', 
    type: 'HicTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7657947_GSM7657946.hic'
  },
  {
    "id": "Human_heart.chromatin_loops.bed.gz",
    "name": "Heart Chromatin Loops",
    "label": "Heart Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7657947_GSM7657946/GSM7657947_GSM7657946.chromatin_loops.bed.gz",
    flip: true
  },
  {
      id: 'hg38-ucsc-gene-annotation',
      name: 'Human Genes',
      label: 'Human Genes',
      type: 'GeneTrack',
      url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
    },
    {
    id: 'chromview_human',
    name: 'chromview_human',
    label: 'chromview_human',
    type: 'ChromTrack'
  },
  ])
  
  const tracksInfoMonkey = ref([
  {
    id: 'chromview_monkey',
    name: 'chromview_monkey',
    label: 'chromview_monkey',
    type: 'ChromTrack'
  },
  {
      id: 'ma6-ucsc-gene-annotation',
      name: 'Monkey Genes',
      label: 'Monkey Genes',
      type: 'GeneTrack',
      url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/ma6/Macaca_fascicularis.Macaca_fascicularis_6.0.112.sorted.bed.gz',
      flip: true
    },

  {
    id: 'M_heart-hic',
    name: 'Heart Hi-C',
    label: 'Heart Hi-C',
    type: 'HicTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_heart.hic',
    flip: true
  },
    {
    "id": "M_heart.chromatin_loops.bed.gz",
    "name": "Heart Chromatin Loops",
    "label": "Heart Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_heart.chromatin_loops.bed.gz",
    "lineColor": organColors.heart,
    "areaColor": organColors.heart,
    flip: true
  },
  {
    id: 'heart-ctcf',
    name: 'Heart ctcf',
    label: 'Heart ctcf',
    type: 'CompTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/ctcf/034_M_heart_CTCF.RPKM.bigwig',
  },
  {
    id: 'heart-ctcf2',
    name: 'Heart ctcf2',
    label: 'Heart ctcf2',
    type: 'CompTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/ctcf/M_heart_CTCF.RPKM.bigwig',
  },
  {
    id: 'heart-h3k27ac',
    name: 'Heart h3k27ac',
    label: 'Heart h3k27ac',
    type: 'CompTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/M_heart_H3K27ac.RPKM.bigwig',
  },
  {
    id: 'heart-h3k27ac2',
    name: 'Heart h3k27ac2',
    label: 'Heart h3k27ac2',
    type: 'CompTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/034_M_heart_H3K27ac.RPKM.bigwig',
  },
  {
    id: 'M_brain-hic',
    name: 'Brain Hi-C',
    label: 'Brain Hi-C', 
    type: 'HicTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_brain.hic',
    flip: true
  },
    {
    "id": "M_brain.chromatin_loops.bed.gz",
    "name": "Brain Chromatin Loops",
    "label": "Brain Chromatin Loops",
    "type": "CurvTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_brain.chromatin_loops.bed.gz",
    flip: true
  },
  {
    id: 'brain-h3k27ac',
    name: 'brain h3k27ac',
    label: 'brain h3k27ac',
    type: 'CompTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/001_M_brain_H3K27ac.RPKM.bigwig',
  },
  {
    id: 'brain-h3k27ac2',
    name: 'brain h3k27ac2',
    label: 'brain h3k27ac2',
    type: 'CompTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/h3k27ac/034_M_brain_H3K27ac.RPKM.bigwig',
  },
  // {
  //   id: "M_heart_CTCF.RPKM.bigwig",
  //   name: "Heart CTCF RPKM",
  //   label: "Heart CTCF RPKM",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/M_heart_CTCF.RPKM.bigwig",
  //   posColor: 'red',
  //   flip: true
  // },

  // {
  //     id: 'Monkey Genes',
  //     name: 'Monkey Genes',
  //     label: 'Monkey Genes',
  //     type: 'GeneTrack',
  //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/Mfas6/UCSC_gene_annotation_Mfas6.srt.reformat.srt.bed.gz'
  //   },
    // {
    //   id: 'mouse enhancers',
    //   name: 'Enhancers',
    //   label: 'Enhancers',
    //   type: 'SclsTrack',
    //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/crescope/1d_dataset/mouse_chipatlas_enhancers_mm10_srt.bed.gz'
    // },
   // {
  //   id: 'meta domain mouse',
  //   name: 'Meta domain insulation',
  //   label: 'Meta insulation score',
  //   type: 'MetaDomainTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_domain_meta_track.srt.bed.gz'
  // },
  // {
  //   id: 'meta compartment mouse',
  //   name: 'Meta compartment type',
  //   label: 'Meta compartment type',
  //   type: 'MetaCompartmentTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_compartment_meta_track.txt.gz'
  // },
  // {
  //   id: 'meta loops2',
  //   name: 'Meta loops type',
  //   label: 'Meta loops type',
  //   type: 'DotTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_merged_loop_track_srt.bed.gz'
  // }
  ])
  
  const HumanBrowserKey = ref(0)
  const HumanBrowser = ref(null)
  const MonkeyBrowserKey = ref(0)
  const MonkeyBrowser = ref(null)
  
  async function loadHumanBrowser() {
    HumanBrowser.value = defineAsyncComponent(() =>
      import("@/browser/elements/Expresso/ExpressoVue.vue")
    )
  }
  
  async function loadMonkeyBrowser() {
    MonkeyBrowser.value = defineAsyncComponent(() =>
      import("@/browser/elements/Expresso/ExpressoVue.vue")
    )
  }
  
  const updateRegions = (regions) => {
    // 重新加载两个组件
    HumanBrowser.value = null
    MonkeyBrowser.value = null
  
    // 更新人类数据
    asm.value.initPos = [{
      chrom: regions.human.chrom,
      start: regions.human.start,
      end: regions.human.end
    }]
  
    const humanGap = regions.human.end - regions.human.start
    highlightRegionHuman.value = {
      chrom: regions.human.chrom,
      start: regions.human.start + humanGap * 0.25,
      end: regions.human.start + humanGap * 0.75,
    }
  
    // 更新小鼠数据
    const monkeyGap = regions.monkey.end - regions.monkey.start
    highlightRegionMonkey.value = {
      chrom: regions.monkey.chrom,
      start: regions.monkey.start,
      end: regions.monkey.end
    }
  
    asmMonkey.value.initPos = [{
      chrom: regions.monkey.chrom,
      start: regions.monkey.start - monkeyGap * 0.5,
      end: regions.monkey.end + monkeyGap * 0.5
    }]
  
    // 重新加载浏览器
    loadHumanBrowser()
    loadMonkeyBrowser()
  
    // 更新keys触发重新渲染
    HumanBrowserKey.value++
    MonkeyBrowserKey.value++
  }
  
  const link_human_monkey = [
    { "chrom1": "chr2", "start1": 33095453, "end1": 33594475, "chrom2": "chr1", "start2": 24300520, "end2": 24426115 },
    { "chrom1": "chr2", "start1": 35814856, "end1": 36473482, "chrom2": "chr1", "start2": 25864251, "end2": 25880748 },
    { "chrom1": "chr2", "start1": 55599538, "end1": 56190543, "chrom2": "chr1", "start2": 24052547, "end2": 24055135 },
    { "chrom1": "chr2", "start1": 45866188, "end1": 46773129, "chrom2": "chr1", "start2": 22797682, "end2": 22863263 },
    { "chrom1": "chr2", "start1": 25739683, "end1": 25850977, "chrom2": "chr1", "start2": 23288380, "end2": 23302240 },
    { "chrom1": "chr1", "start1": 23227263, "end1": 23255608, "chrom2": "chr2", "start2": 45495120, "end2": 45706236 },
    { "chrom1": "chr1", "start1": 25067563, "end1": 25078314, "chrom2": "chr2", "start2": 63503587, "end2": 63677524 },
    { "chrom1": "chr1", "start1": 24727517, "end1": 24790195, "chrom2": "chr2", "start2": 66120794, "end2": 66163159 },
    { "chrom1": "chr1", "start1": 26173816, "end1": 26279472, "chrom2": "chr2", "start2": 38398740, "end2": 38847522 },
    { "chrom1": "chr1", "start1": 24776751, "end1": 24779272, "chrom2": "chr2", "start2": 35535592, "end2": 35585930 }
  ]
  
  onMounted(() => {
    loadHumanBrowser()
    loadMonkeyBrowser()
  })
  
  defineExpose({
    //updateRegions
  })

  // Add these refs and stores
  const toggleComponent = ref(false)
  const screenshotContainer = ref(null)
  const screenshotStore = useScreenshotStore()
  const { width } = useElementSize(screenshotContainer)

  // Add this method
  const prepareScreenshot = async () => {
    toggleComponent.value = true
    await nextTick()
    
    if (screenshotContainer.value) {
      const containerWidth = width.value || 800 // 提供一个默认值
      screenshotContainer.value.style.width = `${containerWidth + 30}px`
      screenshotStore.triggerScreenshot('svg')
    }
  }
  </script>