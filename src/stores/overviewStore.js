import { defineStore } from 'pinia'

export const useOverviewStore = defineStore('overview', {
  state: () => ({
    overviewData: null
  }),
  actions: {
    setOverviewData(data) {
      this.overviewData = data
    },
    clearOverviewData() {
        this.overviewData = null
      }
  }
})