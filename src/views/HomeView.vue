<template>
    <n-card class="mb-6">
 
   </n-card>
     <ExpressoVue
       id="testID"
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
       initPos: {
         chrom: 'chr1',
         start: 1191800,
         end: 1551591
       }//,
       // chromBands: chromBands
     }
 
 
     const tracksInfo = [{
     id: 'hg38-genome-sequence',
     name: 'Hg38 sequence',
     label: 'Hg38 sequence',
     type: 'SeqTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/GRCm38.primary_assembly.genome.fa'
   },
   {
     id: 'hg38-ucsc-gene-annotation-chromatin-interactions',
     name: 'UCSC Gene annotation',
     label: 'UCSC Gene annotation',
     type: 'GeneTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
   },
   {
   id: 'GM12878 triangle-heatmap',
   name: 'triangle-heatmap',
   label: 'triangle-heatmap',
   type: 'HicTrack',
   url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.contact_matrix.hic',
   display: 'triangle'
 },
   {
     id: 'Compartments',
     name: 'Compartments',
     label: 'Compartments',
     type: 'CompTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.compartments_E1.bigwig'
   },
   {
     id: 'Contact domains',
     name: 'Contact domains',
     label: 'Contact domains',
     type: 'DomainTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.contact_domains.bed.gz'
   },  
   {
     id: 'Domain boundaries',
     name: 'Domain boundarie',
     label: 'Domain boundarie',
     type: 'SclsTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.domain_boundaries.bed.gz',
   }, 
  //  {
  //    id: 'Insulation score',
  //    name: 'Insulation score',
  //    label: 'Insulation score',
  //    type: 'LineGTrack',
  //    url:'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.insulation_score.bigwig',
  //    positiveE1Color: 'orange',
  //    negativeE1Color: 'green'
  //  },
   {
   id: 'GM12878 dot plot',
   name: 'GM12878 dot plot',
   label: 'GM12878 dot plot',
   type: 'DotTrack',
   url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.chromatin_loops.bed.gz'
   },
   {
     id: 'GM12878-RNAPII-ChIA-PET-Curve-style2',
     name: 'GM12878 RNAPII ChIA PET Curve2',
     label: 'GM12878 RNAPII ChIA PET Curve2',
     type: 'CurvTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.chromatin_loops.bed.gz',
     style: 'basicCurve'
   },  
   {
   id: 'GM12878 netowrk',
   name: 'GM12878 netowrk',
   label: 'GM12878 netowrk',
   type: 'NetworkTrack',
   url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.chromatin_loops.bed.gz'
   },
   {
   id: 'GM12878 stripes',
   name: 'GM12878 stripes',
   label: 'GM1287 stripes',
   type: 'StripeTrack',
   url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/hic/GSM4417586/GSM4417586.stripes.bed.gz'
   },
  //  {
  //  id: 'GM12878 stripes2',
  //  name: 'GM12878 stripes',
  //  label: 'GM1287 stripes',
  //  type: 'StripeTrack',
  //  url: 'http://47.107.91.5/data/stripes/stripenn_result_srt.bed.gz'
  //  },
  //  {
  //  id: 'GM12878 copy number',
  //  name: 'GM12878 copy number',
  //  label: 'GM12878 copy number',
  //  type: 'CnvTrack',
  //  url: 'http://47.107.91.5/data/cnv/sorted_extended_mock_data.bed.gz'
  //  },
  //  {
  //    id: 'Brain_Cortex eqtl',
  //    name: 'Brain_Cortex eqtl',
  //    label: 'Brain_Cortex eqtl',
  //    type: 'PclsTrack',
  //    url: 'http://47.107.91.5/data/eqtl/gene_snv_pairs/Brain_Cortex.bed.gz',
  //    style: 'block'
  //  },

  //  {
  //    id: 'GM12878 RNAPII ChIA-PET 1D coverage',
  //    name: 'GM12878 RNAPII ChIA-PET 1D coverage',
  //    label: 'GM12878 RNAPII ChIA-PET 1D coverage',
  //    type: 'LineGTrack',
  //    url: 'http://47.107.91.5/data/3D_bigwig/ENCFF085KDA.bigWig'
  //  },
  {
     id: 'PCAWG DEL',
     name: 'PCAWG DEL',
     label: 'PCAWG DEL',
     type: 'CnvTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/pcawg/sv/pcawg_merged_sv_DEL.less10Mb.bed.gz',
   },
   {
     id: 'PCAWG DUP',
     name: 'PCAWG DUP',
     label: 'PCAWG DUP',
     type: 'SclsTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/pcawg/sv/pcawg_merged_sv_DUP.less10Mb.bed.gz',
   }, 
   {
     id: 'PCAWG Translocation',
     name: 'PCAWG Translocation',
     label: 'PCAWG Translocation',
     type: 'PclsTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/pcawg/sv/translocation/pcawg_sv_TRA_Biliary-AdenoCA_washU.bed.gz',
    //  style: 'rectCurve'
   },
   {
     id: 'PCAWG t2tINV',
     name: 'PCAWG t2tINV',
     label: 'PCAWG t2tINV',
     type: 'CurvTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/pcawg/sv/t2tINV/pcawg_sv_t2tINV_Liver-HCC_washU.bed.gz',
     style: 'rectCurve',
     areaColor: 'white'
   },
   {
     id: 'PCAWG h2hINV',
     name: 'PCAWG h2hINV',
     label: 'PCAWG t2tINV',
     type: 'CurvTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/pcawg/sv/h2hINV/pcawg_sv_h2hINV_Liver-HCC_washU.bed.gz',
     style: 'rectCurve',
     areaColor: 'white'
   },
   {
     id: 'PCAWG snv',
     name: 'PCAWG snv',
     label: 'PCAWG snv',
     type: 'SclsTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/pcawg/snv/Biliary-AdenoCA.reformatted.bed.gz',
   },
   {
     id: 'eqtl',
     name: 'eqtl',
     label: 'eqtl',
     type: 'PclsTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/eqtl/Adipose_Subcutaneous.bed.gz',
   },
   {
     id: 'gwas',
     name: 'gwas',
     label: 'gwas',
     type: 'SnpTrack',
     url: 'https://genome3d.oss-cn-shenzhen.aliyuncs.com/gwas/Finn_GWAS_srt.txt.gz',
   }
   // {
   //   id: 'GM12878-RNAPII-ChIA-PET-Network',
   //   name: 'GM12878 RNAPII ChIA PET Network',
   //   label: 'GM12878 RNAPII ChIA PET Network',
   //   type: 'NetworkTrack',
   //   url: 'http://47.107.91.5/data/3D_loops/ENCFF040KUS_WashU.bed.gz',
   //   style: 'network'
   // }
 ]
   
     </script>
     <style>
     </style>