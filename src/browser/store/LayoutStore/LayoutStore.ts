import { defineStore } from 'pinia'

export const useLayoutStore = defineStore({
    id: 'useLayoutStore',
    state: () => ({
        LeftPanelWidth: 65,
        CenterPanelWidth: 0,
        RightPanelWidth: 28,
        showSessionInitModal: false,
        menuWidth: 65
    }),
    getters: {

    },
    actions: {
        setCenterPanelWidth(windowSize: number) {
            this.CenterPanelWidth = windowSize - this.LeftPanelWidth - this.RightPanelWidth
        },
        setRightPanelWidth(collapsed: boolean) {
            this.RightPanelWidth = collapsed ? 28 : 214
        },
        toggleMenuWidth() {
            this.LeftPanelWidth = this.LeftPanelWidth === 65 ? 330 : 65
        },
        toggleSessionInitModal() {
            this.showSessionInitModal = !this.showSessionInitModal
        }
    }
})