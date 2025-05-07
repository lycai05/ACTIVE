<template>
    <n-card class="mb-6">
  
   </n-card>
     <ExpressoVue
       id="testID2"
      :assembly="asm"
       :tracksInfo="tracksInfo"
     ></ExpressoVue>
  
  </template>
  <script setup lang="ts"> 
  import ExpressoVue from "@/browser/elements/Expresso/ExpressoVue.vue"
  
     let asm = 
      {
       label: 'hg38',
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
       initPos: [
      {
        chrom: 'chr1',
        start: 22790000,
        end: 26290000
      }]
     }
  
  
     const tracksInfo = [
     {
     id: 'chromview',
    name: '',
    label: '',
    type: 'ChromTrack'
  },
  
  {
        id: 'mESC HiChIP',
        name: 'mESC HiChIP',
        label: 'mESC HiChIP',
        type: 'HicTrack',
        url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mESC_hi_27ac.hic'
      },
  {
        id: 'Epi1 Hi-C Contact matrix',
        name: 'Epi1 Hi-C Contact matrix',
        label: 'Epi1 Hi-C Contact matrix',
        type: 'HicTrack',
        url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi1/Epi1.contact_matrix.hic'
      },
   {
   id: 'Epi1 Hi-C Compartments ',
   name: 'Epi1 Hi-C Compartments',
   label: 'Epi1 Hi-C Compartments',
   type: 'CompTrack',
   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi1/Epi1.compartments_E1.bigwig'
  },
  {
   id: 'Epi2 Hi-C Compartments ',
   name: 'Epi2 Hi-C Compartments',
   label: 'Epi2 Hi-C Compartments',
   type: 'CompTrack',
   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi2/Epi2.compartments_E1.bigwig'
  },
  {
   id: 'mE1 Hi-C Compartments ',
   name: 'mE1 Hi-C Compartments',
   label: 'mE1 Hi-C Compartments',
   type: 'CompTrack',
   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE1/mE1.compartments_E1.bigwig'
  },
  {
   id: 'mE2 Hi-C Compartments ',
   name: 'mE2 Hi-C Compartments',
   label: 'mE2 Hi-C Compartments',
   type: 'CompTrack',
   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE2/mE2.compartments_E1.bigwig'
  },
    {
       id: 'Epi1 HiC Chromatin loops',
       name: 'Epi1 HiC Chromatin loops',
       label: 'Epi1 HiC Chromatin loops',
       type: 'CurvTrack',
       url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi1/Epi1.chromatin_loops.bed.gz'
    },
    {
       id: 'Epi2 HiC Chromatin loops',
       name: 'Epi2 HiC Chromatin loops',
       label: 'Epi2 HiC Chromatin loops',
       type: 'CurvTrack',
       url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi2/Epi2.chromatin_loops.bed.gz'
    },
    // {
    //     id: 'Epi1 RIC1 inter',
    //     name: 'Epi1 RIC1 inter',
    //     label: 'Epi1 RIC1 inter',
    //     type: 'CurvTrack',
    //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Diff_RIC1_combined_inter_clusters.bed.gz'
    //   },
      {
        id: 'Epi1 RIC1 intra',
        name: 'Epi1 RIC1 intra',
        label: 'Epi1 RIC1 intra',
        type: 'CurvTrack',
        url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Diff_RIC1_combined_intra_clusters.bed.gz'
      },
    //   {
    //     id: 'Epi1 RIC1 inter2',
    //     name: 'Epi1 RIC1 inter',
    //     label: 'Epi1 RIC1 inter',
    //     type: 'PclsTrack',
    //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Diff_RIC1_combined_inter_clusters.bed.gz'
    //   },
      {
        id: 'Epi1 RIC1 intra2',
        name: 'Epi1 RIC1 intra',
        label: 'Epi1 RIC1 intra',
        type: 'PclsTrack',
        url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Diff_RIC1_combined_intra_clusters.bed.gz'
      },
    // {
    //    id: 'Epi1 HiC Chromatin loops 2',
    //    name: 'Epi1 HiC Chromatin loops 2',
    //    label: 'Epi1 HiC Chromatin loops 2',
    //    type: 'PclsTrack',
    //    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi1/Epi1.chromatin_loops.bed.gz'
    // },
    // {
    //     id: 'Epi1 HiC Contact domains',
    //     name: 'Epi1 HiC Contact domains',
    //     label: 'Epi1 HiC Contact domains',
    //     type: 'DomainTrack',
    //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi1/Epi1.contact_domains.bed.gz'
    //   },
    //   {
    //     id: 'Epi2 HiC Contact domains',
    //     name: 'Epi2 HiC Contact domains',
    //     label: 'Epi2 HiC Contact domains',
    //     type: 'DomainTrack',
    //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/Epi2/Epi2.contact_domains.bed.gz'
    //   },
      // {
      //   id: 'mE1 Hi-C Contact matrix',
      //   name: 'mE1 Hi-C Contact matrix',
      //   label: 'mE1 Hi-C Contact matrix',
      //   type: 'HicTrack',
      //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE1/mE1.contact_matrix.hic'
      // },
      // {
      //   id: 'mE2 Hi-C Contact matrix',
      //   name: 'mE2 Hi-C Contact matrix',
      //   label: 'mE2 Hi-C Contact matrix',
      //   type: 'HicTrack',
      //   url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE2/mE2.contact_matrix.hic'
      // },
  
    {
       id: 'mE1 HiC Chromatin loops',
       name: 'mE1 HiC Chromatin loops',
       label: 'mE1 HiC Chromatin loops',
       type: 'CurvTrack',
       url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE1/mE1.chromatin_loops.bed.gz'
    },
    {
       id: 'mE2 HiC Chromatin loops',
       name: 'mE2 HiC Chromatin loops',
       label: 'mE2 HiC Chromatin loops',
       type: 'CurvTrack',
       url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE2/mE2.chromatin_loops.bed.gz'
    },
    // {
    //    id: 'mE1 HiC Chromatin loops 2',
    //    name: 'mE1 HiC Chromatin loops 2',
    //    label: 'mE1 HiC Chromatin loops 2',
    //    type: 'PclsTrack',
    //    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE1/mE1.chromatin_loops.bed.gz'
    // },
    // {
    //     id: 'mE1 HiC Contact domains',
    //     name: 'mE1 HiC Contact domains',
    //     label: 'mE1 HiC Contact domains',
    //     type: 'DomainTrack',
    //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE1/mE1.contact_domains.bed.gz'
    //   },
    //   {
    //     id: 'mE2 HiC Contact domains',
    //     name: 'mE2 HiC Contact domains',
    //     label: 'mE2 HiC Contact domains',
    //     type: 'DomainTrack',
    //     url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/mE2/mE2.contact_domains.bed.gz'
    //   },
      {
       id: 'mE1 specific Chromatin loops',
       name: 'mE1 specific Chromatin loops',
       label: 'mE1 specific Chromatin loops',
       type: 'CurvTrack',
       url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/diff_loops/sigUpReg_tier1.bed.gz'
    },
    {
       id: 'Epi2 specific Chromatin loops',
       name: 'Epi2 specific Chromatin loops',
       label: 'Epi2 specific Chromatin loops',
       type: 'CurvTrack',
       url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/ruixin/diff_loops/sigDownReg_tier1.bed.gz'
    },
    ]
   
     </script>
     <style>
     </style>