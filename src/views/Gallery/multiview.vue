<template>
    <n-card class="mb-6">
  
   </n-card>
     <ExpressoVue
       id="Mfas6"
      :assembly="asm"
       :tracksInfo="tracksInfo"
     ></ExpressoVue>
  
  </template>
  <script setup lang="ts"> 
  import ExpressoVue from "@/browser/elements/Expresso/ExpressoVue.vue"

  let asm = {
  label: 'hg38',
  chromSizes: {
    "chrY": 59373566,
         "chrX": 155270560,
         "chr13": 115169878,
         "chr12": 133851895,
         "chr11": 135006516,
         "chr10": 135534747,
         "chr17": 81195210,
         "chr16": 90354753,
         "chr15": 102531392,
         "chr14": 107349540,
         "chr19": 59128983,
         "chr18": 78077248,
         "chrM": 16571,
         "chr22": 51304566,
         "chr20": 63025520,
         "chr21": 48129895,
         "chr7": 159138663,
         "chr6": 171115067,
         "chr5": 180915260,
         "chr4": 191154276,
         "chr3": 198022430,
         "chr2": 243199373,
         "chr1": 249250621,
         "chr9": 141213431,
         "chr8": 146364022
  },
  initPos: [{
    chrom: 'chr14',
    start: 1,
    end: 97560031
  },//chr14:1-97,560,031
  {
    chrom: 'chr15',
    start: 1,
    end: 97560031
  },
  {
    chrom: 'chr16',
    start: 1,
    end: 97560031
  },
  // {
  //   chrom: 'chr17',
  //   start: 1,
  //   end: 63257400
  // },
  // {
  //   chrom: 'chr2',
  //   start: 33790000,
  //   end: 36290000
  // }
]
};
  
  
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
  //   name: '',
  //   label: 'k562 matrix',
  //   type: 'MrhicTrack',
  //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.contact_matrix.hic'
  // },
  // {
  //   "id": "k562 loops",
  //   "name": "",
  //   "label": "k562 loops",
  //   "type": "PclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz",
  //   // "lineColor": organColors.heart,
  //   // "areaColor": organColors.heart
  // },

  // {
  //   "id": "k562 anchors",
  //   "name": "k562 anchors",
  //   "label": "k562 anchors",
  //   "type": "SclsTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz",
  //   // "lineColor": organColors.heart,
  //   // "areaColor": organColors.heart
  // },
  // {
  //   "id": "k562 curves",
  //   "name": "",
  //   "label": "k562 curves",
  //   "type": "CurvTrack",
  //   "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186/GSM7656192_GSM7656191_GSM7656190_GSM7656189_GSM7656188_GSM7656187_GSM7656186.chromatin_loops.bed.gz",
  //   // "lineColor": organColors.heart,
  //   // "areaColor": organColors.heart
  // },
  {
    "id": "k562 ChIA-PET bigwig",
    "name": "",
    "label": "k562 ChIA-PET bigwig",
    "type": "CompTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/GSM5379463/GSM5379463.bigwig",
    // "lineColor": organColors.heart,
    // "areaColor": organColors.heart
    flip: true
  },
  //{
    //"id": "LNCap Pore-C clusters",
    //"name": "LNCap Pore-C clusters",
    //"label": "LNCap Pore-C clusters",
    //"type": "MclsTrack",
  //  "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/browser/porec/GSM5923735_LNCaP_Set1_18hour.srt.bed.gz",
    // "lineColor": organColors.heart,
    // "areaColor": organColors.heart
  //},
  {
    "id": "Gm12878 Pore-C inter clusters",
    "name": "Gm12878 Pore-C inter clusters",
    "label": "Gm12878 Pore-C inter clusters",
    "type": "PclsTrack",
    "url": "https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/porec/gm12878/gm12878_interchrom_interactions.bed.gz",
    // "lineColor": organColors.heart,
    // "areaColor": organColors.heart
    'sortBy': 'position'
  },
];
   
     </script>
     <style>
     </style>