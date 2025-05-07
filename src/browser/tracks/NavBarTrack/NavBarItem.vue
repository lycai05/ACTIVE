<template>
    <div class="@container flex-wrap bg-white relative flex rounded-lg items-center md:w-auto md:flex-row md:items-center md:gap-y-2" style="padding-left: 30px">
        <!-- session ID -->
        <div class="items-center justify-center hidden text-gray-500 dark:text-gray-400 me-2 md:flex">
          <span class="text-base">{{ sessionId }}</span>
        </div>
        
        <!-- search bar -->
        <form class="flex flex-grow items-center" @submit.prevent="handleLocationSearch">
            <input type="text" id="simple-search"
                class="relative m-0 block min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-2 py-1 text-xs font-normal text-neutral-700 outline-none transition duration-300 ease-in-out focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none"
                placeholder="Search genomic region with format chrom:start-end" required 
                v-model="currentLocString"
                @keyup.enter="handleLocationSearch"
                >
            <button
                class="relative flex items-center mr-2 px-2 py-1
                            text-white
                            rounded-r bg-blue-700 transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                type="button" id="location-search" data-te-ripple-init data-te-ripple-color="light"
                @click="handleLocationSearch">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                    <path fill-rule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </form>

        <!-- genomic span -->
        <div class="flex flex-col justify-center items-center">
            <p class="text-xs">{{ formatGenomicRegion(span) }}</p>
        </div>

        <!-- shift buttons -->
        <div class="inline-flex rounded-md shadow-sm ml-1" role="group">
            <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l text-xs text-center inline-flex items-center p-1"
                @click="$emit('shift', $event, -1, trackViewIndex)">
                <svg fill="currentColor" class="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z">
                    </path>
                </svg>
            </button>
            <button type="button"
                class="text-blue-500 border-t border-b border-r border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r text-xs text-center inline-flex items-center mr-2 p-1"
                @click="$emit('shift', $event, 1, trackViewIndex)">
                <svg fill="currentColor" class="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z">
                    </path>
                </svg>
            </button>
        </div>

        <!-- zoom buttons -->
        <div class="inline-flex rounded-md shadow-sm" role="group">
            <button type="button"
                class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l text-xs text-center inline-flex items-center p-1"
                @click="$emit('zoomIn', trackViewIndex)">
                <svg fill="currentColor" class="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path
                        d="M9 6a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 6z">
                    </path>
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9zm7-5.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z">
                    </path>
                </svg>
            </button>
            <button type="button" 
                class="text-blue-700 border-t border-b border-r border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r text-xs text-center inline-flex items-center p-1" 
                @click="$emit('zoomOut', trackViewIndex)">
                <svg fill="currentColor" class="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true">
                    <path d="M6.75 8.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z"></path>
                    <path clip-rule="evenodd" fill-rule="evenodd"
                        d="M9 2a7 7 0 104.391 12.452l3.329 3.328a.75.75 0 101.06-1.06l-3.328-3.329A7 7 0 009 2zM3.5 9a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z">
                    </path>
                </svg>
            </button>
        </div>

        <!-- <div class="inline-flex rounded-md shadow-sm" role="group">
            <n-switch v-model:value="showVerticalLine" size="small" class="mr-2" :rail-style="railStyle">
                <template #checked>Selection Mode</template>
                <template #unchecked>Browse Mode</template>
            </n-switch>
        </div> -->
        <slot name="extra-buttons"></slot>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineProps, h } from 'vue';
import { BASIC_intComma } from '../../utils/utils'
import html2canvas from 'html2canvas'
import { NIcon, NSwitch, NPopover, NTooltip, NSelect, NModal, useMessage } from 'naive-ui'
import { Menu, Refresh, CameraOutline, SettingsOutline } from 'vicons/ionicons-v5'
const message = useMessage();

const props = defineProps({
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
        default: true,
        required: true
    },
    trackViewIndex: {
        default: 0
    },
    location: {
      type: Object,
      required: true
    },
    sessionId: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['shift', 'zoomIn', 'zoomOut', 'zoomTo', 'update:showTrackLabel', 'update:showVerticalLine'])

const railStyle = ({
        focused,
        checked
      }: {
        focused: boolean
        checked: boolean
      }) => {
        const style: CSSProperties = {}
        if (checked) {
          style.background = '#d03050'
          if (focused) {
            style.boxShadow = '0 0 0 2px #d0305040'
          }
        }
        else {
          style.background = '#2080f0'
          if (focused) {
            style.boxShadow = '0 0 0 2px #2080f040'
          }
        }
        return style
      }

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
    get: () => props.location.chrom,
    set: (value) => {
        emit('update:chrom', value)
    }
})

function formatGenomicRegion(bp) {
    if (bp < 1000) {
        return bp + " bp";
    } else if (bp < 1000000) {
        return (bp/1000).toFixed(1) + " Kb";
    } else {
        return (bp/1000000).toFixed(1) + " Mb";
    }
}

const chromValues = ref(props.chromNames.map((item) => {
    return {
        label: item,
        value: item
    }
}))

const start = computed(
    () => props.location.start
)

const end = computed(
    () => props.location.end
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

watch([() => props.location.chrom, () => props.location.start, () => props.location.end], () => {
    currentLocString.value = props.location.chrom + ':' + BASIC_intComma(props.location.start) + '-' + BASIC_intComma(props.location.end)
}, { immediate: true })


const handleLocationSearch = function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // 1. 验证格式是否符合 chrom:start-end
    const formatRegex = /^([^:]+):(\d+(?:,\d+)*)-(\d+(?:,\d+)*)$/;
    if (!formatRegex.test(currentLocString.value)) {
        message.error('Invalid format. Please use format: chrom:start-end');
        currentLocString.value = `${props.location.chrom}:${BASIC_intComma(props.location.start)}-${BASIC_intComma(props.location.end)}`;
        return;
    }

    // 解析位置信息
    const { chrom: newChrom, start: newStart, end: newEnd } = stringToLoc(currentLocString.value);

    // 2. 验证 chrom 是否在 chromSizes 中
    if (!props.chromSizes[newChrom]) {
        message.error(`Invalid chromosome: ${newChrom}`);
        // 重置显示的位置字符串
        currentLocString.value = `${props.location.chrom}:${BASIC_intComma(props.location.start)}-${BASIC_intComma(props.location.end)}`;
        return;
    }

    // 3. 验证 start 和 end 是否为数字
    if (isNaN(newStart) || isNaN(newEnd)) {
        message.error('Start and end positions must be numbers');
        currentLocString.value = `${props.location.chrom}:${BASIC_intComma(props.location.start)}-${BASIC_intComma(props.location.end)}`;
        return;
    }

    // 4. 验证 start 是否小于 end
    if (newStart >= newEnd) {
        message.error('Start position must be less than end position');
        currentLocString.value = `${props.location.chrom}:${BASIC_intComma(props.location.start)}-${BASIC_intComma(props.location.end)}`;
        return;
    }

    // 5. 验证 start 是否大于等于 1
    if (newStart < 1) {
        message.error('Start position must be greater than or equal to 1');
        currentLocString.value = `${props.location.chrom}:${BASIC_intComma(props.location.start)}-${BASIC_intComma(props.location.end)}`;
        return;
    }

    // 6. 验证 end 是否小于染色体长度
    const chromSize = props.chromSizes[newChrom];
    if (newEnd > chromSize) {
        message.error(`End position must be less than chromosome size (${BASIC_intComma(chromSize)})`);
        currentLocString.value = `${props.location.chrom}:${BASIC_intComma(props.location.start)}-${BASIC_intComma(props.location.end)}`;
        return;
    }

    // 所有验证通过，更新位置
    emit('zoomTo', newChrom, newStart, newEnd, props.trackViewIndex);
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