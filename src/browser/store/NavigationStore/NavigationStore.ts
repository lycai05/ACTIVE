// stores/navigationStore.ts
import { defineStore } from 'pinia'

interface GenomicRegion {
  chrom: string
  start: number
  end: number
  max: number
  min: number
  size: number
}

interface InitialPosition {
    chrom: string
    start: number
    end: number
  }

interface ChromosomeData {
  chromSizes: Record<string, number>
  chromBands: any | null
  chromNames: string[]
}

interface NavigationState extends ChromosomeData {
  trackViews: GenomicRegion[]
  activeTrackViewIndex: number
  id: string
}

export const createNavigationStore = (id: string = 'default') => {
  const storeId = `navigation-${id}`
  
  return defineStore(storeId, {
    state: (): NavigationState => ({
      trackViews: [],
      activeTrackViewIndex: 0,
      chromSizes: {},
      chromBands: null,
      chromNames: [],
      id: id
    }),

    actions: {
      initializeChromosomeData(assembly: any) {
        this.chromSizes = assembly.chromSizes
        this.chromBands = assembly.chromBands || null
        this.chromNames = []

        for (let chromName in this.chromSizes) {
          this.chromNames.push(chromName)
        }
        
        this.sortChromNames()
      },

      sortChromNames() {
        this.chromNames.sort((p, q) => {
          let a = 0, b = 0, x = 0
          if (p.substr(0, 3) == 'chr') {
            x = 3
          } else if (p.substr(0, 9) == 'scaffold_') {
            x = 9
          }

          a = parseInt(p.substr(x))
          b = parseInt(q.substr(x))
          let c = a - b

          if (!isNaN(c)) return c
          if (isNaN(a) && isNaN(b)) return p < q ? -1 : 1
          if (isNaN(a)) return 1
          if (isNaN(b)) return -1
          return 0
        })
      },

      initialize(assembly: any) {
          this.initializeChromosomeData(assembly)
    
          // Handle both array and single object cases for backward compatibility
          const initialPositions: InitialPosition[] = Array.isArray(assembly.initPos) 
            ? assembly.initPos 
            : [assembly.initPos]
    
          // Initialize track views from initial positions
          this.trackViews = initialPositions.map(pos => ({
            chrom: pos.chrom || 'chr1',
            start: pos.start || 1000000,
            end: pos.end || 1500000,
            max: this.chromSizes[pos.chrom || 'chr1'],
            min: 0,
            size: this.chromSizes[pos.chrom || 'chr1']
          }))
    
          // If no valid positions were provided, create a default track view
          if (this.trackViews.length === 0) {
            this.trackViews = [{
              chrom: 'chr1',
              start: 1000000,
              end: 1500000,
              max: this.chromSizes['chr1'],
              min: 0,
              size: this.chromSizes['chr1']
            }]
          }
    
          this.activeTrackViewIndex = 0
        },

      // Add a new track view
      addTrackView(params: { chrom: string, start: number, end: number }) {
        const newTrack: GenomicRegion = {
          chrom: params.chrom,
          start: params.start,
          end: params.end,
          max: this.chromSizes[params.chrom],
          min: 0,
          size: this.chromSizes[params.chrom]
        }
        this.trackViews.push(newTrack)
        this.activeTrackViewIndex = this.trackViews.length - 1
      },

      // Remove a track view by index
      removeTrackView(index: number) {
        if (this.trackViews.length > 1) {
          this.trackViews = this.trackViews.filter((_, i) => i !== index)
          if (this.activeTrackViewIndex >= this.trackViews.length) {
            this.activeTrackViewIndex = this.trackViews.length - 1
          }
        }
      },

      // Set active track
      setActiveTrack(index: number) {
        if (index >= 0 && index < this.trackViews.length) {
          this.activeTrackViewIndex = index
        }
      },

      zoomTo(params: { chrom?: string, start: number, end: number }, activeTrackViewIndex?: number, minRegionSize: number = 1, forceZoom: boolean = true) {
          // 确保 activeTrackViewIndex 是有效的才更新
          if (typeof activeTrackViewIndex === 'number' && activeTrackViewIndex !== this.activeTrackViewIndex) {
            this.setActiveTrack(activeTrackViewIndex)
          }
    
          const track = this.trackViews[this.activeTrackViewIndex]
          if (!track) {
            console.warn('No track found at index:', this.activeTrackViewIndex)
            return
          }
    
          if (!params.chrom) {
            params.chrom = track.chrom
          }
    
          if (track.chrom != params.chrom) {
            track.chrom = params.chrom
            track.max = this.chromSizes[params.chrom]
            track.size = this.chromSizes[params.chrom]
          }
    
          const size = track.size
          const s = Math.max(params.start, 1)
          const e = Math.min(params.end, size)
    
          const start = Math.round(s)
          const end = Math.round(e)
    
          if (end - start >= minRegionSize && forceZoom) {
            // 使用响应式更新
            this.trackViews[this.activeTrackViewIndex] = {
              ...track,
              start,
              end
            }
          }
          
          return {
            success: end - start >= minRegionSize && forceZoom,
            start,
            end
          }
        },

      zoomIn(activeTrackViewIndex?: number, minRegionSize: number = 1, forceZoom: boolean = true) {
        if (typeof activeTrackViewIndex === 'number' && activeTrackViewIndex !== this.activeTrackViewIndex) {
          this.setActiveTrack(activeTrackViewIndex)
        }
        const track = this.trackViews[this.activeTrackViewIndex]
        const s = track.start
        const e = track.end
        const m = (s + e) / 2
        const x = (e - s + 1) / 4
        return this.zoomTo({
          chrom: track.chrom,
          start: Math.round(m - x),
          end: Math.round(m + x) - 1
        }, this.activeTrackViewIndex, minRegionSize, forceZoom)
      },

      zoomOut(activeTrackViewIndex?: number, minRegionSize: number = 1, forceZoom: boolean = true) {
        if (typeof activeTrackViewIndex === 'number' && activeTrackViewIndex !== this.activeTrackViewIndex) {
          this.setActiveTrack(activeTrackViewIndex)
        }
        const track = this.trackViews[this.activeTrackViewIndex]
        const s = track.start
        const e = track.end
        const m = (s + e) / 2
        const x = Math.max(1, e - s)
        return this.zoomTo({
          chrom: track.chrom,
          start: Math.round(m - x),
          end: Math.round(m + x) + 1
        }, this.activeTrackViewIndex, minRegionSize, forceZoom)
      },

      handleShift(ev: { ctrlKey: boolean, shiftKey: boolean }, direction: number, activeTrackViewIndex?: number, minRegionSize: number = 1, forceZoom: boolean = true) {
        if (typeof activeTrackViewIndex === 'number' && activeTrackViewIndex !== this.activeTrackViewIndex) {
          this.setActiveTrack(activeTrackViewIndex)
        }
        const track = this.trackViews[this.activeTrackViewIndex]
        const span = track.end - track.start + 1
        let delta = ev.ctrlKey ? (ev.shiftKey ? 0.95 : 0.475) : 0.1
        delta *= direction * span
        return this.zoomTo({
          chrom: track.chrom,
          start: track.start + delta,
          end: track.end + delta
        }, this.activeTrackViewIndex, minRegionSize, forceZoom)
      }
    },

    getters: {
      currentTrackView(): GenomicRegion {
        return this.trackViews[this.activeTrackViewIndex]
      },
      
      currentRegionSize(): number {
        const track = this.trackViews[this.activeTrackViewIndex]
        return track.end - track.start
      }
    }
  })
}

// 创建一个函数来获取或创建store实例
export const useNavigationStore = (id: string = 'default') => {
  return createNavigationStore(id)()
}