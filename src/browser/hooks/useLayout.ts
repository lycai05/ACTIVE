import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useLayoutStore } from '../store/LayoutStore/LayoutStore'

export function useMiddlePanelWidth() {
    const { width } = useWindowSize()
    const LayoutStore = useLayoutStore()
    const eleWidth = computed(() => {
        // console.log(width.value - LayoutStore.LeftPanelWidth - LayoutStore.RightPanelWidth)
        return width.value - LayoutStore.LeftPanelWidth - LayoutStore.RightPanelWidth
    })

    return {
        eleWidth
    }
}