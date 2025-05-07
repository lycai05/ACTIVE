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
      <template #header-extra></template>
      <template #default>
        <component :is="HumanBrowser" v-if="HumanBrowser" :key="HumanBrowserKey" id="cross_species_human"
          :assembly="asm" :tracksInfo="tracksInfo" :highlight-region="highlightRegionHuman" :location="browserLocation"
          @update:location="handleLocationUpdate"></component>
        <div class="mb-4">
          <ExpressoLink v-if="HumanBrowser && MouseBrowser" :location1="browserLocation"
            :location2="mouseBrowserLocation" :links="link_human_mouse"></ExpressoLink>
        </div>
        <component :is="MouseBrowser" v-if="MouseBrowser" :key="MouseBrowserKey" id="cross_species_mouse"
          :assembly="asmMouse" :highlight-region="highlightRegionMouse" :tracksInfo="tracksInfoMouse"
          :location="mouseBrowserLocation" @update:location="handleMouseLocationUpdate"></component>
      </template>
      <template #footer>
      </template>
    </CardActions>
  </CardWrapper>
  <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
    <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
      title="Search genes or genomic regions" :segmented="{
						// content: true,
						footer: true
					}">
      <template #header>
        <n-h3 align-text>Search human CREs with sequence homology in mouse</n-h3>
      </template>
      <template #header-extra></template>
      <template #default>
        <n-card>
          <div class="flex justify-between">
            <div class="mb-4 flex items-center min-h-[28px]">
              <span class="text-sm font-medium text-gray-900 dark:text-white mr-3">
                Showing {{ offset + 1 }} to {{ Math.min(offset + pageSize, itemCount) }}
                out of {{ itemCount }} enhancers
              </span>
            </div>
            <div class="mb-4">
              <n-button type="primary" @click="fetchData" :loading="loading">
                Reload Data
              </n-button>
            </div>
          </div>
          <n-data-table remote :bordered="false" :columns="columns" :loading="loading" :data="tableData"
            :pagination="pagination" @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
        </n-card>
      </template>
      <template #footer>
      </template>
    </CardActions>
  </CardWrapper>
</template>

<script lang="ts" setup>
import { ref, computed, h, defineAsyncComponent, nextTick, onMounted } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NCard, NDataTable, NButton } from 'naive-ui'
import ExpressoVue from "@/browser/elements/Expresso/ExpressoVue.vue"
import ExpressoVueMouse from "@/browser/elements/Expresso/ExpressoVueMouse.vue"
import ExpressoLink from "@/browser/elements/ExpressoLink.vue"

import axios from 'axios';
import chromBands from '@/data/chromBands.json'
import MousechromBands from '@/data/mousechromband.json'

const showMouseComponent = ref(true)
// const tableData = ref(null)
const highlightRegionHuman = ref({

})

const viewRegionMouse = ref({

})

const highlightRegionMouse = ref({

})
// const highlightRegionHuman = ref({
//   chrom: 'chr1',
//   start: 1591800,
//   end: 1551591
// })

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
  initPos: {
    chrom: 'chr2',
    start: 234050679,
    end: 234077134
  },
  chromBands: chromBands
})



let asmMouse = ref({
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
  {
    chrom: 'chr1',
    start: 88406743,
    end: 88429321
  },
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

// 处理人类基因组浏览器的位置更新
const handleLocationUpdate = (newLocation) => {
  browserLocation.value = newLocation
  console.log(browserLocation.value)
  // 这里可以添加其他需要同步的逻辑
}

// 处理小鼠基因组浏览器的位置更新
const handleMouseLocationUpdate = (newLocation) => {
  mouseBrowserLocation.value = newLocation
  console.log(mouseBrowserLocation.value)
  // 这里可以添加其他需要同步的逻辑
}

const tracksInfo = ref([
  {
    id: 'hg38-ucsc-gene-annotation',
    name: 'Genes',
    label: 'Genes',
    type: 'GeneTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/hg38/UCSC_gene_annotation_hg38.srt.reformat.txt.gz'
  },
  {
    id: 'human enhancers',
    name: 'Enhancers',
    label: 'Enhancers',
    type: 'SclsTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/crescope/1d_dataset/human_encode_enhancers_hg38_srt.bed.gz'

  }
])

const tracksInfoMouse = [
  {
    id: 'mouse enhancers',
    name: 'Enhancers',
    label: 'Enhancers',
    type: 'SclsTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/crescope/1d_dataset/mouse_chipatlas_enhancers_mm10_srt.bed.gz'

  },
  {
    id: 'Mouse Genes',
    name: 'Genes',
    label: 'Genes',
    type: 'GeneTrack',
    url: 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/annotation/mm10/UCSC_gene_annotation_mm10.srt.reformat.srt.bed.gz'
  },

]

// Table state
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const itemCount = ref(100)

const offset = computed(() => (currentPage.value - 1) * pageSize.value)

const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  itemCount: itemCount.value,
  pageCount: Math.ceil(itemCount.value / pageSize.value)
}))

const HumanBrowserKey = ref(0)
const HumanBrowser = ref(null)
const MouseBrowserKey = ref(0)
const MouseBrowser = ref(null)

async function loadHumanBrowser() {
  HumanBrowser.value = defineAsyncComponent(() =>
    import("@/browser/elements/Expresso/ExpressoVue.vue")
  );
}
// 加载MouseBrowser组件的函数
async function loadMouseBrowser() {
  MouseBrowser.value = defineAsyncComponent(() =>
    import("@/browser/elements/Expresso/ExpressoVueMouse.vue")
  );
}

// 解析 sequence_homology
const parseHomology = (homology: string) => {
  if (homology === 'NA') return null
  const [chrom, range] = homology.split(':')
  const [start, end] = range.split('-').map(Number)
  return { chrom, start, end }
}

// handleClick函数修改
const handleClick = (row) => {
  // 重新加载两个组件
  HumanBrowser.value = null;
  MouseBrowser.value = null;

  // 更新人类数据
  asm.value.initPos = {
    chrom: row.chrom,
    start: row.start,
    end: row.end
  }
  const gap = row.end - row.start
  const highlightGap = gap * 0.5
  highlightRegionHuman.value = {
    chrom: row.chrom,
    start: row.start + gap * 0.25,
    end: row.start + gap * 0.75,
  }

  const mouseRegion = parseHomology(row.sequence_homology)


  // browserLocation.value = {
  //   chrom: row.chrom,
  //   start: row.start,
  //   end: row.end,
  //   max: asm.value.chromSizes[row.chrom],
  //   min: 0,
  //   size: asm.value.chromSizes[row.chrom]
  // }

  // 更新小鼠数据
  if (mouseRegion) {
    highlightRegionMouse.value = {
      chrom: mouseRegion.chrom,
      start: mouseRegion.start,
      end: mouseRegion.end
    }

    const highlightGap = mouseRegion.end - mouseRegion.start
    const gap = highlightGap * 0.5
    asmMouse.value.initPos = {
      chrom: mouseRegion.chrom,
      start: mouseRegion.start - gap,
      end: mouseRegion.end + gap
    }

    // mouseBrowserLocation.value = {
    //   chrom: mouseRegion.chrom,
    //   start: mouseRegion.start,
    //   end: mouseRegion.end,
    //   max: asmMouse.value.chromSizes[mouseRegion.chrom],
    //   min: 0,
    //   size: asmMouse.value.chromSizes[mouseRegion.chrom]
    // }

  }

  loadHumanBrowser();
  loadMouseBrowser();

  HumanBrowserKey.value++;
  MouseBrowserKey.value++;
}

// Table columns definition
const columns: DataTableColumns = [
  { title: 'Chrom', key: 'chrom' },
  { title: 'Start', key: 'start' },
  { title: 'End', key: 'end' },
  { title: '-logPvalue', key: 'logPvalue' },
  { title: 'File ID', key: 'file_id' },
  { title: 'Experiment', key: 'experiment' },
  { title: 'Subtissue', key: 'subtissue' },
  { title: 'Tissue', key: 'tissue' },
  { title: 'Sequence Homology', key: 'sequence_homology' },
  { title: 'Map Ratio', key: 'map_ratio' },
  {
    title: 'View',
    key: 'view',
    render(row) {
      const isMouseDisabled = row.sequence_homology === 'NA'
      return h('div', { class: 'flex gap-2' }, [
        // Compare 按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'success',
            disabled: isMouseDisabled,
            onClick: () => {
              // handleClick(row)
              if (!isMouseDisabled) {

                console.log(row.chrom)
                handleClick(row)

                // 显示小鼠组件
                showMouseComponent.value = true
              }
            }
          },
          { default: () => 'Homologous region' }
        )
      ])
    }
  },
  {
    title: 'Annotate',
    key: 'annotate',
    render(row) {
      // 解析 sequence_homology
      const parseHomology = (homology: string) => {
        if (homology === 'NA') return null
        const [chrom, range] = homology.split(':')
        const [start, end] = range.split('-').map(Number)
        return { chrom, start, end }
      }

      const mouseRegion = parseHomology(row.sequence_homology)
      const isMouseDisabled = row.sequence_homology === 'NA'

      return h('div', { class: 'flex gap-2' }, [
        // View in Human 按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => {
              asm.value.initPos = {
                chrom: row.chrom,
                start: row.start,
                end: row.end
              }
            }
          },
          { default: () => 'Human' }
        ),
        // View in Mouse 按钮
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            disabled: isMouseDisabled,
            onClick: () => {
              if (!isMouseDisabled) {
                asmMouse.initPos = {
                  chrom: mouseRegion.chrom,
                  start: mouseRegion.start,
                  end: mouseRegion.end
                }
              }
            }
          },
          { default: () => 'Mouse' }
        ),

      ])
    }
  }
]


const handleRowAction = (row: any) => {
  console.log('Row clicked:', row)
  // Add your action logic here
  // For example, you could show a modal, navigate to a new page, etc.
}


// 分页事件处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchData();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchData();
};

const handleReload = async () => {
  try {
    loading.value = true

    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update data
    tableData.value = tableData.value.map(row => ({
      ...row,
      logPvalue: +(Math.random() * 20).toFixed(1),
      map_ratio: Math.random() > 0.2 ? Math.random().toFixed(2) : 'Unmap',
      sequence_homology: Math.random() > 0.2
        ? `chr${Math.floor(Math.random() * 19 + 1)}:${Math.floor(Math.random() * 10000000)}-${Math.floor(Math.random() * 10000000)}`
        : 'NA'
    }))

  } catch (error) {
    console.error('Failed to reload data:', error)
  } finally {
    loading.value = false
  }
}

const tableData = ref([]);
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://47.107.91.5:8888/api/crossspecies/', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value
      }
    });
    tableData.value = response.data.results; // 后端返回的数据
    itemCount.value = response.data.count; // 总数据量
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};
fetchData();


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

const updateRegions = (regions) => {
  // 更新人类基因组位置
  asm.value.initPos = {
    chrom: regions.human.chrom,
    start: regions.human.start,
    end: regions.human.end
  }
  
  // 更新鼠基因组位置
  asmMouse.value.initPos = {
    chrom: regions.mouse.chrom,
    start: regions.mouse.start,
    end: regions.mouse.end
  }

  // 重置浏览器组件
  HumanBrowser.value = null;
  MouseBrowser.value = null;
  
  // 重新加载浏览器
  loadHumanBrowser();
  loadMouseBrowser();
  
  // 更新keys触发重新渲染
  HumanBrowserKey.value++;
  MouseBrowserKey.value++;
}

defineExpose({
  updateRegions
})

onMounted(() => {
  loadHumanBrowser();
  loadMouseBrowser();
});

</script>

<style scoped>
/* Add any component-specific styles here */
</style>