<template>
    <div class="track-item relative track-item-sortable mb-4 flex" ref="trackItem" :id="`${props.trackId}`">
        <!-- the canvas element -->
        <!-- https://stackoverflow.com/questions/38382734/flex-items-not-shrinking-when-window-gets-smaller -->
        <div ref="cvs_holder" class="relative track-content flex-auto mr-2"
            style="min-height: 60px;min-width: 0;overflow: hidden">
            <slot name="trackTitle"></slot>
            <slot name="canvas"></slot>
        </div>
        <!-- track drag handler -->
        <!-- <div class="absolute -bottom-2 left-0  w-full h-0.5 z-50 bg-gray-300"></div> -->
        <hr ref="resizeHandler"
            class="ui-resizable-handle ui-resizable-s absolute -bottom-2 left-0  w-full h-0.5  border-dashed border-t border-d border-gray-300 hover:border-blue-600 ">

    </div>
    <Dialog  v-model:visible="settingVisibile" header="Settings" :style="{ width: '220px' }" autoZIndex keepInViewPort
        position="right">
        <chart-setting></chart-setting>
    </Dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import 'jquery-ui/ui/widgets/resizable'
import { useTrackStore } from '@/browser/store';
import Dialog from 'primevue/dialog';
const settingVisibile = ref(false);
import { useSessionStore } from '../../browser/store/SessionStore/SessionStore'

const sessionStore = useSessionStore();

const ChartSetting = defineAsyncComponent(() =>
    import('../configurations/components/setting/ChartSetting.vue')
)
// import ChartSetting from '../configurations/components/setting/ChartSetting.vue'
// console.log('========================TrackItem start==================================')

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
    console.log(trackId)
    console.log(trackStore.targetTrack.selectId)
}
// console.log('========================TrackItem start222==================================')

const closeTrackHandle = (trackId) => {
    // console.log(sessionStore.getTargtedSession[0])
    
    sessionStore.removeSessionTrack(props.sessionId, trackId)
    // console.log(sessionStore.getTargtedSession[0].trackIds)
    // trackStore.removeTrackList([trackId])
}


const attr = ref(trackStore.findTrackById(props.trackId).attr)
// console.log('========================TrackItem start333==================================')

const cvs_holder = ref(null)
onMounted(() => {
    // await nextTick()
    // console.log(resizeHandler.value)
    $("#" + props.trackId).resizable(
        {
            handles: {
                s: resizeHandler.value
            },
            minHeight: trackStore.findTrackById(props.trackId).attr.h,
            maxHeight: trackStore.findTrackById(props.trackId).attr.maxHeight,
            helper: "resizable-helper",
            // animate: true, 
            start: function (e, ui) {
                // Manullay set the style of .track-item when resizing 
                trackItem.value.classList.add('resizable-helper')
            },
            resize: function (e, ui) {
                // console.log(ui.size.height)
                trackStore.findTrackById(props.trackId).attr.h = ui.size.height
                // cvs_holder.value.style.height = ui.size.height
                attr.value.h = ui.size.height
            },
            stop: function (e, ui) {
                // Manullay remove the style of .track-item when resizing 
                trackItem.value.classList.remove('resizable-helper')
                // JQeury resizable 会自动设置 width 和 height，需要手动清除
                trackItem.value.style.width = ''
                trackItem.value.style.height = ''
            }
        }
    )
})


// console.log('========================TrackItem end==================================')


const settingHandle = (id) => {

}


</script>
<style scoped>
.track-list:hover .track-config {
    display: block
}

.ui-icon {
    width: 16px;
    height: 16px;
    /* background-image: url(http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/images/ui-icons_222222_256x240.png) */
    /*{iconsContent}*/
    ;
}

.ui-resizable {
    position: relative;
}

.ui-resizable-handle {
    position: absolute;
    font-size: 0.1px;
    z-index: 99999;
    display: block;
}

.ui-resizable-disabled .ui-resizable-handle,
.ui-resizable-autohide .ui-resizable-handle {
    display: block;
}

.ui-resizable-n {
    cursor: n-resize;
    height: 7px;
    width: 100%;
    top: -5px;
    left: 0px;
}

/* .ui-resizable-s {
    cursor: s-resize;
    height: 7px;
    width: 100%;
    bottom: -5px;
    left: 0px;
} */

.ui-resizable-e {
    cursor: e-resize;
    width: 7px;
    right: -5px;
    top: 0px;
    height: 100%;
}

.ui-resizable-w {
    cursor: w-resize;
    width: 7px;
    left: -5px;
    top: 0px;
    height: 100%;
}

.ui-resizable-se {
    cursor: se-resize;
    width: 12px;
    height: 12px;
    right: 1px;
    bottom: 1px;
}

.ui-resizable-sw {
    cursor: sw-resize;
    width: 9px;
    height: 9px;
    left: -5px;
    bottom: -5px;
}

.ui-resizable-nw {
    cursor: nw-resize;
    width: 9px;
    height: 9px;
    left: -5px;
    top: -5px;
}

.ui-resizable-ne {
    cursor: ne-resize;
    width: 9px;
    height: 9px;
    right: -5px;
    top: -5px;
}

.ui-icon-gripsmall-diagonal-se {
    background-position: -64px -224px;
}


.resizable-helper {
    border: 2px dotted rgb(193, 193, 216);
    background-color: rgb(193, 193, 216, 0.4);
}
</style>@/browser2/store../store/SessionStore/SessionStore../store/SessionStore/SessionStore../store/SessionStore/SessionStore