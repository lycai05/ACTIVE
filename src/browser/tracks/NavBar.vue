<template>
    <div
        class="@container flex-wrap mb-8 bg-white relative flex rounded-lg items-center md:w-auto md:flex-row md:space-y-0 md:items-center gap-y-4">
        <!-- assembly selection -->

        <div class="hidden @md:block flex flex-col justify-center items-center mr-2">
            <p class="text-xl">
                {{ asm }}
            </p>
        </div>

        <!-- =================== -->

        <!-- chromosome selection -->
        <div class="w-20 mr-3 text-l rounded-l" style="height: 40px">
            <n-select size="large" v-model:value="chrom" :options="chromValues" :consistent-menu-width="false" />

        </div>

        <!-- ==================== -->
        <!-- <div class="flex flex-col sm:flex-row items-center p-4"> -->

        <!-- search bar -->
        <form class="flex flex-grow items-center" @submit.prevent="handleLocationSearch">
            <!-- <label for="simple-search" class="sr-only">Search</label> -->
            <input type="text" id="simple-search"
                class="relative m-0  block min-w-0 flex-auto  rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-700 outline-none transition duration-300 ease-in-out focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none"
                placeholder="Search" required 
                v-model="currentLocString"
                @keyup.enter="handleLocationSearch"
                >
            <button
                class="relative flex items-center mr-3 px-4 py-2.5
                            text-white
                            rounded-r bg-blue-700 transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                type="button" id="location-search" data-te-ripple-init data-te-ripple-color="light"
                @click="handleLocationSearch">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                    <path fill-rule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </form>
        <!-- ========== -->
        <!-- <div class="flex flex-wrap items-center justify-between w-full sm:flex-nowrap sm:w-auto"> -->
        <!-- // current view  -->
        <div class="flex flex-col justify-center items-center">
            <p class="text-xl">{{ BASIC_intComma(span) }} bp</p>
        </div>
        <!-- shift button -->
        <div class="inline-flex rounded-md shadow-sm ml-2" role="group">
            <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l text-sm text-center inline-flex items-center p-2 w-10 h-10"
                @click="$emit('shift', $event, -1)">
                <svg fill="currentColor" class="h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z">
                    </path>
                </svg>
            </button>
            <button type="button"
                class="text-blue-500 border-t border-b border-r border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r text-sm text-center inline-flex items-center mr-3 p-2 w-10 h-10"
                @click="$emit('shift', $event, 1)">
                <svg fill="currentColor" class="h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z">
                    </path>
                </svg>
            </button>
        </div>

        <!-- zoom in and out buttons -->
        <div class="inline-flex rounded-md shadow-sm mr-2" role="group">
            <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l text-sm text-center inline-flex items-center p-2 w-10 h-10"
                @click="$emit('zoomIn')">
                <svg fill="currentColor" class="h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path
                        d="M9 6a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 6z">
                    </path>
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9zm7-5.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z">
                    </path>
                </svg>
            </button>
            <button type="button" class="text-blue-700 
                            border-t border-b border-r border-blue-700 
                            hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 
                            font-medium rounded-r text-sm  text-center inline-flex items-center 
                            mr-3 p-2 w-10 h-10" @click="$emit('zoomOut')">
                <svg fill="currentColor" class="h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path d="M6.75 8.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z"></path>
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M9 2a7 7 0 104.391 12.452l3.329 3.328a.75.75 0 101.06-1.06l-3.328-3.329A7 7 0 009 2zM3.5 9a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z">
                    </path>
                </svg>
            </button>
        </div>

        <!-- vertical line -->
        <!-- <div class="inline-flex rounded-md shadow-sm" role="group">
            <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm text-center inline-flex items-center p-2 w-10 h-10"
                @click="">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div> -->

        <!-- screenshot button -->
        <!-- <div class="inline-flex rounded-md shadow-sm mx-2" role="group">
            <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm text-center inline-flex items-center p-2"
                @click="takeScreenshot">
                Screennshot
            </button>
        </div> -->


        <div class="inline-flex rounded-md shadow-sm" role="group">
            <!-- <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm text-center inline-flex items-center p-1.5 w-10 h-10"
                @click="">
                <n-dropdown trigger="click" :options="contextMenuOptions" placement="bottom-start" @select="onDropDownSelect" >
                <n-icon  :size="22">
          <SettingsOutline />
        </n-icon>

      </n-dropdown>
            </button> -->
            <n-tooltip trigger="hover">
                <template #trigger>
                    <button type="button"
                        class="flex justify-center mr-4 text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm text-center inline-flex items-center w-10 h-10">
                        <n-popover trigger="click" :width="200" class="toolbar-popover" placement="bottom-end">
                            <template #trigger>
                                <n-icon size="20">
                                    <SettingsOutline />
                                </n-icon>
                            </template>
                            <div class="flex flex-col justify-center ">
                                <div @click="takeScreenshot" class="flex items-center hover:bg-blue-600">
                                <n-icon size="28" class=" mr-3">
                                    <CameraOutline />
                                </n-icon>
                                <span>Screenshots</span>
                            </div>
                            <hr class="h-px my-3 bg-gray-200 border-0 dark:bg-gray-600">
                            <!-- Show / hide track labels -->
                            <div class="flex items-center hover:bg-grey-600">
                                <n-switch v-model:value="showTrackLabel" size="small" class="  mr-3"/>
                                <span v-if="showTrackLabel">Hide Track labels</span>
                                <span v-else>Show Track labels</span>
                            </div>
                            <hr class="h-px my-3 bg-gray-200 border-0 dark:bg-gray-600">
                            <!-- Show / hide vertical line -->
                            <div class="flex items-center">
                                <n-switch v-model:value="showVerticalLine" size="small" class="  mr-3"/>
                                <span v-if="showVerticalLine">Disable Vertical line</span>
                                <span v-else>Enable Vertical line</span>
                            </div>
                            </div>


                        </n-popover>
                    </button>
                </template>
                <span>Settings</span>
            </n-tooltip>
        </div>
        <slot name="extra-buttons"></slot>

    </div>
    <!-- </div>
</div> -->
    <div>
        <n-modal v-model:show="showScreenshotModal" transform-origin="center">
            <div ref="screenshotRef">
            </div>
        </n-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineProps, h } from 'vue';
import { BASIC_intComma } from '../utils/utils'
import html2canvas from 'html2canvas'
import { NIcon, NSwitch } from 'naive-ui'
import { Menu, Refresh, CameraOutline, SettingsOutline } from 'vicons/ionicons-v5'

const props = defineProps({
    asm: {
        type: String,
        required: true
    },
    chrom: {
        type: String,
        required: true
    },
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    },
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    chromSizes: {
        type: Object,
        required: true
    },
    chromNames: {
        type: Array,
        required: true
    },
    showTrackLabel: {
        type: Boolean,
        required: true
    },
    showVerticalLine: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['update:chrom', 'update:start', 'update:end', 'update:min', 'update:max', 'shift', 'zoomIn', 'zoomOut', 'zoomTo', 'update:showTrackLabel', 'update:showVerticalLine'])
const asm = props.asm

const showTrackLabel = computed({
    get: () => props.showTrackLabel,
    set: (value) => {
        emit('update:showTrackLabel', value)
    }
})

const showVerticalLine = computed({
    get: () => props.showVerticalLine,
    set: (value) => {
        emit('update:showVerticalLine', value)
    }
})

const chrom = computed({
    get: () => props.chrom,
    set: (value) => {
        emit('update:chrom', value)
    }
})

const chromValues = ref(props.chromNames.map((item) => {
    return {
        label: item,
        value: item
    }
}))

const start = computed(
    () => props.start
)

const end = computed(
    () => props.end
)

// input search
const stringToLoc = (searchString) => {
    const [chromosome, location] = searchString.split(":");
    console.log('chromosome: ', chromosome)
    const [start, end] = location.split("-");
    const startInt = parseInt(start.replace(/,/g, ""));
    const endInt = parseInt(end.replace(/,/g, ""));
    return { chrom: chromosome, start: startInt, end: endInt };
}

const currentLocString = ref('')

watch([() => props.chrom, () => props.start, () => props.end], () => {
    currentLocString.value = props.chrom + ':' + BASIC_intComma(props.start) + '-' + BASIC_intComma(props.end)
}, { immediate: true })


const handleLocationSearch = function (event) {

    // Prevent the default form submission behavior
    event.preventDefault();
    const { chrom, start, end } = stringToLoc(currentLocString.value)
    emit('zoomTo', chrom, start, end)

}

// currently viewed genomic regions in bp
const span = computed(() => {
    return end.value - start.value + 1
})
// 这个方法会将渲染好的图片在新页面打开。
function debugBase64(base64URL) {
    var win = window.open();
    win.document.write(
        '<iframe src="' +
        base64URL +
        '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
    );
}
const screenshotRef = ref(null)
const showScreenshotModal = ref(false)
const takeScreenshot = async () => {
    const screenshotHolder = document.getElementById('screenshot-holder')
    const canvas = await html2canvas(screenshotHolder, {
        x: -26,
        y: 0
    })
    var img = canvas.toDataURL("image/png");
    debugBase64(img);
}

const contextMenuOptions = ref([
    {
        label: 'Screenshot',
        key: 'Screenshot',
        icon() {
            return h(NIcon, null, {
                default: () => h(CameraOutline),
            })
        },
    },
    {
        type: 'divider',
        key: 'd1'
    },
    {
        label: 'Show Track label',
        key: 'trackLabel',
        icon() {
            return h(NSwitch, {
                modelValue: showTrackLabel.value,
                'onUpdate:Value': (value) => {
                    console.log(value)
                    showTrackLabel.value = value
                }
            })
        },
    },
])

const onDropDownSelect = (key: string) => {
    switch (key) {
        case 'Screenshot':
            takeScreenshot()
            break
        case 'trackLabel':
            showTrackLabel.value = !showTrackLabel.value
            break
    }
}



</script>

<style scoped>
.table-toolbar-inner-popover-title {
    padding: 3px 0;
}

.table-toolbar-right-icon {
    margin-left: 12px;
    font-size: 16px;
    /* color: var(--text-color); */
    cursor: pointer;
}

.table-toolbar-right-icon:hover {
    color: #1890ff;
}

.toolbar-popover {
    .n-popover__content {
        padding: 0;
    }
}
</style>