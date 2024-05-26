<template>
   <n-card class="mb-6">
    Use curves, clusters and networks to indicate chromatin interactions between two genomic regions

  </n-card>
    <ActiveBrowser
      id="testID"
     :assembly="asm"
      :tracksInfo="tracksInfo"
    ></ActiveBrowser>
<!-- </div> -->
</template>
    <script setup lang="ts"> 

// import 'jquery/jquery.min.js'
// import 'jquery-ui-dist/jquery-ui.min.js'
// import '../../static/js/jquery.flot.js';
// import '../../static/js/jquery.flot.downsample.js';
// import '../../static/js/jquery.flot.selection.js';
// import '../ActiveBrowser/plotCurve.js'
import ActiveBrowser from "../ActiveBrowser/ActiveBrowser.vue"
// import  "../../../dist/style.css"
// import chromBands from '../../data/chromBands.json'

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
    url: 'http://47.107.91.5/data/annotation/GRCm38.primary_assembly.genome.fa'
  },
  {
    id: 'hg38-ucsc-gene-annotation-chromatin-interactions',
    name: 'UCSC Gene annotation',
    label: 'UCSC Gene annotation',
    type: 'GeneTrack',
    url: 'http://47.107.91.5/data/annotation/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
  },
  {
    id: 'GM12878 HiC compartments',
    name: 'GM12878 HiC compartments',
    label: 'GM12878 HiC compartments',
    type: 'LineGTrack',
    url:'http://47.107.91.5/data/compartments/ENCFF713FCA.bigWig'
  },
  {
    id: 'GM12878-RNAPII-ChIA-PET-Curve-style1',
    name: 'GM12878 RNAPII ChIA PET Curve',
    label: 'GM12878 RNAPII ChIA PET Curve',
    type: 'CurvTrack',
    url: 'http://47.107.91.5/data/3D_loops/ENCFF040KUS_WashU.bed.gz',
    style: 'basicCurve'
  },  
  {
    id: 'GM12878-RNAPII-ChIA-PET-Curve-style2',
    name: 'GM12878 RNAPII ChIA PET Curve',
    label: 'GM12878 RNAPII ChIA PET Curve',
    type: 'CurvTrack',
    url: 'http://47.107.91.5/data/3D_loops/ENCFF040KUS_WashU.bed.gz',
    style: 'flatCurve'
  },  
  {
    id: 'GM12878-RNAPII-ChIA-PET-Block',
    name: 'GM12878 RNAPII ChIA PET Block',
    label: 'GM12878 RNAPII ChIA PET Block',
    type: 'PclsTrack',
    url: 'http://47.107.91.5/data/3D_loops/ENCFF040KUS_WashU.bed.gz',
    style: 'block'
  },
  {
    id: 'GM12878 RNAPII ChIA-PET 1D coverage',
    name: 'GM12878 RNAPII ChIA-PET 1D coverage',
    label: 'GM12878 RNAPII ChIA-PET 1D coverage',
    type: 'LineGTrack',
    url: 'http://47.107.91.5/data/3D_bigwig/ENCFF085KDA.bigWig'
  },
  {
  id: 'GM12878 triangle-heatmap',
  name: 'triangle-heatmap',
  label: 'triangle-heatmap',
  type: 'HicTrack',
  url: 'http://47.107.91.5/data/3D_hic/ENCFF791SUY.hic',
  display: 'triangle'
},
{
    id: 'GM12878-TADs',
    name: 'GM12878 TADs',
    label: 'GM12878 TADs',
    type: 'DomainTrack',
    url: 'http://47.107.91.5/data/tads/GM12878_TADs_srt.bed.gz',
  },  
  {
    id: 'GM12878-Topologically-associated-domains',
    name: 'Topologically associated domains',
    label: 'Topologically associated domains',
    type: 'SclsTrack',
    url: 'http://47.107.91.5/data/tads/GM12878_TADs_srt.bed.gz',
  }//, 
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