<template>
    <!-- <n-text>Sample {{ props.id }} has {{ totalStripeNo }} stripes</n-text> -->

    <div class="flex justify-between">
        <div class="mb-4 flex items-center min-h-[28px]">
            <span class="text-sm font-medium text-gray-900 dark:text-white mr-3 flex-shrink-0">
                Showing {{ offset + 1 }} to {{ itemCount < offset + 1 + pageSize ? itemCount:  offset + 1 + pageSize }}
                datasets of {{ itemCount }} in
                total.
            </span>
        </div>
        <div class="mb-4 flex items-center">

       
        </div>
    </div>
    <div class="gap-3">
        <n-data-table ref="table" v-if="dataRef" :bordered="false" :columns="columns"  :data="dataRef"
            :pagination="paginationReactive" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, h, watch, computed, defineAsyncComponent, nextTick } from 'vue'

import type { DataTableColumns } from 'naive-ui'
import axios from 'axios';
import { useRouter } from "vue-router";
import { NCard, NDataTable, NSpace, NRadioGroup, NRadioButton } from "naive-ui";
import { useLoadingBar } from 'naive-ui'
import { useThemeStore } from "@/stores/theme"
const emit = defineEmits(['addTrack'])

const router = useRouter()

const props = defineProps({
    downloadFiles: {
    type: Object,
    required: true
  }}
)

const themeStore = useThemeStore()

const style = computed<{ [key: string]: any }>(() => themeStore.style)


const loadingBar = useLoadingBar()
const loadingRef = ref(true)

const dataRef = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)
const itemCount = ref(0)
const paginationReactive = reactive({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    itemCount: itemCount.value,
    onChange: (page: number) => {
        paginationReactive.page = page
      },
    onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize
        paginationReactive.page = 1
      }
})
const table=ref(null)


const createGeneLink = (geneString, row) => {
    if (geneString === 'NA') {
        return geneString;
    }
    const geneNames = geneString.split(',');
    const geneLinks = geneNames.map((genename) => (
        h('a', {
            key: genename,
            href: `javascript:void(0);`,
            onClick: () => { router.push(`/gene/${genename.trim()}`); },
            style: {
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer'
            },
            'data-tooltip': geneNames.join('  ,   ')
        }, genename)
    ));

    return geneLinks
};

const createColumns = (): DataTableColumns<RowData> => {
    return [

        // {
        //     title: 'Rank',
        //     key: 'Rank',
        //     width: 50
        // },
        {
            title: 'Sample Name',
            key: 'sample_name',
            width: 200
        },
        {
            title: 'Info',
            key: 'info',
            width: 400
        },
        {
            title: 'Track Type',
            key: 'track_type',
            width: 200
        },
        {
    title: 'Add',
    key: 'add',
    width: 120,
    render(rowData) {
        return h(
            'button',
            {
                class: 'p-2 text-blue-600 hover:text-blue-800',
                onClick: () => {
                    emit('addTrack', rowData) // Emit event with track data
                }
            },
            'Add Track'
        )
    }
}
    ]
}
const columns = createColumns()


const offset = computed(() => {
    return (currentPage.value - 1) * pageSize.value
})

onMounted(() => {

    // fnGetMenudata()
    watch(() => props.downloadFiles, (newValue) => {
        if(newValue && newValue.items) {
        console.log(newValue)
        itemCount.value = newValue.itemCount
        dataRef.value = newValue.items

        }
    }, { immediate: true, deep: true })


})
</script>
