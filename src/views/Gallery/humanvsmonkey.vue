<template>
    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full mb-6">
      <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
        title="Browse genes or CREs with sequence homology" :segmented="{
          content: true,
          footer: true
        }">
        <template #header>
          <n-h3 align-text>Browse human CREs with sequence homology in Monkey</n-h3>
        </template>
        <template #default>
          <component :is="HumanBrowser" v-if="HumanBrowser" :key="HumanBrowserKey" id="Human"
            :assembly="asm.label" :tracksInfo="tracksInfo" :highlight-region="highlightRegionHuman" :location="browserLocation"
            @update:location="handleLocationUpdate"></component>
          <div class="mb-4">
            <ExpressoLink v-if="HumanBrowser && MonkeyBrowser" :location1="browserLocation"
              :location2="MonkeyBrowserLocation" :links="link_human_Monkey"></ExpressoLink>
          </div>
          <component :is="MonkeyBrowser" v-if="MonkeyBrowser" :key="MonkeyBrowserKey" id="Monkey"
            :assembly="asmMonkey.label" :highlight-region="highlightRegionMonkey" :tracksInfo="tracksInfoMonkey"
            :location="MonkeyBrowserLocation" @update:location="handleMonkeyLocationUpdate" :reverseLayout="asmMonkey.reverseLayout"></component>
        </template>
      </CardActions>
    </CardWrapper>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
  import ExpressoLink from "@/browser/elements/ExpressoLink.vue"
  import chromBands from '@/data/chromBands.json'
//   import MonkeychromBands from '@/data/Monkeychromband.json'
  
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
      chrom: 'chr2',
      start: 234050679,
      end: 234077134
    }]
  })
  
  let asmMonkey = ref({
    reverseLayout: 'true',
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
    start: 22790000,
    end: 26290000
  }],
});
//   const r>everseLayout = 
  const browserLocation = ref({
    chrom: 'chr2',
    start: 234050679,
    end: 234077134,
    max: 242193529,
    min: 0,
    size: 242193529
  })
  
  const MonkeyBrowserLocation = ref({
    chrom: 'chr1',
    start: 88406743,
    end: 88429321,
    max: 195471971,
    min: 0,
    size: 195471971
  })
  
  const handleLocationUpdate = (newLocation) => {
    browserLocation.value = newLocation
  }
  
  const handleMonkeyLocationUpdate = (newLocation) => {
    MonkeyBrowserLocation.value = newLocation
  }
  
  const tracksInfo = ref([

  //   {
  //     id: 'human enhancers',
  //     name: 'Enhancers',
  //     label: 'Enhancers',
  //     type: 'SclsTrack',
  //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/crescope/1d_dataset/human_encode_enhancers_hg38_srt.bed.gz'
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
  // },

  {
      id: 'hg38-ucsc-gene-annotation',
      name: 'Human Genes',
      label: 'Human Genes',
      type: 'GeneTrack',
      url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
    },
  ])

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
  
  const tracksInfoMonkey = [
  // Hi-C Tracks
  // {
  //   id: 'M_artery-hic',
  //   name: 'Artery Hi-C',
  //   label: 'Artery Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_artery.hic'
  // },
  {
    id: 'M_brain-hic',
    name: 'Brain Hi-C',
    label: 'Brain Hi-C', 
    type: 'HicTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_brain.hic'
  },

  // {
  //   id: 'M_colon-hic',
  //   name: 'Colon Hi-C',
  //   label: 'Colon Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_colon.hic'
  // },
  {
    id: 'M_heart-hic',
    name: 'Heart Hi-C',
    label: 'Heart Hi-C',
    type: 'HicTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_heart.hic'
  },

  // {
  //   id: 'M_kidney-hic',
  //   name: 'Kidney Hi-C',
  //   label: 'Kidney Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_kidney.hic'
  // },
  // {
  //   id: 'M_liver-hic',
  //   name: 'Liver Hi-C',
  //   label: 'Liver Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_liver.hic'
  // },
  // {
  //   id: 'M_lung-hic',
  //   name: 'Lung Hi-C',
  //   label: 'Lung Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_lung.hic'
  // },
  // {
  //   id: 'M_muscle-hic',
  //   name: 'Muscle Hi-C',
  //   label: 'Muscle Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_muscle.hic'
  // },
  // {
  //   id: 'M_pancreas-hic',
  //   name: 'Pancreas Hi-C',
  //   label: 'Pancreas Hi-C',
  //   type: 'HicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic/M_pancreas.hic'
  // },
  // compaprtments
  // compartments
  // {
  //   "id": "M_artery.compartments.bed.gz",
  //   "name": "Artery Compartments",
  //   "label": "Artery Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_artery.compartments_E1.bigwig",
  //   "posColor": organColors.artery
  // },
  // {
  //   "id": "M_brain.compartments.bed.gz",
  //   "name": "Brain Compartments",
  //   "label": "Brain Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_brain.compartments_E1.bigwig",
  //   "posColor": organColors.brain
  // },
  // {
  //   "id": "M_colon.compartments.bed.gz",
  //   "name": "Colon Compartments",
  //   "label": "Colon Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_colon.compartments_E1.bigwig",
  //   "posColor": organColors.colon
  // },
  // {
  //   "id": "M_heart.compartments.bed.gz",
  //   "name": "Heart Compartments",
  //   "label": "Heart Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_heart.compartments_E1.bigwig",
  //   "posColor": organColors.heart
  // },
  // {
  //   "id": "M_kidney.compartments.bed.gz",
  //   "name": "Kidney Compartments",
  //   "label": "Kidney Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_kidney.compartments_E1.bigwig",
  //   "posColor": organColors.kidney
  // },
  // {
  //   "id": "M_liver.compartments.bed.gz",
  //   "name": "Liver Compartments",
  //   "label": "Liver Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_liver.compartments_E1.bigwig",
  //   "posColor": organColors.liver
  // },
  // {
  //   "id": "M_lung.compartments.bed.gz",
  //   "name": "Lung Compartments",
  //   "label": "Lung Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_lung.compartments_E1.bigwig",
  //   "posColor": organColors.lung
  // },
  // {
  //   "id": "M_muscle.compartments.bed.gz",
  //   "name": "Muscle Compartments",
  //   "label": "Muscle Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_muscle.compartments_E1.bigwig",
  //   "posColor": organColors.muscle
  // },
  // {
  //   "id": "M_pancreas.compartments.bed.gz",
  //   "name": "Pancreas Compartments",
  //   "label": "Pancreas Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_pancreas.compartments_E1.bigwig",
  //   "posColor": organColors.pancreas
  // },
  // {
  //   "id": "M_stomach.compartments.bed.gz",
  //   "name": "Stomach Compartments",
  //   "label": "Stomach Compartments",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/compartments/M_stomach.compartments_E1.bigwig",
  //   "posColor": organColors.stomach
  // },

  // // insulation score
  // {
  //   "id": "M_artery.insulation_score.bigwig",
  //   "name": "Artery Insulation Score",
  //   "label": "Artery Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_artery.insulation_score.bigwig",
  //   "posColor": organColors.artery
  // },
  // {
  //   "id": "M_brain.insulation_score.bigwig",
  //   "name": "Brain Insulation Score",
  //   "label": "Brain Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_brain.insulation_score.bigwig",
  //   "posColor": organColors.brain
  // },
  // {
  //   "id": "M_colon.insulation_score.bigwig",
  //   "name": "Colon Insulation Score",
  //   "label": "Colon Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_colon.insulation_score.bigwig",
  //   "posColor": organColors.colon
  // },
  // {
  //   "id": "M_heart.insulation_score.bigwig",
  //   "name": "Heart Insulation Score",
  //   "label": "Heart Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_heart.insulation_score.bigwig",
  //   "posColor": organColors.heart
  // },
  // {
  //   "id": "M_kidney.insulation_score.bigwig",
  //   "name": "Kidney Insulation Score",
  //   "label": "Kidney Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_kidney.insulation_score.bigwig",
  //   "posColor": organColors.kidney
  // },
  // {
  //   "id": "M_liver.insulation_score.bigwig",
  //   "name": "Liver Insulation Score",
  //   "label": "Liver Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_liver.insulation_score.bigwig",
  //   "posColor": organColors.liver
  // },
  // {
  //   "id": "M_lung.insulation_score.bigwig",
  //   "name": "Lung Insulation Score",
  //   "label": "Lung Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_lung.insulation_score.bigwig",
  //   "posColor": organColors.lung
  // },
  // {
  //   "id": "M_muscle.insulation_score.bigwig",
  //   "name": "Muscle Insulation Score",
  //   "label": "Muscle Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_muscle.insulation_score.bigwig",
  //   "posColor": organColors.muscle
  // },
  // {
  //   "id": "M_pancreas.insulation_score.bigwig",
  //   "name": "Pancreas Insulation Score",
  //   "label": "Pancreas Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_pancreas.insulation_score.bigwig",
  //   "posColor": organColors.pancreas
  // },
  // {
  //   "id": "M_stomach.insulation_score.bigwig",
  //   "name": "Stomach Insulation Score",
  //   "label": "Stomach Insulation Score",
  //   "type": "CompTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/insulation_score/M_stomach.insulation_score.bigwig",
  //   "posColor": organColors.stomach
  // },

  // // domain boundary
  // {
  //   "id": "M_artery.domain_boundaries.bed.gz",
  //   "name": "Artery Domain Boundaries",
  //   "label": "Artery Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_artery.domain_boundaries.bed.gz",
  //   "posColor": organColors.artery
  // },
  // {
  //   "id": "M_brain.domain_boundaries.bed.gz",
  //   "name": "Brain Domain Boundaries",
  //   "label": "Brain Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_brain.domain_boundaries.bed.gz",
  //   "posColor": organColors.brain
  // },
  // {
  //   "id": "M_colon.domain_boundaries.bed.gz",
  //   "name": "Colon Domain Boundaries",
  //   "label": "Colon Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_colon.domain_boundaries.bed.gz",
  //   "posColor": organColors.colon
  // },
  // {
  //   "id": "M_heart.domain_boundaries.bed.gz",
  //   "name": "Heart Domain Boundaries",
  //   "label": "Heart Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_heart.domain_boundaries.bed.gz",
  //   "posColor": organColors.heart
  // },
  // {
  //   "id": "M_kidney.domain_boundaries.bed.gz",
  //   "name": "Kidney Domain Boundaries",
  //   "label": "Kidney Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_kidney.domain_boundaries.bed.gz",
  //   "posColor": organColors.kidney
  // },
  // {
  //   "id": "M_liver.domain_boundaries.bed.gz",
  //   "name": "Liver Domain Boundaries",
  //   "label": "Liver Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_liver.domain_boundaries.bed.gz",
  //   "posColor": organColors.liver
  // },
  // {
  //   "id": "M_lung.domain_boundaries.bed.gz",
  //   "name": "Lung Domain Boundaries",
  //   "label": "Lung Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_lung.domain_boundaries.bed.gz",
  //   "posColor": organColors.lung
  // },
  // {
  //   "id": "M_muscle.domain_boundaries.bed.gz",
  //   "name": "Muscle Domain Boundaries",
  //   "label": "Muscle Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_muscle.domain_boundaries.bed.gz",
  //   "posColor": organColors.muscle
  // },
  // {
  //   "id": "M_pancreas.domain_boundaries.bed.gz",
  //   "name": "Pancreas Domain Boundaries",
  //   "label": "Pancreas Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_pancreas.domain_boundaries.bed.gz",
  //   "fill": organColors.pancreas
  // },
  // {
  //   "id": "M_stomach.domain_boundaries.bed.gz",
  //   "name": "Stomach Domain Boundaries",
  //   "label": "Stomach Domain Boundaries",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/domain_boundary/M_stomach.domain_boundaries.bed.gz",
  //   "posColor": organColors.stomach
  // },

  // chromatin loops
  // {
  //   "id": "M_artery.chromatin_loops.bed.gz",
  //   "name": "Artery Chromatin Loops",
  //   "label": "Artery Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_artery.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_brain.chromatin_loops.bed.gz",
  //   "name": "Brain Chromatin Loops",
  //   "label": "Brain Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_brain.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_colon.chromatin_loops.bed.gz",
  //   "name": "Colon Chromatin Loops",
  //   "label": "Colon Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_colon.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_heart.chromatin_loops.bed.gz",
  //   "name": "Heart Chromatin Loops",
  //   "label": "Heart Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_heart.chromatin_loops.bed.gz",
  //   "lineColor": organColors.heart,
  //   "areaColor": organColors.heart
  // },
  {
    id: "M_heart_CTCF.RPKM.bigwig",
    name: "Heart CTCF RPKM",
    label: "Heart CTCF RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/M_heart_CTCF.RPKM.bigwig",
    posColor: organColors.heart,
    flip: true
  },
  {
    id: "M_heart_H3K27ac.RPKM.bigwig",
    name: "Heart H3K27ac RPKM",
    label: "Heart H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/M_heart_H3K27ac.RPKM.bigwig",
    posColor: organColors.heart,
    flip: true
  },
  // {
  //   "id": "M_kidney.chromatin_loops.bed.gz",
  //   "name": "Kidney Chromatin Loops",
  //   "label": "Kidney Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_kidney.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_liver.chromatin_loops.bed.gz",
  //   "name": "Liver Chromatin Loops",
  //   "label": "Liver Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_liver.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_lung.chromatin_loops.bed.gz",
  //   "name": "Lung Chromatin Loops",
  //   "label": "Lung Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_lung.chromatin_loops.bed.gz",
  //   "areaColor": organColors.lung,
  //   "lineColor": organColors.lung
  // },
  {
    id: "M_lung_CTCF.RPKM.bigwig",
    name: "Lung CTCF RPKM",
    label: "Lung CTCF RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/M_lung_CTCF.RPKM.bigwig",
    posColor: organColors.lung,
    flip: true
  },
  {
    id: "M_lung_H3K27ac.RPKM.bigwig",
    name: "Lung H3K27ac RPKM",
    label: "Lung H3K27ac RPKM",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/chipseq/M_lung_H3K27ac.RPKM.bigwig",
    posColor: organColors.lung,
    flip: true
  },
  // {
  //   "id": "M_muscle.chromatin_loops.bed.gz",
  //   "name": "Muscle Chromatin Loops",
  //   "label": "Muscle Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_muscle.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_pancreas.chromatin_loops.bed.gz",
  //   "name": "Pancreas Chromatin Loops",
  //   "label": "Pancreas Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_pancreas.chromatin_loops.bed.gz",
  // },
  // {
  //   "id": "M_stomach.chromatin_loops.bed.gz",
  //   "name": "Stomach Chromatin Loops",
  //   "label": "Stomach Chromatin Loops",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/hic_loops/M_stomach.chromatin_loops.bed.gz",
  // },
  // // RNA-seq Tracks
  {
    id: "artery_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
    name: "Artery Rep2 Forward RPKM Signal",
    label: "Artery Rep2 Forward RPKM Signal",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_artery_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
    posColor: organColors.artery
  },
  {
    id: "artery_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
    name: "Artery Rep2 Reverse RPKM Signal",
    label: "Artery Rep2 Reverse RPKM Signal",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_artery_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
    posColor: organColors.artery
  },
  {
    id: "brain_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
    name: "Brain Rep1 Forward RPKM Signal",
    label: "Brain Rep1 Forward RPKM Signal",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_brain_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
    posColor: organColors.brain
  },
  {
    id: "brain_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
    name: "Brain Rep1 Reverse RPKM Signal",
    label: "Brain Rep1 Reverse RPKM Signal",
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_brain_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
    posColor: organColors.brain
  },
  {
    id: "brain_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
    name: "Brain Rep2 Forward RPKM Signal",
    label: "Brain Rep2 Forward RPKM Signal", 
    type: "CompTrack",
    url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_brain_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
    posColor: organColors.brain
  },
  // {
  //   id: "brain_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Brain Rep2 Reverse RPKM Signal",
  //   label: "Brain Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_brain_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.brain
  // },
  // {
  //   id: "colon_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Colon Rep1 Forward RPKM Signal",
  //   label: "Colon Rep1 Forward RPKM Signal",
  //   type: "CompTrack", 
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_colon_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.colon
  // },
  // {
  //   id: "colon_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Colon Rep1 Reverse RPKM Signal",
  //   label: "Colon Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_colon_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.colon
  // },
  // {
  //   id: "colon_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Colon Rep2 Forward RPKM Signal",
  //   label: "Colon Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_colon_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.colon
  // },
  // {
  //   id: "colon_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig", 
  //   name: "Colon Rep2 Reverse RPKM Signal",
  //   label: "Colon Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_colon_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.colon
  // },
  // {
  //   id: "heart_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Heart Rep1 Forward RPKM Signal",
  //   label: "Heart Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_heart_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.heart
  // },
  // {
  //   id: "heart_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Heart Rep1 Reverse RPKM Signal",
  //   label: "Heart Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_heart_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.heart
  // },
  // {
  //   id: "heart_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Heart Rep2 Forward RPKM Signal",
  //   label: "Heart Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_heart_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.heart
  // },
  // {
  //   id: "heart_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Heart Rep2 Reverse RPKM Signal",
  //   label: "Heart Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_heart_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.heart
  // },
  // {
  //   id: "kidney_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Kidney Rep1 Forward RPKM Signal",
  //   label: "Kidney Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_kidney_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.kidney
  // },
  // {
  //   id: "kidney_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Kidney Rep1 Reverse RPKM Signal",
  //   label: "Kidney Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_kidney_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.kidney
  // },
  // {
  //   id: "kidney_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Kidney Rep2 Forward RPKM Signal",
  //   label: "Kidney Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_kidney_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.kidney
  // },
  // {
  //   id: "kidney_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Kidney Rep2 Reverse RPKM Signal",
  //   label: "Kidney Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_kidney_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.kidney
  // },
  // {
  //   id: "liver_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Liver Rep1 Forward RPKM Signal",
  //   label: "Liver Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_liver_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.liver
  // },
  // {
  //   id: "liver_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Liver Rep1 Reverse RPKM Signal",
  //   label: "Liver Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_liver_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.liver
  // },
  // {
  //   id: "liver_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Liver Rep2 Forward RPKM Signal",
  //   label: "Liver Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_liver_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.liver
  // },
  // {
  //   id: "liver_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Liver Rep2 Reverse RPKM Signal",
  //   label: "Liver Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_liver_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.liver
  // },
  // {
  //   id: "lung_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Lung Rep1 Forward RPKM Signal",
  //   label: "Lung Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_lung_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.lung
  // },
  // {
  //   id: "lung_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Lung Rep1 Reverse RPKM Signal",
  //   label: "Lung Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_lung_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.lung
  // },
  // {
  //   id: "lung_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Lung Rep2 Forward RPKM Signal",
  //   label: "Lung Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_lung_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.lung
  // },
  // {
  //   id: "lung_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Lung Rep2 Reverse RPKM Signal",
  //   label: "Lung Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_lung_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.lung
  // },
  // {
  //   id: "muscle_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Muscle Rep1 Forward RPKM Signal",
  //   label: "Muscle Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_muscle_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.muscle
  // },
  // {
  //   id: "muscle_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Muscle Rep1 Reverse RPKM Signal",
  //   label: "Muscle Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_muscle_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.muscle
  // },
  // {
  //   id: "muscle_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Muscle Rep2 Forward RPKM Signal",
  //   label: "Muscle Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_muscle_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.muscle
  // },
  // {
  //   id: "muscle_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Muscle Rep2 Reverse RPKM Signal",
  //   label: "Muscle Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_muscle_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.muscle
  // },
  // {
  //   id: "pancreas_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Pancreas Rep1 Forward RPKM Signal",
  //   label: "Pancreas Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_pancreas_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.pancreas
  // },
  // {
  //   id: "pancreas_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Pancreas Rep1 Reverse RPKM Signal",
  //   label: "Pancreas Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_pancreas_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.pancreas
  // },
  // {
  //   id: "pancreas_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Pancreas Rep2 Forward RPKM Signal",
  //   label: "Pancreas Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_pancreas_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.pancreas
  // },
  // {
  //   id: "pancreas_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Pancreas Rep2 Reverse RPKM Signal",
  //   label: "Pancreas Rep2 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_pancreas_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.pancreas
  // },
  // {
  //   id: "stomach_rep1_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Stomach Rep1 Forward RPKM Signal",
  //   label: "Stomach Rep1 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_stomach_rna_rep1.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.stomach
  // },
  // {
  //   id: "stomach_rep1_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Stomach Rep1 Reverse RPKM Signal",
  //   label: "Stomach Rep1 Reverse RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_stomach_rna_rep1.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  //   posColor: organColors.stomach
  // },
  // {
  //   id: "stomach_rep2_forward.mapped.srt.ndp.q20.RPKM.bigwig",
  //   name: "Stomach Rep2 Forward RPKM Signal",
  //   label: "Stomach Rep2 Forward RPKM Signal",
  //   type: "CompTrack",
  //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_stomach_RNA_rep2.aligned.filtered.SortByCoord.forward.RPKM.bw",
  //   posColor: organColors.stomach
  // },
  // // {
  // //   id: "stomach_rep2_reverse.mapped.srt.ndp.q20.RPKM.bigwig",
  // //   name: "Stomach Rep2 Reverse RPKM Signal",
  // //   label: "Stomach Rep2 Reverse RPKM Signal",
  // //   type: "CompTrack",
  // //   url: "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/m3d/rnaseq/M_stomach_RNA_rep2.aligned.filtered.SortByCoord.reverse.RPKM.bw",
  // //   posColor: organColors.stomach
  // // // }
];
  
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
    asm.value.initPos = {
      chrom: regions.human.chrom,
      start: regions.human.start,
      end: regions.human.end
    }
  
    const humanGap = regions.human.end - regions.human.start
    highlightRegionHuman.value = {
      chrom: regions.human.chrom,
      start: regions.human.start + humanGap * 0.25,
      end: regions.human.start + humanGap * 0.75,
    }
  
    // 更新小鼠数据
    const MonkeyGap = regions.Monkey.end - regions.Monkey.start
    highlightRegionMonkey.value = {
      chrom: regions.Monkey.chrom,
      start: regions.Monkey.start,
      end: regions.Monkey.end
    }
  
    asmMonkey.value.initPos = {
      chrom: regions.Monkey.chrom,
      start: regions.Monkey.start - MonkeyGap * 0.5,
      end: regions.Monkey.end + MonkeyGap * 0.5
    }
  
    // 重新加载浏览器
    loadHumanBrowser()
    loadMonkeyBrowser()
  
    // 更新keys触发重新渲染
    HumanBrowserKey.value++
    MonkeyBrowserKey.value++
  }
  
  const link_human_Monkey = [
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
    updateRegions
  })
  </script>