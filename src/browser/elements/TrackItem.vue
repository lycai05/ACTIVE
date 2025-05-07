<template>
    <div class="track-item relative track-item-sortable  flex flex-col mb-1" ref="trackItem" :id="`${props.trackId}`">
        <div class="flex">
        <!-- https://stackoverflow.com/questions/38382734/flex-items-not-shrinking-when-window-gets-smaller -->
        <div ref="cvs_holder" class="relative track-content flex-auto mr-2"
            style="min-height: 10px;min-width: 0;overflow: hidden">
            <slot name="trackTitle"></slot>
            <slot name="canvas"></slot>
        </div>
        <!-- track drag handler -->
        <div class="track-item-config-holder track-item-drag-handler cursor-pointer bg-gray-300 rounded-r-lg relative w-6 flex-none flex flex-col justify-between items-center pt-1 pb-1"
            >

            <div class="controller flex flex-col items-center justify-around ">
                <div class="controller">
                    <slot name="controller"></slot>
                </div>

                <!-- settings -->
                <div class="track-item-setting text-gray-500 hover:text-primary-700 focus:text-primary-700" @click="mouseClickHandle($event, props.trackId);settingVisibile  = true">

                    <n-popover placement="right" trigger="click" width="240" class="flex flex-col items-center justify-center">
                        <template #trigger>

                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 1024 1024">
                        <path
                            d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1c0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1l74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3l-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2l-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9l-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5l-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5c0-15.3 1.2-30.6 3.7-45.5l6.5-40l-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2l31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3l17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97l38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8l92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176s176-78.8 176-176s-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z"
                            fill="currentColor"></path>
                    </svg>
                    </template>

                    <chart-setting></chart-setting>
                    <n-divider />
                    <n-button 
                        class="btn close justify-center flex items-center rounded text-gray-500 hover:text-white hover:bg-red-500 focus:text-white focus:bg-red-600 transition-colors"
                        @click="closeTrackHandle(props.trackId)"
                    >
                        <!-- <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            aria-hidden="true">
                            <path
                                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z">
                            </path>
                        </svg> -->
                        <span>Remove Track</span>
                    </n-button>
                    </n-popover>
                </div>

                <!-- drag to order -->
                <!-- <div class="track-item-drag-handler text-gray-500 hover:text-primary-700 focus:text-primary-700">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 1024 1024">
                        <path
                            d="M909.3 506.3L781.7 405.6a7.23 7.23 0 0 0-11.7 5.7V476H548V254h64.8c6 0 9.4-7 5.7-11.7L517.7 114.7a7.14 7.14 0 0 0-11.3 0L405.6 242.3a7.23 7.23 0 0 0 5.7 11.7H476v222H254v-64.8c0-6-7-9.4-11.7-5.7L114.7 506.3a7.14 7.14 0 0 0 0 11.3l127.5 100.8c4.7 3.7 11.7.4 11.7-5.7V548h222v222h-64.8c-6 0-9.4 7-5.7 11.7l100.8 127.5c2.9 3.7 8.5 3.7 11.3 0l100.8-127.5c3.7-4.7.4-11.7-5.7-11.7H548V548h222v64.8c0 6 7 9.4 11.7 5.7l127.5-100.8a7.3 7.3 0 0 0 .1-11.4z"
                            fill="currentColor"></path>
                    </svg>
                </div> -->
            </div>
                        <!-- close button -->


        </div>
    </div>
        <!-- <div class="absolute -bottom-2 left-0  w-full h-0.5 z-50 bg-gray-300"></div> -->
        <div ref="resizeHandler"
            class="ui-resizable-handle ui-resizable-s mt-1  w-full h-0.5  border-dashed border-t border-d border-gray-300 hover:border-blue-600 " >
        </div>

    </div>
    <!-- <Dialog  v-model:visible="settingVisibile" header="Settings" :style="{ width: '220px' }" autoZIndex keepInViewPort
        position="right">
        <chart-setting></chart-setting>
    </Dialog> -->
</template>

<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
// import 'jquery-ui/ui/widgets/resizable'
import { NPopover } from 'naive-ui';
import { useTrackStore } from '@/browser/store';
// import Dialog from 'primevue/dialog';
const settingVisibile = ref(false);
import { useSessionStore } from '@/browser/store/SessionStore/SessionStore'

const sessionStore = useSessionStore();

const ChartSetting = defineAsyncComponent(() =>
    import('../configurations/components/setting/ChartSetting.vue')
)
// const ChartSetting = defineAsyncComponent(() =>
//     import('../configurations/components/setting/ChartSetting.vue')
// )


// define props
const props = defineProps({
    trackId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    }
})

const canvas = ref(null)
const trackStore = useTrackStore()
const trackItem = ref(null)
const resizeHandler = ref(null)
export interface Window {
    $loading: any
    $vue: any
    $KeyboardActive?: { [T: string]: boolean }
}
// console.log('========================TrackItem start111==================================')

const mouseClickHandle = (e: MouseEvent, trackId) => {
    e.preventDefault()
    e.stopPropagation()
    // if (item.status.lock) return
    // 若此时按下了 CTRL, 表示多选
    if (e.ctrlKey) {
        // 若已选中，则去除
        if (trackStore.targetTrack.selectId.includes(trackId)) {
            const exList = trackStore.targetTrack.selectId.filter(e => e !== trackId)
            trackStore.setTargetSelectTrack(exList)
        } else {
            trackStore.setTargetSelectTrack(trackId, true)
        }
    } else {
        trackStore.setTargetSelectTrack(trackId, false)
    }
    // console.log(trackId)
    // console.log(trackStore.targetTrack.selectId)
}
// console.log('========================TrackItem start222==================================')
function removeElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  } else {
    console.log('Element not found!');
  }
}

// Example usage:
const closeTrackHandle = (trackId) => {
    // console.log(sessionStore.getTargtedSession[0])
    
    sessionStore.removeSessionTrack(props.sessionId, trackId)
    // console.log(sessionStore.getTargtedSession[0].trackIds)
   trackStore.removeTrackList([trackId])
   removeElementById(trackId);

}


const attr = ref(trackStore.findTrackById(props.trackId).attr)
// console.log('========================TrackItem start333==================================')

const cvs_holder = ref(null)
onMounted(() => {

    // $("#" + props.trackId).resizable(
    //     {
    //         handles: {
    //             s: resizeHandler.value
    //         },
    //         minHeight: trackStore.findTrackById(props.trackId).attr.minHeight,
    //         maxHeight: trackStore.findTrackById(props.trackId).attr.maxHeight,
    //         helper: "resizable-helper",
    //         // animate: true, 
    //         start: function (e, ui) {
    //             // Manullay set the style of .track-item when resizing 
    //             console.log('resize')
    //             trackItem.value.classList.add('resizable-helper')
    //         },
    //         resize: function (e, ui) {
    //             console.log(ui.size.height)
    //             trackStore.findTrackById(props.trackId).attr.h = ui.size.height
    //             // cvs_holder.value.style.height = ui.size.height
    //             attr.value.h = ui.size.height
    //         },
    //         stop: function (e, ui) {
    //             // Manullay remove the style of .track-item when resizing 
    //             trackItem.value.classList.remove('resizable-helper')
    //             // JQeury resizable 会自动设置 width 和 height，需要手动清除
    //             trackItem.value.style.width = ''
    //             trackItem.value.style.height = ''
    //         }
    //     }
    // )


    function checkHeight() {
        const height = cvs_holder.value.offsetHeight;
        if (height > 50) {
            trackItem.value.classList.add('unfolded');
        } else {
            trackItem.value.classList.remove('unfolded');
        }
    }

    // Initial check
    checkHeight();

})

</script>
<style scoped>
.track-list:hover .track-config {
    display: block
}

.ui-resizable {
    position: relative;
}

.ui-resizable-handle {
    font-size: 0.1px;
    z-index: 10;
    display: block;
}

.ui-resizable-disabled .ui-resizable-handle,
.ui-resizable-autohide .ui-resizable-handle {
    display: block;
}

.resizable-helper {
    border: 2px dotted rgb(193, 193, 216);
    background-color: rgb(193, 193, 216, 0.4);
}

/* On hover, display the buttons if track-item is not too small */
.track-item-config-holder .btn.close,
.track-item-config-holder .track-item-drag-handler {
    display: none;
}

/* On hover, display the buttons if track-item is not too small */
.track-item-config-holder:hover .btn.close,
.track-item-config-holder:hover .track-item-drag-handler {
    display: block;
}

/* Specific class for when track-item is too small */
.track-item.unfolded .btn.close,
.track-item.unfolded .track-item-setting, 
.track-item.unfolded .track-item-drag-handler
{
    display: block 
}
</style>