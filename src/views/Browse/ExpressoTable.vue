<template>
  <div class="mx-auto max-w-8xl">
    <div class="grid grid-cols-5 gap-6 mt-6">
      <n-card class="bg-white hidden lg:block col-span-1 rounded-lg border border-gray-200 p-2 flex-1 h-full">
        <div class="mb-5">
          <!-- <n-h3 prefix="bar" align-text>Summary Table</n-h3> -->
          <div class="relative flex-shrink-0 w-full mb-4 lg:mb-4 lg:mr-5">
            <AutocompleteDialogBiosample @submit-gene="fetchBiosample"></AutocompleteDialogBiosample>
          </div>
        </div>
        <hr class="bg-gray-200 dark:border-gray-700 mt-5 mb-5">
        <div class="mb-5">
          <template v-for="(item, index) in initializedData" :key="index">
            <h5 class="uppercase text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              {{ splitCamelCase(item.category) }}
            </h5>
            <ul class="list-none pl-0">
              <n-scrollbar style="min-height: 100px; max-height: 290px">
                <li v-for="(name, i) in item.options" class="mb-3" :key="i">
                  <button 
                    type="button" 
                    class="flex items-center justify-between group w-full"
                    :class="{ active: isActive(name[0]) }" 
                    @click="toggleButton(name[0], item.category)"
                  >
                    <span class="flex items-center">
                      <span class="text-gray-900 dark:text-white text-base font-medium group-hover:text-blue-700 dark:group-hover:text-blue-600">
                        {{ name[0] }}
                      </span>
                    </span>
                    <span class="text-base font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-600">
                      {{ name[1] }}
                    </span>
                  </button>
                </li>
              </n-scrollbar>
              <hr class="bg-gray-200 dark:border-gray-700 mb-5">
            </ul>
          </template>
        </div>
        <div class=" flex justify-center">
          <n-button secondary size="large" @click="reloadAnchorMotifTable">
            Reset
          </n-button>
        </div>
      </n-card>

      <n-card round class="bg-white col-span-5 lg:col-span-4">
        <div>
          <div class="flex justify-between">
            <div class="mb-4 flex items-center min-h-[28px]">
              <span class="text-sm font-medium text-gray-900 dark:text-white mr-3 flex-shrink-0">
                Showing {{ offset + 1 }} to {{ offset + 1 + pageSize }}
                cell types of {{ itemCount }} in
                total.
              </span>
              <!-- <div class="flex items-center flex-wrap space-x-3"></div> -->
            </div>
            <div class="mb-4 flex items-center">
              <div v-for="assay in assayColor">
                <div
                  :style="{ backgroundColor: assay.color, width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginLeft: '16px', marginRight: '6px' }">
                </div>
                <span> {{ assay.name }} </span>
              </div>
            </div>
          </div>
          <div class="gap-3">
            <n-data-table 
              ref="table" 
              v-if="dataRef" 
              :bordered="false" 
              :columns="columnsRef" 
              :loading="loadingRef"
              :data="TmpDataRef" 
              :pagination="paginationReactive" 
              @update:sorter="handleSorterChange"
              default-expand-all 
            />
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, watch, computed, reactive } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import axios from '@/plugins/axios';
// import axios from 'axios'
import { useRouter } from "vue-router";
import { NCard, NDataTable, NButton } from "naive-ui";
import { useLoadingBar } from 'naive-ui'

import { useThemeStore } from "@/stores/theme"
import AutocompleteDialogBiosample from '@/components/common/AutocompleteDialogBiosample.vue'
import { useMessage } from 'naive-ui'

import AutocompeleDialog from '@/components/common/AutocompleteDialog.vue'
const SearchIcon = "ion:search-outline"

const themeStore = useThemeStore()

const style = computed<{ [key: string]: any }>(() => themeStore.style)

const textSecondaryColor = computed<string>(() => style.value["--fg-secondary-color"])
const emit = defineEmits(['add-track']);

const router = useRouter()
const healthStatus = ref([])
const tissue = ref([])
const data_type = ref([])
const factor = ref([])

const loadingRef = ref(true)
const dataRef = ref(null)
const TmpDataRef = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)
const initializedData = ref([])
const itemCount = ref(0)
const activatedButtons = ref([])
const message = useMessage()

const paginationReactive = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 15, 20],
  itemCount: itemCount.value,
  onChange: (page: number) => {
    paginationReactive.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  }
})

const props = defineProps({
  species: {
    type: String,
    default: 'human'
  }
})

const baseUrl = computed(() => {
  switch (props.species) {
    case 'mouse':
      return 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/mouse_hic/oss_files/'
    default:
      return 'https://3dgenomehub.oss-cn-shenzhen.aliyuncs.com/hic/'
  }
})

const populateInitializedData = (data) => {
  let output = []
  const categories = ['health_status', 'tissue', 'data_type'];
  categories.forEach(category => {
    const counts = {};
    console.log(data)
    data.forEach(product => {
      const option = product[category];
      // if (category === 'assays') {
      //   // Handle 'assays' array separately
      //   option.forEach(assay => {
      //     if (!counts[assay]) {
      //       counts[assay] = 0;
      //     }
      //     counts[assay]++;
      //   });
      // } else {
      if (!counts[option]) {
        counts[option] = 0;
      }
      counts[option]++;
      // }
    });

    // Convert counts object to an array of arrays
    const sortedCountsArray = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    output.push({
      category: category,
      options: sortedCountsArray
    });
  });
  return output;
}

// type RowData = {
//   gsm_id: string
//   health_status: string
//   tissue: number
//   data_type: string
// }

const reloadAnchorMotifTable = () => {
  TmpDataRef.value = dataRef.value
  activatedButtons.value = []
  itemCount.value = dataRef.value.length
  paginationReactive.page = 1
  paginationReactive.pageSize = 10
}

function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return '#' + (0x1000000 + (R < 255 ? R : 255) * 0x10000 + (G < 255 ? G : 255) * 0x100 + (B < 255 ? B : 255)).toString(16).slice(1);
}

function hexToRGBA(hex, opacity) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

async function checkFileExists(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    // 在 no-cors 模式下，response.status 将始终是 0
    // 如果请求成功完成，说明文件存在
    return response.type === 'opaque';
  } catch (error) {
    console.error('Error checking file:', error);
    return false;
  }
}

// column specification
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 160
  },
  {
    title: 'Body Sites',
    key: 'tissue',
    width: 190,
    sortOrder: false,
    sorter: 'default',
    render(row) {
      const tissueColors = {
        'Adrenal gland': '#F6EC65',
        'Arthritis': '#E83F19',
        'Bladder': '#3C5EAA',
        'Blood': '#BD2321',
        'Bone': '#F2F2F3',
        'Brain': '#F6BBA7',
        'Breast': '#8B6679',
        'Bronchus': '#EE7E87',
        'Colon': '#F7C96B',
        'Embryo': '#99D6EF',
        'Eye': '#8D1C27',
        'Heart': '#EC6822',
        'Kidney': '#697F15',
        'Liver': '#8B5241',
        'Lung': '#F7D774',
        'Lymph': '#06763B',
        'Muscle tissue': '#F7BE92',
        'Nerve': '#F5E72E',
        'Ovary': '#B35CA0',
        'Pancreas': '#DFDE86',
        'Pharynx': '#FDE5C8',
        'Placenta': '#E83F29',
        'Prostate gland': '#ACC7E8',
        'Skin': '#854922',
        'Soft tissue': '#DBA883',
        'Spleen': '#781E4E',
        'Stomach': '#F5AF32',
        'Testis': '#788CA4',
        'Thymus': '#92C976',
        'Thyroid gland': '#F6B59C',
        'Uterus': '#EABDD7',
        'Vagina': '#DE4E96',
        'Vessel': '#4B83C4'
      };

      const baseColor = tissueColors[row.tissue] || '#CCCCCC';
      const backgroundColor = hexToRGBA(baseColor, 0.2);

      return h('div', {
        style: {
          backgroundColor: backgroundColor,
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center',
          width: '60%',
        }
      }, row.tissue);
    }
  },
  {
    title: 'Health Status',
    key: 'health_status',
    width: 100,
    sortOrder: false,
    sorter: 'default',
  },
  {
    title: 'Biomaterial',
    key: 'biomaterial_type',
    sorter: 'default',
    sortOrder: false
  },
  {
    title: 'Assay',
    key: 'data_type',
    sortOrder: false,
    sorter: 'default',
    render(row) {
      const assayColor = {
        'ChIA-PET': '#6267FF',
        'HiChIP': '#FF61C9',
        'in-situ Hi-C': '#00B27B',
        'intact Hi-C': '#00B27B',
      };

      const color = assayColor[row.data_type] || 'grey';

      return h('div', {
        style: {
          backgroundColor: color,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          display: 'inline-block',
          marginLeft: '5px'
        }
      })
    }
  },
  {
    title: 'View',
    key: 'visualize',
    render: function (row) {
      const buttonStyle = {
        padding: '4px 8px',
        margin: '0 4px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
        backgroundColor: 'white',
        color: '#4a5568',
        transition: 'all 0.2s',
        ':hover': {
          backgroundColor: '#edf2f7',
          color: '#2b6cb0'
        }
      };

      const isHiC = row.data_type.includes('Hi-C');
      const buttons = isHiC
        ? [
            { 
              text: 'C', 
              track_type: 'CompTrack',
              fileName: 'compartments_E1.bigwig',
              action: async () => {
                const url = `${baseUrl.value}${row.id}/${row.id}.compartments_E1.bigwig`;
                const exists = await checkFileExists(url);
                if (exists) {
                  const trackData = {
                    sample_name: `${row.id} Compartments`,
                    track_type: 'CompTrack',
                    download_link: url
                  };
                  emit('add-track', trackData);
                  message.success(`CompTrack ${row.id}.compartments_E1.bigwig has been loaded`);
                } else {
                  message.error(`CompTrack ${row.id}.compartments_E1.bigwig can not be loaded`);
                }
              }
            },
            { 
              text: 'D', 
              track_type: 'DomainTrack',
              fileName: 'contact_domains.bed.gz',
              action: async () => {
                const url = `${baseUrl.value}${row.id}/${row.id}.contact_domains.bed.gz`;
                const exists = await checkFileExists(url);
                console.log(exists)
                if (exists) {
                  const trackData = {
                    sample_name: `${row.id} Contact domains`,
                    track_type: 'SclsTrack',
                    download_link: url
                  };
                  emit('add-track', trackData);
                  message.success(`DomainTrack ${row.id}.contact_domains.bed.gz has been loaded`);
                } else {
                  message.error(`DomainTrack ${row.id}.contact_domains.bed.gz can not be loaded`);
                }
              }
            },
            { 
              text: 'L', 
              track_type: 'CurvTrack',
              fileName: 'chromatin_loops.bed.gz',
              action: async () => {
                const url = `${baseUrl.value}${row.id}/${row.id}.chromatin_loops.bed.gz`;
                const exists = await checkFileExists(url);
                if (exists) {
                  const trackData = {
                    sample_name: `${row.id} Chromatin Loops`,
                    track_type: 'CurvTrack',
                    download_link: url,
                    track_style: 'basicCurve'
                  };
                  emit('add-track', trackData);
                  message.success(`CurvTrack ${row.id}.chromatin_loops.bed.gz has been loaded`);
                } else {
                  message.error(`CurvTrack ${row.id}.chromatin_loops.bed.gz can not be loaded`);
                }
              }
            },
            { 
              text: 'M', 
              track_type: 'MatrixTrack',
              fileName: 'matrix.gz',
              action: async () => {
                const url = `${baseUrl.value}${row.id}/${row.id}.contact_matrix.hic`;
                const exists = await checkFileExists(url);
                if (exists) {
                  const trackData = {
                    sample_name: `${row.id} Matrix`,
                    track_type: 'HicTrack',
                    download_link: url
                  };
                  emit('add-track', trackData);
                  message.success(`MatrixTrack ${row.id}.matrix.gz has been loaded`);
                } else {
                  message.error(`MatrixTrack ${row.id}.matrix.gz can not be loaded`);
                }
              }
            }
          ]
        : [
            { 
              text: 'Loop', 
              track_type: 'CurvTrack',
              fileName: 'chromatin_loops.bed.gz',
              action: async () => {
                const url = `${baseUrl.value}${row.id}/${row.id}.chromatin_loops.bed.gz`;
                const exists = await checkFileExists(url);
                if (exists) {
                  const trackData = {
                    sample_name: `${row.id} Chromatin Loops`,
                    track_type: 'CurvTrack',
                    download_link: url,
                    track_style: 'basicCurve'
                  };
                  emit('add-track', trackData);
                  message.success(`CurvTrack ${row.id}.chromatin_loops.bed.gz has been loaded`);
                } else {
                  message.error(`CurvTrack ${row.id}.chromatin_loops.bed.gz can not be loaded`);
                }
              }
            },
            { 
              text: 'Peak', 
              track_type: 'PeakTrack',
              fileName: 'peaks.bed.gz',
              action: async () => {
                const url = `${baseUrl.value}${row.id}/${row.id}.peaks.bed.gz`;
                const exists = await checkFileExists(url);
                if (exists) {
                  const trackData = {
                    sample_name: `${row.id} Peaks`,
                    track_type: 'PeakTrack',
                    download_link: url
                  };
                  emit('add-track', trackData);
                  message.success(`PeakTrack ${row.id}.peaks.bed.gz has been loaded`);
                } else {
                  message.error(`PeakTrack ${row.id}.peaks.bed.gz can not be loaded`);
                }
              }
            }
          ];

      return h('div', {
        style: {
          display: 'flex',
          gap: '8px'
        }
      }, 
      buttons.map(button => 
        h('button', {
          style: buttonStyle,
          onClick: button.action
        }, button.text)
      ));
    }
  }
];

const assayColor = [
  {
    name: "Hi-C",
    color: '#00B27B'
  },
  {
    name: 'ChIA-PET',
    color: '#6267FF'
  },
  {
    name: 'HiChIP',
    color: '#FF61C9'
  }//,
  // {
  //   name: 'RNA-seq',
  //   color: '#FFB600'
  // },
  // {
  //   name: 'ChIP-seq',
  //   color: '#FF0156'
  // },
  // {
  //   name: 'ATAC-seq',
  //   color: 'blue'
  // }
]

// const columns = createColumns()

const table = ref(null)
const columnsRef = ref(columns)

const handleSorterChange = (sorter) => {
  columnsRef.value.forEach((column) => {
    /** column.sortOrder !== undefined means it is uncontrolled */
    if (column.sortOrder === undefined)
      return
    if (!sorter) {
      column.sortOrder = false
      return
    }
    if (column.key === sorter.columnKey)
      column.sortOrder = sorter.order
    else column.sortOrder = false
  })
}

// navigate to individual cell type page
const handleClick = (value) => {
  const cleanedValue = value.replace(/^[^a-zA-Z0-9]+/, '');
  router.push({ name: 'Sample', params: { id: cleanedValue } })
}

const handleGeneSearch = (value) => {
  router.push({ path: `/gene/${value}` });
}

function splitCamelCase(string) {
  return string
    // insert a space before all caps
    .replace(/([a-z])([A-Z])/g, '$1 $2')
}

const toggleButton = (buttonId, category) => {
  console.log('enter toggleButton')
  const index = activatedButtons.value.indexOf(buttonId);
  console.log(category)
  if (index === -1) {
    console.log('not found')

    activatedButtons.value.push(buttonId);
    if (category == 'health_status' && !healthStatus.value.includes(buttonId)) {
      healthStatus.value.push(buttonId);
    }
    if (category == 'tissue' && !tissue.value.includes(buttonId)) {
      tissue.value.push(buttonId);
    }
    if (category == 'data_type' && !data_type.value.includes(buttonId)) {
      data_type.value.push(buttonId);
    }
    // if (!cellType.value === button) {
    //   cellType.value = button;
    // }
    // fnGetData(1)

  } else {
    console.log('not found')

    if (category == 'health_status' && healthStatus.value.includes(buttonId)) {
      healthStatus.value = healthStatus.value.filter(item => item !== buttonId);
    }
    if (category == 'tissue' && tissue.value.includes(buttonId)) {
      tissue.value = tissue.value.filter(item => item !== buttonId);
    }
    if (category == 'data_type' && data_type.value.includes(buttonId)) {
      data_type.value = data_type.value.filter(item => item !== buttonId);
    }
    activatedButtons.value.splice(index, 1);
    // fnGetData(1)
  }
  currentPage.value = 1
}

const isActive = (buttonId) => {
  return activatedButtons.value.includes(buttonId);
}

const fnGetMenudata = () => {
  const endpoint = props.species === 'mouse' 
    ? 'http://47.107.91.5:8888/api/genomehub/mousesamples/'
    : 'http://47.107.91.5:8888/api/genomehub/humansamples/'

  axios.get(endpoint, {
    responseType: 'json',
  })
    .then(res => {
      console.log(`${props.species} samples`, res.data)
      loadingRef.value = false
      dataRef.value = res.data
      itemCount.value = res.data.length
      TmpDataRef.value = res.data
      initializedData.value = populateInitializedData(res.data)
      loadingBar.finish()
    }).catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
    });
}

const offset = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const loadingBar = useLoadingBar()

const id = ref('')
const fetchBiosample = (biosample) => {
  id.value = biosample
  console.log('id:', biosample);
}

onMounted(() => {
  fnGetMenudata()
  // activatedButtons.value = ['in-situ Hi-C', 'Blood']
  watch([() => healthStatus.value, () => tissue.value, () => data_type.value, () => id.value], (newValues) => {
    const [newHealthStatus, newTissue, newDataType, newId] = newValues;

    // Debugging output
    console.log('HealthStatus:', newHealthStatus);
    console.log('Tissue:', newTissue);
    console.log('DataType:', newDataType);
    console.log('id:', newId);

    if (!newHealthStatus.length && !newTissue.length && !newDataType.length && !newId.length) {
      TmpDataRef.value = dataRef.value;
    } else {
      TmpDataRef.value = dataRef.value.filter((item: any) => {
        const healthStatusMatch = !newHealthStatus.length || newHealthStatus.includes(item.health_status);
        const tissueMatch = !newTissue.length || newTissue.includes(item.tissue);
        const dataTypeMatch = !newDataType.length || newDataType.includes(item.data_type);
        const idMatch = !newId.length || newId.includes(item.id);
        return healthStatusMatch && tissueMatch && dataTypeMatch && idMatch;
      });
    }

    paginationReactive.page = 1
    paginationReactive.pageSize = 15
    itemCount.value = TmpDataRef.value.length;
  }, { deep: true });

  // watch(() => tissue.value, (newValue) => {
  //     console.log(newValue);
  //     if (newValue.length == 0) {
  //       TmpDataRef.value= dataRef.value
  //     }
  //     TmpDataRef.value = TmpDataRef.value.filter((item: any) => newValue.includes(item.tissue));
  //      itemCount.value = TmpDataRef.value.length

  // }, { deep: true });

  // watch(() => data_type.value, (newValue, oldValue) => {
  //     console.log(newValue);
  //     if (newValue.length == 0) {
  //       TmpDataRef.value= dataRef.value
  //     }
  //     TmpDataRef.value = TmpDataRef.value.filter((item: any) => newValue.includes(item.data_type));
  //     itemCount.value = TmpDataRef.value.length

  // }, { deep: true });
})
</script>
<style scoped>
.active {
  background-color: #e2e9ec;
  /* Green */
  color: white;
}
</style>