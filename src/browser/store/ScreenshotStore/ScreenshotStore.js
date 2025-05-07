// stores/screenshot.js
import { defineStore } from 'pinia'

export const useScreenshotStore = defineStore('screenshot', {
    state: () => ({
      timestamp: 0,
      screenshotType: 'svg',
      metadata: null
    }),
    
    actions: {
      triggerScreenshot(type = 'svg') {
        this.screenshotType = type
        this.timestamp = Date.now()
      },
      
      setScreenshotMetadata(metadata) {
        this.metadata = metadata
      }
    }
  })