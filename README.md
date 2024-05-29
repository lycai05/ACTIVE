# EXPRESSO
EXPRESSO (EXPloration of Regulatory Epigenome with Spatial and Sequence Observations) is a platform to visualize and explore the non-coding mutations contributing to deregulation of cis-regulatory elements. Noncoding regulatory sequences, particularly enhancers and promoters, are key determinants of tissue-specific gene expression. Multiple mutation types have been reported to disrupt enhancers and promoters and expression of their target genes, including single-nucleotide variants (SNVs), small insertion and deletions (indels), and large structural variants (SVs). EXPRESSO has the following features:
- Provided expresso.js, a genome browser to explore and visualize multi-omics datasets, which can visualize both 3D genomic data and genetic datasets.
- Intergrated 299,740,245 transcription-associated chromatin interactions from 78 cancer and 60 non-cancer cell types. Each cell line contains individual web page of track view and tabular view.
- Annotated 1,886,345 cancer-associated anchor promoter and enhancers using ATAC-seq datasets from TCGA, as well as 1,543,335 noncoding somatic SNVs and 37,374 SVs from from PCWAG whole genome sequencing datasets, to visualize and explore the non-coding mutations contributing to deregulation of cis-regulatory elements.

## Contents
- [Examples](#examples)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)

## Examples
- [Chromatin interactions]()
 - Visualize chromatin loops using curves, dots and networks
- [Contact maps]()
  - Visualize contact matrix, contact domains
- [Stripes]()
  - Visulize architectural stripes
- [Multiplexing]()
  - Visualize multiplexing data like Sprites
- [Structural variations]()
  - Visualize duplication, deletion, insersion, indels
- [Single nucleotide variants and Qtls]()
  - Visualize GWAS snps, Eqtls

## Installation
#### Option 1. Use public version
We hosted a instance of basic browser at [](), we also hosted XX ~ 700 processed files on the cloud.

#### Option 2. Docker version

- Step 1: Install Docker
Please refer to Docker official website to install Docker on Windows or Mac

- Step 2: Download the Dockerfile and build the Docker Image
```
docker build -t Dockerfile .
```

- Step 3: Run the Docker container
```
docker run -p 8080:80 expresso
```

Then you can access expresso through http://localhost:8080.

- Step 4: Load tracks through a config file.

#### Option 2. Vue component
Expresso can also be used as a Vue component.
```javascript
# This will initialize a browser session using hg38 reference genome and add two user defined tracks
<template>
    <VueActiveBrowser
      id="testID"
     :assembly="asm"
      :tracksInfo="tracksInfo"
    >
    </VueActiveBrowser>
</template>
<script setup lang="ts"> 
import VueActiveBrowser from "../../../dist/active-browser.es"
import  "../../../dist/style.css"
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
    }
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
}]
```
## Usage
## Documentation
Please refer to the [wiki](https://github.com/lycai05/active-browser/wiki) page for detailed documentation.

