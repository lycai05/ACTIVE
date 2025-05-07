<template>
    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full mb-6">
      <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
        title="Browse genes or CREs with sequence homology" :segmented="{
          content: true,
          footer: true
        }">
        <template #header>
          <n-h3 align-text>Browse human CREs with sequence homology in mouse</n-h3>
        </template>
        <template #default>
          <ExpressoVue  :key="HumanBrowserKey" id="cross_species_human"
            :assembly="asm" :tracksInfo="tracksInfo" :highlight-region="highlightRegionHuman" 
            :browser-id="'human'"
            @update:location="handleLocationUpdate"></ExpressoVue>
          <div class="mb-4">
          <ExpressoLink 
            v-if="HumanBrowser && MouseBrowser" 
            :location1="browserLocation"
            :location2="mouseBrowserLocation" 
            :links="link_human_mouse"
            url="https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38_to_mm10/hg38_mm10_axt.gz"
          ></ExpressoLink>
          </div>
          <ExpressoVue  :key="MouseBrowserKey" id="cross_species_mouse"
            :assembly="asmMouse" :highlight-region="highlightRegionMouse" :tracksInfo="tracksInfoMouse"
            :browser-id="'mouse'"
            @update:location="handleMouseLocationUpdate">
          </ExpressoVue>
        </template>
      </CardActions>
    </CardWrapper>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
  import ExpressoLink from "@/browser/elements/ExpressoLink.vue"
  import chromBands from '@/data/chromBands.json'
  import MousechromBands from '@/data/mousechromband.json'
  import ExpressoVue from "@/browser/elements/Expresso/ExpressoVue.vue"
  import ExpressoVueMouse from "@/browser/elements/Expresso/ExpressoVueMouse.vue"

  const highlightRegionHuman = ref({})
  const highlightRegionMouse = ref({})
  
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
      chrom: 'chr2',
      start: 234050679,
      end: 234077134
    }],
    chromBands: chromBands
  })
  
  const asmMouse = ref({
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
    initPos: [{
      chrom: 'chr1',
      start: 88406743,
      end: 88429321
    }],
    chromBands: MousechromBands
  })
  
  const browserLocation = ref({
    chrom: 'chr2',
    start: 234050679,
    end: 234077134,
    max: 242193529,
    min: 0,
    size: 242193529
  })
  
  const mouseBrowserLocation = ref({
    chrom: 'chr1',
    start: 88406743,
    end: 88429321,
    max: 195471971,
    min: 0,
    size: 195471971
  })
  
  const handleLocationUpdate = (newLocation) => {
    console.log('Human browser update:', newLocation)
    if (newLocation?.trackViews?.[0]) {
      browserLocation.value = newLocation.trackViews[0]
    }
  }
  
  const handleMouseLocationUpdate = (newLocation) => {
    console.log('Mouse browser update:', newLocation)
    if (newLocation?.trackViews?.[0]) {
      mouseBrowserLocation.value = newLocation.trackViews[0]
    }
  }
  
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
  {
    id: 'meta loops2',
    name: '',
    label: 'Meta loops type',
    type: 'CurvTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/merged_loops_with_counts.bed.gz'
  },
  {
      id: 'hg38-ucsc-gene-annotation',
      name: '',
      label: 'Human Genes',
      type: 'GeneTrack',
      url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
    },
  ])
  
  const tracksInfoMouse = ref([
  {
      id: 'Mouse Genes',
      name: '',
      label: 'Mouse Genes',
      type: 'GeneTrack',
      url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/mm10/UCSC_gene_annotation_mm10.srt.reformat.srt.bed.gz'
    },
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
  {
    id: 'meta loops mouse',
    name: '',
    label: 'Meta loops type',
    type: 'CurvTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/3D_annotation/mm10/mouse_merged_loop_track_srt.bed.gz'
  },
  // {
  //   id: 'k562 matrix2',
  //   name: 'k562 matrix2',
  //   label: 'k562 matrix2',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/mouse_hic/oss_files/GSM6598194/GSM6598194.contact_matrix.hic'
  // },
  ])
  
  const HumanBrowserKey = ref(0)
  const HumanBrowser = ref(null)
  const MouseBrowserKey = ref(0)
  const MouseBrowser = ref(null)
  
  async function loadHumanBrowser() {
    HumanBrowser.value = defineAsyncComponent(() =>
      import("@/browser/elements/Expresso/ExpressoVue.vue")
    )
  }
  
  async function loadMouseBrowser() {
    MouseBrowser.value = defineAsyncComponent(() =>
      import("@/browser/elements/Expresso/ExpressoVue.vue")
    )
  }
  
  const updateRegions = (regions) => {
    // 重新加载两个组件
    HumanBrowser.value = null
    MouseBrowser.value = null
  
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
    const mouseGap = regions.mouse.end - regions.mouse.start
    highlightRegionMouse.value = {
      chrom: regions.mouse.chrom,
      start: regions.mouse.start,
      end: regions.mouse.end
    }
  
    asmMouse.value.initPos = [{
      chrom: regions.mouse.chrom,
      start: regions.mouse.start - mouseGap * 0.5,
      end: regions.mouse.end + mouseGap * 0.5
    }]
  
    // 重新加载浏览器
    loadHumanBrowser()
    loadMouseBrowser()
  
    // 更新keys触发重新渲染
    HumanBrowserKey.value++
    MouseBrowserKey.value++
  }
  
  const link_human_mouse = [
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
    loadMouseBrowser()
  })
  
  defineExpose({
    //updateRegions
  })
  </script>